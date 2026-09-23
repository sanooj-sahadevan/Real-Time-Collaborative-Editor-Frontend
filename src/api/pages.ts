import { api } from '../lib/axios';
import type { Page } from '../types/page.types';
import type { CollaboratorSummary } from '../types/user.types';

export interface WorkspaceBook {
  _id: string;
  title: string;
  ownerId: string;
  collaborators: CollaboratorSummary[];
  editors: CollaboratorSummary[];
  canEdit: boolean;
  editRequestStatus: 'pending' | 'approved' | 'rejected' | null;
}

export const pageApi = {
  list: async (bookId: string) => (await api.get<{ pages: Page[]; book: WorkspaceBook }>(`/pages/book/${bookId}`)).data,
  create: async (bookId: string, title: string) => (await api.post<{ page: Page }>(`/pages/book/${bookId}`, { title })).data.page,
  update: async (pageId: string, data: { title?: string; content?: string }) => (await api.patch<{ page: Page }>(`/pages/${pageId}`, data)).data.page,
  remove: async (pageId: string) => (await api.delete<{ pages: Page[] }>(`/pages/${pageId}`)).data.pages,
  reorder: async (bookId: string, pageIds: string[]) => (await api.post<{ pages: Page[] }>(`/pages/book/${bookId}/reorder`, { pageIds })).data.pages,
};

export const editApi = {
  request: async (bookId: string) => (await api.post<{ request: EditRequest }>(`/books/${bookId}/edit-requests`)).data.request,
  list: async (bookId: string) => (await api.get<{ requests: EditRequest[] }>(`/books/${bookId}/edit-requests`)).data.requests,
  pending: async () => (await api.get<{ requests: Array<EditRequest & { bookId: string; bookTitle: string }> }>('/books/edit-requests/pending')).data.requests,
  resolve: async (bookId: string, requestId: string, status: 'approved' | 'rejected') => (await api.patch<{ request: EditRequest }>(`/books/${bookId}/edit-requests/${requestId}`, { status })).data.request,
};

export interface EditRequest {
  _id: string;
  userId: string | { _id: string; username: string; email: string };
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}