import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

import Footer from '../components/common/Footer';
import BookCard from '../components/books/BookCard';
import CreateBookModal from '../components/books/CreateBookModal';
import { useAuth } from '../hooks/useAuth';
import { useBooks } from '../hooks/useBooks';
import { motion } from 'framer-motion';
import { Alert } from '@mui/material';
import { Library, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { books, loading: booksLoading, error, createBook, deleteBook, requestAccess, publishBook } = useBooks();
  const [showModal, setShowModal] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const ownedBooks = books.filter((book) => book.ownerId === user._id);
  const sharedBooks = books.filter((book) => book.ownerId !== user._id);

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f3ed]">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b45f00]">Your library</p>
              <h1 className="font-serif text-4xl font-semibold text-[#20252b] sm:text-5xl">Good to see you, {user.username}.</h1>
              <p className="mt-3 max-w-lg text-[#7b8385]">A quiet place for ambitious ideas, shared drafts, and the stories still finding their shape.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#263238] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#37474f]"
            >
              <Plus size={17} />
              New Book
            </button>
          </motion.div>

          {/* Error state */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          {/* Loading state */}
          {booksLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl border border-[#e4ded4] bg-[#fffdf8]"
                />
              ))}
            </div>
          ) : books.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9d3c9] bg-[#fffdf8]/60 py-24 text-center">
              <Library className="mb-2 text-[#d97706]" size={42} />
              <h2 className="font-serif text-2xl font-semibold text-[#20252b]">Your shelf is waiting</h2>
              <p className="mt-2 text-sm text-[#7b8385]">
                Create your first book to get started.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-6 rounded-lg bg-[#263238] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#37474f]"
              >
                Create your first book
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              <section aria-labelledby="owned-books-heading">
                <div className="mb-5 flex items-end justify-between border-b border-[#ded8ce] pb-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b45f00]">Your library</p><h2 id="owned-books-heading" className="mt-1 font-serif text-2xl font-semibold text-[#20252b]">Your Books</h2></div>
                  <span className="text-xs font-semibold text-[#8b9391]">{ownedBooks.length} {ownedBooks.length === 1 ? 'book' : 'books'}</span>
                </div>
                {ownedBooks.length === 0 ? <div className="rounded-xl border border-dashed border-[#d9d3c9] bg-[#fffdf8]/70 px-5 py-8 text-sm text-[#7b8385]">Books you create will appear here.</div> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{ownedBooks.map((book) => <BookCard key={book._id} book={book} userId={user._id} onDelete={deleteBook} onRequestAccess={requestAccess} onPublish={publishBook} />)}</div>}
              </section>
              {sharedBooks.length > 0 && <section aria-labelledby="shared-books-heading">
                <div className="mb-5 flex items-end justify-between border-b border-[#ded8ce] pb-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b45f00]">Collaborative shelf</p><h2 id="shared-books-heading" className="mt-1 font-serif text-2xl font-semibold text-[#20252b]">Shared With You</h2></div>
                  <span className="text-xs font-semibold text-[#8b9391]">{sharedBooks.length} {sharedBooks.length === 1 ? 'book' : 'books'}</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{sharedBooks.map((book) => <BookCard key={book._id} book={book} userId={user._id} onDelete={deleteBook} onRequestAccess={requestAccess} onPublish={publishBook} />)}</div>
              </section>}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Create book modal */}
      {showModal && (
        <CreateBookModal
          onClose={() => setShowModal(false)}
          onCreate={createBook}
        />
      )}
    </div>
  );
};

export default Dashboard;