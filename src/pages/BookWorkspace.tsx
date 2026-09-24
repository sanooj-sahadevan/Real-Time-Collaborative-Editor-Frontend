import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, IconButton, Tooltip } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useBooks } from '../hooks/useBooks';
import { usePages } from '../hooks/usePages';
import { editApi, pageApi, type EditRequest } from '../api/pages';
import type { Page } from '../types/page.types';
import CollaborativeEditor from '../components/books/CollaborativeEditor';
import { useAppDispatch } from '../store/hooks';
import { setBookCollaborators } from '../store/collaborationSlice';
import { useToast } from '../context/ToastContext';

const SortablePage = ({ page, active, canEdit, onSelect, onRename, onDelete }: { page: Page; active: boolean; canEdit: boolean; onSelect: () => void; onRename: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: page._id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`group mx-3 flex items-center gap-1 rounded-lg border-l-2 px-2 py-2 ${active ? 'border-[#e08a18] bg-[#f7e6c5] text-[#7c4a08]' : 'border-transparent text-[#7b8385] hover:bg-[#f3eee6] hover:text-[#20252b]'}`}>
      {canEdit && <button type="button" {...attributes} {...listeners} aria-label={`Move ${page.title}`} className="cursor-grab text-[#a0a6a4] hover:text-[#5e696a]"><GripVertical size={16} /></button>}
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate text-left text-sm font-medium">{page.title}</button>
      {canEdit && <Tooltip title="Rename"><IconButton size="small" onClick={onRename} aria-label={`Rename ${page.title}`} sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, color: '#7b8385' }}><MoreHorizontal size={16} /></IconButton></Tooltip>}
      {canEdit && <Tooltip title="Delete"><IconButton size="small" onClick={onDelete} aria-label={`Delete ${page.title}`} sx={{ opacity: 0, '.group:hover &': { opacity: 1 }, color: '#b9574e' }}><Trash2 size={14} /></IconButton></Tooltip>}
    </div>
  );
};

const BookWorkspace = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { books, loading: booksLoading, publishBook } = useBooks();
  const { pages, book: workspaceBook, loading, error, createPage, renamePage, deletePage, reorderPages } = usePages(bookId || '');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [titleDraft, setTitleDraft] = useState('');
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [requestState, setRequestState] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const activePageId = selectedId || pages[0]?._id;

  useEffect(() => {
    if (bookId && workspaceBook?.ownerId === user?._id) {
      void editApi.list(bookId).then(setEditRequests).catch(() => setEditRequests([]));
    }
  }, [bookId, user?._id, workspaceBook?.ownerId]);

  useEffect(() => {
    if (bookId && workspaceBook) dispatch(setBookCollaborators({ bookId, collaborators: workspaceBook.collaborators }));
  }, [bookId, dispatch, workspaceBook]);

  if (authLoading || booksLoading || loading) return <div className="flex min-h-screen items-center justify-center bg-[#f6f3ed] text-[#7b8385]">Loading workspace...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const book = books.find((item) => item._id === bookId) || workspaceBook;
  if (!book) return <div className="p-8 text-slate-300">Book not found or access denied.</div>;
  const canEdit = workspaceBook?.canEdit ?? book.ownerId === user._id;
  const currentRequestState = requestState ?? workspaceBook?.editRequestStatus ?? null;
  const selected = pages.find((page) => page._id === activePageId);
  const handleCreate = async () => { const page = await createPage(); setSelectedId(page._id); };
  const handleDragEnd = (event: DragEndEvent) => {
    if (!canEdit) return;
    if (!event.over || event.active.id === event.over.id) return;
    const ids = pages.map((page) => page._id);
    const from = ids.indexOf(String(event.active.id));
    const to = ids.indexOf(String(event.over.id));
    ids.splice(from, 1); ids.splice(to, 0, String(event.active.id));
    void reorderPages(ids);
  };
  const startRename = (page: Page) => { setRenamingId(page._id); setRenameValue(page.title); };
  const finishRename = async () => { if (renamingId && renameValue.trim()) await renamePage(renamingId, renameValue.trim()); setRenamingId(null); };
  const saveTitle = async () => { if (selected && titleDraft.trim() && titleDraft.trim() !== selected.title) await renamePage(selected._id, titleDraft.trim()); };
  const requestEditing = async () => {
    try { await editApi.request(bookId || ''); setRequestState('pending'); showToast('Edit request sent.', 'success'); }
    catch { showToast('Unable to send the edit request.', 'error'); }
  };
  const resolveRequest = async (request: EditRequest, status: 'approved' | 'rejected') => {
    try {
      await editApi.resolve(bookId || '', request._id, status);
      setEditRequests((items) => items.map((item) => item._id === request._id ? { ...item, status } : item));
      showToast(status === 'approved' ? 'Edit access approved.' : 'Edit request rejected.', 'success');
    } catch { showToast('Unable to update the edit request.', 'error'); }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f3ed] text-[#20252b]">
      {error && <Alert severity="error" square>{error}</Alert>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1dbd1] bg-[#fffdf8] px-5 py-3 text-sm sm:px-8">
        <span className="flex flex-wrap items-center gap-2 text-[#7b8385]"><span className="font-semibold text-[#20252b]">{book.title}</span><span className="rounded-full bg-[#f3eee6] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]">{book.isPublished ? 'Published' : 'Private draft'}</span>{!canEdit && <span className="font-semibold text-[#985c09]">Read Only</span>}{canEdit && !book.isPublished && <span className="font-semibold text-[#7b8385]">Owner</span>}</span>
        <div className="flex items-center gap-2">
          {canEdit && !book.isPublished && <button type="button" onClick={() => void publishBook(book._id)} className="rounded-lg bg-[#263238] px-3 py-2 text-xs font-semibold text-white">Publish</button>}
          {!canEdit && book.isPublished && <>{currentRequestState === 'pending' ? <span className="text-xs font-semibold text-[#985c09]">Edit request pending</span> : currentRequestState === 'approved' ? <span className="text-xs font-semibold text-[#4d7f59]">Editing approved</span> : <button type="button" onClick={() => void requestEditing()} className="rounded-lg bg-[#263238] px-3 py-2 text-xs font-semibold text-white">Request Edit Access</button>}</>}
        </div>
      </div>
      {workspaceBook?.ownerId === user._id && editRequests.some((request) => request.status === 'pending') && <div className="border-b border-[#e1dbd1] bg-[#fffdf8] px-5 py-4 sm:px-8"><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#b45f00]">Access requests</p><div className="flex flex-wrap gap-2">{editRequests.filter((request) => request.status === 'pending').map((request) => { const requester = typeof request.userId === 'string' ? request.userId : request.userId.username; return <div key={request._id} className="flex items-center gap-2 rounded-lg border border-[#e4ded4] bg-[#faf7f1] px-3 py-2 text-sm"><span>{requester}</span><button type="button" onClick={() => void resolveRequest(request, 'approved')} className="font-semibold text-[#4d7f59]">Approve</button><button type="button" onClick={() => void resolveRequest(request, 'rejected')} className="font-semibold text-[#b9574e]">Reject</button></div>; })}</div></div>}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="w-full border-b border-[#e1dbd1] bg-[#fffdf8] md:w-72 md:border-b-0 md:border-r"><div className="flex items-center justify-between px-5 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b45f00]">Structure</p><h2 className="mt-1 font-serif text-xl font-semibold">Pages</h2></div>{canEdit && <Tooltip title="New page"><IconButton onClick={() => void handleCreate()} aria-label="New page" sx={{ color: '#b45f00', backgroundColor: '#f7e6c5', '&:hover': { backgroundColor: '#f3d79f' } }}><Plus size={18} /></IconButton></Tooltip>}</div>
          {pages.length === 0 ? <div className="mx-4 mb-5 rounded-xl border border-dashed border-[#d9d3c9] px-4 py-5 text-sm leading-6 text-[#8b9391]">No pages yet. Create the first one to begin your manuscript.</div> : <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={pages.map((page) => page._id)} strategy={verticalListSortingStrategy}>{pages.map((page) => renamingId === page._id && canEdit ? <div key={page._id} className="px-4 py-1"><input autoFocus value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onBlur={() => void finishRename()} onKeyDown={(event) => { if (event.key === 'Enter') void finishRename(); }} className="w-full rounded-lg border border-[#d9d3c9] bg-[#fffdf8] px-3 py-2 text-sm text-[#20252b] outline-none ring-2 ring-[#f3d79f]" /> </div> : <SortablePage key={page._id} page={page} canEdit={canEdit} active={page._id === selected?._id} onSelect={() => setSelectedId(page._id)} onRename={() => startRename(page)} onDelete={() => { if (confirm(`Delete ${page.title}?`)) void deletePage(page._id); }} />)}</SortableContext></DndContext>}
        </aside>
        {selected ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[70vh] min-w-0 flex-1 flex-col"><div className="border-b border-[#e1dbd1] bg-[#fffdf8] px-5 py-5 sm:px-12"><input readOnly={!canEdit} value={titleDraft || selected.title} onFocus={() => setTitleDraft(selected.title)} onChange={(event) => setTitleDraft(event.target.value)} onBlur={() => { void saveTitle(); setTitleDraft(''); }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} className="w-full bg-transparent font-serif text-3xl font-semibold text-[#20252b] outline-none placeholder:text-[#9aa0a4]" aria-label="Page title" /></div><CollaborativeEditor key={selected._id} page={selected} editable={canEdit} userId={user._id} username={user.username} onContentSaved={async (content) => { if (canEdit) await pageApi.update(selected._id, { content }); }} /></motion.div> : <div className="flex flex-1 items-center justify-center p-8 text-center text-[#8b9391]"><div><p className="font-serif text-2xl text-[#20252b]">Your manuscript is ready.</p><p className="mt-2 text-sm">Create a page to begin writing.</p>{canEdit && <button type="button" onClick={() => void handleCreate()} className="mt-5 rounded-lg bg-[#263238] px-4 py-3 text-sm font-semibold text-white hover:bg-[#37474f]">Create page</button>}</div></div>}
      </div>
    </main>
  );
};

export default BookWorkspace;