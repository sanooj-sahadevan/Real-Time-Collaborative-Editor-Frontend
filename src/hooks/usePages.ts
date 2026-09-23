import { useCallback, useEffect, useState } from 'react';
import { pageApi } from '../api/pages';
import type { Page } from '../types/page.types';
import type { WorkspaceBook } from '../api/pages';

export const usePages = (bookId: string) => {
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
    const page = await pageApi.create(bookId, 'Untitled page');
    setPages((current) => [...current, page].sort((a, b) => a.order - b.order));
    return page;
  };

  const renamePage = async (pageId: string, title: string) => {
    const page = await pageApi.update(pageId, { title });
    setPages((current) => current.map((item) => item._id === pageId ? page : item));
  };

  const deletePage = async (pageId: string) => {
    const nextPages = await pageApi.remove(pageId);
    setPages(nextPages);
  };

  const reorderPages = async (pageIds: string[]) => {
    const previous = pages;
    const reordered = pageIds.map((id, order) => {
      const page = previous.find((item) => item._id === id);
      return page ? { ...page, order } : null;
    }).filter((page): page is Page => page !== null);
    setPages(reordered);
    try { setPages(await pageApi.reorder(bookId, pageIds)); }
    catch { setPages(previous); setError('Unable to save page order.'); }
  };

  return { pages, book, loading, error, createPage, renamePage, deletePage, reorderPages };
};