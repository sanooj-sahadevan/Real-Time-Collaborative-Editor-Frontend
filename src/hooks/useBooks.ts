import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/axios';
import type { Book } from '../types/user.types';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await api.get('/books/all');
      setBooks(res.data.books as Book[]);
    } catch {
      if (showLoading) setError('Failed to load books. Please try again.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const createBook = async (title: string, description?: string) => {
    const res = await api.post('/books', { title, description });
    const newBook = res.data.book as Book;
    setBooks((prev) => [newBook, ...prev]);
    return newBook;
  };

  const deleteBook = async (bookId: string) => {
    await api.delete(`/books/${bookId}`);
    setBooks((prev) => prev.filter((b) => b._id !== bookId));
  };

  const requestAccess = async (bookId: string) => {
    await api.post(`/books/${bookId}/edit-requests`);
    setBooks((current) => current.map((book) => book._id === bookId ? { ...book, editRequestStatus: 'pending' } : book));
  };

  useEffect(() => {
    void fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const refreshTimer = window.setInterval(() => { void fetchBooks(false); }, 2000);
    return () => window.clearInterval(refreshTimer);
  }, [fetchBooks]);

  return { books, loading, error, createBook, deleteBook, requestAccess, refetch: fetchBooks };
};
