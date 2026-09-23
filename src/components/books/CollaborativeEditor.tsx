import { useEffect, useRef, useState } from 'react';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { Editor, EditorStatus, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import type { Page } from '../../types/page.types';
import { useAppDispatch } from '../../store/hooks';
import { clearRoomPresence, setRoomPresence } from '../../store/collaborationSlice';

interface Props {
  page: Page;
  onContentSaved: (content: string) => Promise<void>;
  editable?: boolean;
  username?: string;
}

const socketUrl = import.meta.env.VITE_YJS_URL || 'ws://localhost:1234';

const accessToken = () => document.cookie.split('; ').find((cookie) => cookie.startsWith('accessToken='))?.split('=')[1] || '';

const collaborationLog = (room: string, message: string, details?: unknown) => {
  if (details === undefined) console.log(`[collaboration] ${room}: ${message}`);
  else console.log(`[collaboration] ${room}: ${message}`, details);
};

const CollaborativeEditorContent = ({ page, onContentSaved, editable = true, username = 'Collaborator' }: Props) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('Connecting');
  const [synced, setSynced] = useState(false);
  const [presence, setPresence] = useState<string[]>([]);
  const [lastError, setLastError] = useState('');
  const providerRef = useRef<WebsocketProvider | null>(null);
  const collaborationConnectedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomName = `book-${page.bookId}-page-${page._id}`;

  useEditor((root) => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(socketUrl, roomName, ydoc, { params: { token: accessToken() } });
    providerRef.current = provider;
    collaborationLog(roomName, `connecting to ${socketUrl}/${roomName}`);
    provider.awareness.setLocalStateField('user', { name: username, color: '#f59e0b' });
    const updatePresence = () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const localState = provider.awareness.getLocalState();
      const names = Array.from(provider.awareness.getStates().values()).map((state) => {
        const collaborator = state.user as { name?: string } | undefined;
        return collaborator?.name || 'Collaborator';
      });
      setPresence(names);
      collaborationLog(roomName, `awareness updated: ${states.length} user(s), local cursor ${localState?.cursor ? 'present' : 'waiting'}`);
      dispatch(setRoomPresence({ room: roomName, users: states.map(([clientId, state]) => {
        const collaborator = state.user as { name?: string; color?: string } | undefined;
        return { clientId, name: collaborator?.name || 'Collaborator', color: collaborator?.color || '#d97706' };
      }) }));
    };
    provider.on('status', ({ status: nextStatus }: { status: string }) => {
      const connected = nextStatus === 'connected';
      setStatus(connected ? 'Connected' : 'Disconnected');
      if (!connected) setSynced(false);
      collaborationLog(roomName, `websocket ${nextStatus}`);
    });
    provider.on('sync', (isSynced: boolean) => {
      setSynced(isSynced);
      collaborationLog(roomName, isSynced ? 'initial document sync complete' : 'document sync lost');
    });
    provider.on('connection-error', (event: Event) => {
      const message = event instanceof ErrorEvent ? event.message : 'Websocket connection error';
      setLastError(message || 'Websocket connection error');
      collaborationLog(roomName, 'websocket connection error', event);
    });
    provider.on('connection-close', (event: CloseEvent | null) => {
      const message = event ? `Socket closed (${event.code}${event.reason ? `: ${event.reason}` : ''})` : 'Socket closed by provider';
      setLastError(message);
      collaborationLog(roomName, message);
    });
    provider.awareness.on('change', updatePresence);
    updatePresence();

    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, '');
        ctx.set(editorViewOptionsCtx, { editable: () => editable });
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          if (!collaborationConnectedRef.current) {
            collaborationLog(roomName, 'ignored markdown update before collaboration was ready');
            return;
          }
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          saveTimerRef.current = setTimeout(() => {
            collaborationLog(roomName, 'saving markdown to API');
            void onContentSaved(markdown);
          }, 1500);
        });
        ctx.get(collabServiceCtx).bindDoc(ydoc).setAwareness(provider.awareness);
      })
      .use(commonmark)
      .use(history)
      .use(listener)
      .use(collab);
  }, [page._id, editable, username, dispatch, roomName]);
  const [editorLoading, getEditor] = useInstance();

  useEffect(() => {
    if (editorLoading || !synced || collaborationConnectedRef.current) return;
    const editor = getEditor();
    if (!editor) return;
    const connectCollaboration = (status: EditorStatus) => {
      if (status !== EditorStatus.Created || collaborationConnectedRef.current) return;
      editor.action((ctx) => {
        const service = ctx.get(collabServiceCtx);
        service.applyTemplate(page.content || '# New page\n\nStart writing together.').connect();
        collaborationConnectedRef.current = true;
        collaborationLog(roomName, 'Milkdown collaboration service connected');
      });
    };
    if (editor.status === EditorStatus.Created) connectCollaboration(editor.status);
    else editor.onStatusChange(connectCollaboration);
  }, [editorLoading, getEditor, page.content, roomName, synced]);

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    collaborationLog(roomName, 'destroying editor and websocket provider');
    collaborationConnectedRef.current = false;
    providerRef.current?.destroy();
    providerRef.current = null;
    dispatch(clearRoomPresence(roomName));
  }, [dispatch, roomName]);

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#fffdf8]">
      <div className="flex items-center justify-between border-b border-[#e1dbd1] bg-[#faf7f1] px-5 py-3 text-xs text-[#7b8385]">
        <span className="inline-flex min-w-0 items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${status === 'Connected' ? 'bg-[#4d9a67]' : status === 'Read only' ? 'bg-[#8b9391]' : 'bg-[#d97706]'}`} />{status} {presence.length > 0 ? `· ${presence.join(', ')}` : ''}</span>
        <span>{synced ? 'Synced live' : status === 'Connected' ? 'Syncing...' : 'Reconnecting...'}</span>
      </div>
      <div className="border-b border-[#eee8de] bg-[#fffaf2] px-5 py-2 text-[11px] text-[#7b8385] sm:px-12">
        <span>Room: {roomName}</span><span className="mx-2">·</span><span>Awareness: {presence.length} user{presence.length === 1 ? '' : 's'}</span>
        {lastError && <><span className="mx-2">·</span><span className="text-[#b9574e]">{lastError}</span></>}
      </div>
      <div className="milkdown-shell min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-12">
        <Milkdown />
      </div>
    </section>
  );
};

const CollaborativeEditor = (props: Props) => (
  <MilkdownProvider>
    <CollaborativeEditorContent {...props} />
  </MilkdownProvider>
);

export default CollaborativeEditor;