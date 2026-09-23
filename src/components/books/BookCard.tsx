import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, Trash2, Users } from 'lucide-react';
import { IconButton, Tooltip } from '@mui/material';
import type { Book } from '../../types/user.types';

interface BookCardProps {
  book: Book;
  onDelete: (id: string) => void;
  userId: string;
  onRequestAccess: (id: string) => Promise<void>;
}

const BookCard: React.FC<BookCardProps> = ({ book, onDelete, userId, onRequestAccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this book?')) return;
    setDeleting(true);
    try { await onDelete(book._id); } finally { setDeleting(false); }
  };

  const isOwner = book.ownerId === userId;
  const canEdit = book.canEdit || isOwner;
  const requestAccess = async () => {
    setRequesting(true);
    try { await onRequestAccess(book._id); } finally { setRequesting(false); }
  };

  const formattedDate = new Date(book.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} className="group relative flex min-h-56 flex-col overflow-hidden rounded-2xl border border-[#e4ded4] bg-[#fffdf8] p-6 shadow-[0_12px_35px_rgba(67,56,42,0.06)]">
      <div className="mb-7 flex items-center justify-between">
        <span className="rounded-full bg-[#f7e6c5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#985c09]">Book</span>
        <Link to={`/books/${book._id}`} aria-label={`Open ${book.title}`} className="rounded-full bg-[#f4f0e8] p-2 text-[#8a9291] transition-colors hover:bg-[#e08a18] hover:text-[#202b2f]"><ArrowUpRight size={17} /></Link>
      </div>
      <Link to={`/books/${book._id}`} className="font-serif text-2xl font-semibold leading-tight text-[#20252b] transition-colors hover:text-[#b45f00]">{book.title}</Link>
      <p className="mt-1 text-xs text-[#8b9391]">by {isOwner ? 'you' : book.ownerName || 'another author'}</p>
      {book.description ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#7b8385]">{book.description}</p> : <p className="mt-2 text-sm italic text-[#a3aaa9]">No description provided.</p>}
      <div className="mt-auto flex items-center gap-4 border-t border-[#eee9e1] pt-4 text-xs text-[#8b9391]">
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} />{formattedDate}</span>
        {book.collaborators.length > 0 && <span className="inline-flex items-center gap-1.5" title={book.collaborators.map((collaborator) => typeof collaborator === 'string' ? collaborator : collaborator.username).join(', ')}><Users size={13} />{book.collaborators.length}</span>}
        {isOwner && <Tooltip title="Delete book"><IconButton size="small" onClick={handleDelete} disabled={deleting} aria-label={`Delete book: ${book.title}`} sx={{ marginLeft: 'auto', color: '#b9574e', opacity: 0, '.group:hover &': { opacity: 1 } }}><Trash2 size={16} /></IconButton></Tooltip>}
      </div>
      {!isOwner && !canEdit && <button type="button" onClick={() => void requestAccess()} disabled={requesting || book.editRequestStatus === 'pending'} className="mt-4 rounded-lg border border-[#d97706] px-3 py-2 text-xs font-bold text-[#985c09] transition hover:bg-[#f7e6c5] disabled:cursor-not-allowed disabled:opacity-60">{book.editRequestStatus === 'pending' ? 'Access requested' : requesting ? 'Requesting...' : 'Request edit access'}</button>}
      {!isOwner && canEdit && <span className="mt-4 text-xs font-semibold text-[#4d7f59]">Editing approved</span>}
    </motion.article>
  );
};

export default BookCard;
