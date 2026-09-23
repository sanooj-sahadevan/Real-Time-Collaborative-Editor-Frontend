import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/axios';
import type { Book } from '../types/user.types';
import { useToast } from '../context/ToastContext';
import { bookApi } from '../api/pages';

export const useBooks = () => {
  const { showToast } = useToast();
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
    try {
      const res = await api.post('/books', { title, description });
      const newBook = res.data.book as Book;
      setBooks((prev) => [newBook, ...prev]);
      showToast('Book created successfully.', 'success');
      return newBook;
    } catch (error) {
      showToast('Unable to create the book.', 'error');
      throw error;
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      await api.delete(`/books/${bookId}`);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      showToast('Book deleted.', 'success');
    } catch (error) {
      showToast('Unable to delete the book.', 'error');
      throw error;
    }
  };

  const requestAccess = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/edit-requests`);
      setBooks((current) => current.map((book) => book._id === bookId ? { ...book, editRequestStatus: 'pending' } : book));
      showToast('Edit request sent to the book owner.', 'success');
    } catch (error) {
      showToast('Unable to send the edit request.', 'error');
      throw error;
    }
  };

  const publishBook = async (bookId: string) => {
    try {
      const published = await bookApi.publish(bookId);
      setBooks((current) => current.map((book) => book._id === bookId ? { ...book, ...published, isPublished: true } : book));
      showToast('Book published. Collaborators can now read it.', 'success');
    } catch (error) {
      showToast('Unable to publish the book.', 'error');
      throw error;
    }
  };

  useEffect(() => {
    void fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const refreshTimer = window.setInterval(() => { void fetchBooks(false); }, 2000);
    return () => window.clearInterval(refreshTimer);
  }, [fetchBooks]);

  return { books, loading, error, createBook, deleteBook, requestAccess, publishBook, refetch: fetchBooks };
};
