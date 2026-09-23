import { useCallback, useEffect, useState } from 'react';
import { pageApi } from '../api/pages';
import type { Page } from '../types/page.types';
import type { WorkspaceBook } from '../api/pages';
import { useToast } from '../context/ToastContext';

export const usePages = (bookId: string) => {
  const { showToast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [book, setBook] = useState<WorkspaceBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try { const workspace = await pageApi.list(bookId); setPages(workspace.pages); setBook(workspace.book); setError(null); }
    catch { setError('Unable to load pages.'); }
    finally { if (showLoading) setLoading(false); }
  }, [bookId]);

  useEffect(() => { void fetchPages(); }, [fetchPages]);

  useEffect(() => {
    const refreshTimer = window.setInterval(() => { void fetchPages(false); }, 2000);
    return () => window.clearInterval(refreshTimer);
  }, [fetchPages]);

  const createPage = async () => {
    try {
      const page = await pageApi.create(bookId, 'Untitled page');
      setPages((current) => [...current, page].sort((a, b) => a.order - b.order));
      showToast('Page created.', 'success');
      return page;
    } catch (error) {
      showToast('Unable to create the page.', 'error');
      throw error;
    }
  };

  const renamePage = async (pageId: string, title: string) => {
    try {
      const page = await pageApi.update(pageId, { title });
      setPages((current) => current.map((item) => item._id === pageId ? page : item));
      showToast('Page renamed.', 'success');
    } catch (error) {
      showToast('Unable to rename the page.', 'error');
      throw error;
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      const nextPages = await pageApi.remove(pageId);
      setPages(nextPages);
      showToast('Page deleted.', 'success');
    } catch (error) {
      showToast('Unable to delete the page.', 'error');
      throw error;
    }
  };

  const reorderPages = async (pageIds: string[]) => {
    const previous = pages;
    const reordered = pageIds.map((id, order) => {
      const page = previous.find((item) => item._id === id);
      return page ? { ...page, order } : null;
    }).filter((page): page is Page => page !== null);
    setPages(reordered);
    try {
      setPages(await pageApi.reorder(bookId, pageIds));
      showToast('Page order saved.', 'success');
    } catch {
      setPages(previous);
      setError('Unable to save page order.');
      showToast('Unable to save page order.', 'error');
    }
  };

  return { pages, book, loading, error, createPage, renamePage, deletePage, reorderPages };
};