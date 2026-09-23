import React, { useState } from "react";

interface CreateBookModalProps {
  onClose: () => void;
  onCreate: (title: string, description?: string) => Promise<unknown>;
}

const CreateBookModal: React.FC<CreateBookModalProps> = ({
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onCreate(
        trimmedTitle,
        trimmedDescription || undefined,
      );

      onClose();
    } catch {
      setError("Failed to create book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-book-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <h2
          id="create-book-title"
          className="mb-6 text-xl font-semibold text-slate-100"
        >
          New Book
        </h2>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="book-title"
              className="mb-2 block text-sm font-medium text-slate-400"
            >
              Title <span className="text-red-400">*</span>
            </label>

            <input
              id="book-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="My awesome book"
              className="input-field"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="book-description"
              className="mb-2 block text-sm font-medium text-slate-400"
            >
              Description{" "}
              <span className="text-slate-600">(optional)</span>
            </label>

            <textarea
              id="book-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A short description..."
              rows={3}
              className="input-field resize-none"
              disabled={loading}
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookModal;
