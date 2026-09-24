import { useEffect, useRef, useState } from 'react';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { Editor, EditorStatus, commandsCtx, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import type { CmdKey } from '@milkdown/core';
import { commonmark, insertHrCommand, toggleEmphasisCommand, toggleInlineCodeCommand, toggleLinkCommand, toggleStrongCommand, wrapInBlockquoteCommand, wrapInBulletListCommand, wrapInHeadingCommand, wrapInOrderedListCommand } from '@milkdown/preset-commonmark';
import { history, redoCommand, undoCommand } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { Bold, Code2, Heading1, Heading2, Italic, Link, List, ListOrdered, Minus, Quote, Redo2, Undo2 } from 'lucide-react';
import type { Page } from '../../types/page.types';
import { useAppDispatch } from '../../store/hooks';
import { clearRoomPresence, setRoomPresence } from '../../store/collaborationSlice';

interface Props {
  page: Page;
  onContentSaved: (content: string) => Promise<void>;
  editable?: boolean;
  username?: string;
  userId?: string;
}

const socketUrl = import.meta.env.VITE_YJS_URL || 'ws://localhost:1234';

const accessToken = () => document.cookie.split('; ').find((cookie) => cookie.startsWith('accessToken='))?.split('=')[1] || '';

const collaborationLog = (room: string, message: string, details?: unknown) => {
  if (details === undefined) console.log(`[collaboration] ${room}: ${message}`);
  else console.log(`[collaboration] ${room}: ${message}`, details);
};

const getUniquePresence = (states: Map<number, Record<string, unknown>>) => {
  const users = new Map<string, { clientId: number; name: string; color: string }>();
  const names = new Set<string>();
  states.forEach((state, clientId) => {
    const collaborator = state.user as { id?: string; name?: string; color?: string } | undefined;
    const name = collaborator?.name || 'Collaborator';
    const identity = collaborator?.id || name;
    if (!users.has(identity) && !names.has(name)) {
      users.set(identity, { clientId, name, color: collaborator?.color || '#d97706' });
      names.add(name);
    }
  });
  return Array.from(users.values());
};

const EditorToolbar = ({ editable, editorLoading, getEditor }: { editable: boolean; editorLoading: boolean; getEditor: ReturnType<typeof useInstance>[1] }) => {
  const runCommand = <Payload,>(command: { key: CmdKey<Payload> }, payload?: Payload) => {
    if (!editable || editorLoading) return;
    const editor = getEditor();
    if (!editor) return;
    editor.action((ctx) => ctx.get(commandsCtx).call(command.key, payload));
  };
  const askForLink = () => {
    const href = window.prompt('Enter link URL');
    if (href?.trim()) runCommand(toggleLinkCommand, { href: href.trim() });
  };
  const button = <Payload,>(label: string, Icon: typeof Bold, command: { key: CmdKey<Payload> }, payload?: Payload, onClick?: () => void) => (
    <button type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={() => onClick ? onClick() : runCommand(command, payload)} className="grid h-8 w-8 place-items-center rounded-md text-[#526065] transition hover:bg-[#f3e3c3] hover:text-[#7c4a08] disabled:cursor-not-allowed disabled:opacity-40" disabled={!editable || editorLoading}>
      <Icon size={16} strokeWidth={2.2} />
    </button>
  );
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[#e1dbd1] bg-[#fffaf2] px-5 py-2 sm:px-12" role="toolbar" aria-label="Formatting tools">
      {button('Bold', Bold, toggleStrongCommand)}
      {button('Italic', Italic, toggleEmphasisCommand)}
      <span className="mx-1 h-5 w-px bg-[#e1dbd1]" />
      {button('Heading 1', Heading1, wrapInHeadingCommand, 1)}
      {button('Heading 2', Heading2, wrapInHeadingCommand, 2)}
      {button('Bulleted list', List, wrapInBulletListCommand)}
      {button('Numbered list', ListOrdered, wrapInOrderedListCommand)}
      {button('Quote', Quote, wrapInBlockquoteCommand)}
      {button('Code', Code2, toggleInlineCodeCommand)}
      {button('Link', Link, toggleLinkCommand, undefined, askForLink)}
      {button('Divider', Minus, insertHrCommand)}
      <span className="mx-1 h-5 w-px bg-[#e1dbd1]" />
      {button('Undo', Undo2, undoCommand)}
      {button('Redo', Redo2, redoCommand)}
    </div>
  );
};

const CollaborativeEditorContent = ({ page, onContentSaved, editable = true, username = 'Collaborator', userId }: Props) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('Connecting');
  const [synced, setSynced] = useState(false);
  const [presence, setPresence] = useState<string[]>([]);
  const [lastError, setLastError] = useState('');
  const providerRef = useRef<WebsocketProvider | null>(null);
  const serviceConnectedRef = useRef(false);
  const collaborationConnectedRef = useRef(false);
  const templateAppliedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roomName = `book-${page.bookId}-page-${page._id}`;

  useEditor((root) => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(socketUrl, roomName, ydoc, { params: { token: accessToken() } });
    providerRef.current = provider;
    collaborationLog(roomName, `connecting to ${socketUrl}/${roomName}`);
    provider.awareness.setLocalStateField('user', { id: userId || username, name: username, color: '#f59e0b' });
    const updatePresence = () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const localState = provider.awareness.getLocalState();
      const users = getUniquePresence(new Map(states as [number, Record<string, unknown>][]));
      setPresence(users.map((user) => user.name));
      collaborationLog(roomName, `awareness updated: ${states.length} user(s), local cursor ${localState?.cursor ? 'present' : 'waiting'}`);
      dispatch(setRoomPresence({ room: roomName, users }));
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
  }, [page._id, editable, username, userId, dispatch, roomName]);
  const [editorLoading, getEditor] = useInstance();

  useEffect(() => {
    if (editorLoading) return;
    const editor = getEditor();
    if (!editor) return;
    const connectCollaboration = (status: EditorStatus) => {
      if (status !== EditorStatus.Created) return;
      editor.action((ctx) => {
        const service = ctx.get(collabServiceCtx);
        if (!serviceConnectedRef.current) {
          service.connect();
          serviceConnectedRef.current = true;
          collaborationLog(roomName, 'Milkdown Yjs sync plugin connected');
        }
        if (!synced || templateAppliedRef.current) return;
        service.applyTemplate(page.content || '# New page\n\nStart writing together.');
        templateAppliedRef.current = true;
        collaborationConnectedRef.current = true;
        collaborationLog(roomName, 'Milkdown collaboration ready after document sync');
      });
    };
    if (editor.status === EditorStatus.Created) connectCollaboration(editor.status);
    else editor.onStatusChange(connectCollaboration);
  }, [editorLoading, getEditor, page.content, roomName, synced]);

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    collaborationLog(roomName, 'destroying editor and websocket provider');
    serviceConnectedRef.current = false;
    collaborationConnectedRef.current = false;
    templateAppliedRef.current = false;
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
        {/* <span>Room: {roomName}</span><span className="mx-2">·</span><span>Awareness: {presence.length} user{presence.length === 1 ? '' : 's'}</span> */}
        {lastError && <><span className="mx-2">·</span><span className="text-[#b9574e]">{lastError}</span></>}
      </div>
      {editable && <EditorToolbar editable={editable} editorLoading={editorLoading} getEditor={getEditor} />}
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