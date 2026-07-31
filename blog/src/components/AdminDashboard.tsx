import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Shield, Trash2 } from 'lucide-react';
import { readString, writeString } from '../utils/storage';

interface AdminComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  username: string;
  content: string;
  created_at: string;
  is_hidden?: boolean;
}

async function fetchAdminComments(token: string): Promise<AdminComment[]> {
  const res = await fetch(`/api/comments?adminToken=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Unable to load comments');
  return res.json();
}

async function deleteComment(id: string, token: string): Promise<void> {
  const res = await fetch(`/api/comments?id=${encodeURIComponent(id)}&adminToken=${encodeURIComponent(token)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Unable to delete comment');
}

export default function AdminDashboard() {
  const [token, setToken] = useState(() => readString('blog_admin_token'));
  const [draftToken, setDraftToken] = useState(token);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async (nextToken = token) => {
    if (!nextToken.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminComments(nextToken.trim());
      setComments(data);
    } catch {
      setError('Unable to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleTokenSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanToken = draftToken.trim();
    setToken(cleanToken);
    writeString('blog_admin_token', cleanToken);
    loadComments(cleanToken);
  };

  const handleDelete = async (commentId: string) => {
    setError(null);
    try {
      await deleteComment(commentId, token);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch {
      setError('Unable to delete comment');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={16} className="text-accent/70 dark:text-dark-accent/80" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent dark:text-dark-accent">Admin</span>
          <div className="flex-1 h-px bg-gradient-to-r from-ink/8 dark:from-dark-border/40 to-transparent" />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ink dark:text-dark-text italic leading-tight">
          Comment review
        </h1>
      </div>

      <form onSubmit={handleTokenSubmit} className="relative p-5 art-border rounded-sm mb-10">
        <div className="absolute -top-2.5 left-4 bg-paper dark:bg-dark-bg px-2 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase">
          Access token
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="password"
            value={draftToken}
            onChange={event => setDraftToken(event.target.value)}
            placeholder="ADMIN_TOKEN"
            className="flex-1 px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-ink dark:text-dark-text placeholder:text-ink-muted/25 dark:placeholder:text-dark-text-muted/30 focus:outline-none focus:border-accent/30 dark:focus:border-dark-accent/40 text-sm font-mono tracking-wide transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-ink dark:bg-dark-text text-paper dark:text-dark-bg font-mono text-xs tracking-[0.1em] uppercase transition-all hover:bg-accent dark:hover:bg-dark-accent hover:text-white rounded-sm"
          >
            Load
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-6 text-[11px] font-mono text-rose dark:text-rose-light tracking-wider">{error}</p>
      )}

      {loading ? (
        <p className="text-center py-12 text-ink-muted/40 dark:text-dark-text-muted/50 font-mono text-xs tracking-widest uppercase animate-pulse">Loading...</p>
      ) : (
        <div className="space-y-5">
          {comments.map(comment => (
            <article key={comment.id} className="relative p-5 border-l-[3px] border-l-accent/30 dark:border-l-dark-accent/40 rounded-r-lg hover:bg-paper-warm/30 dark:hover:bg-dark-surface/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink dark:text-dark-text">{comment.username}</span>
                    <span className="text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-wider">{comment.post_id}</span>
                    {comment.parent_id && (
                      <span className="text-[10px] font-mono text-ink-muted/35 dark:text-dark-text-muted/40 tracking-wider">reply</span>
                    )}
                    <span className="text-[10px] font-mono text-ink-muted/35 dark:text-dark-text-muted/40 tracking-wider">{format(new Date(comment.created_at), 'PPp')}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-light/80 dark:text-dark-text-muted/80">{comment.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 text-ink-muted/40 dark:text-dark-text-muted/50 hover:text-rose dark:hover:text-rose-light transition-colors"
                  aria-label="Delete comment"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
          {!comments.length && token && (
            <p className="text-center py-12 text-ink-muted/40 dark:text-dark-text-muted/50 font-mono text-xs tracking-widest uppercase">No comments</p>
          )}
        </div>
      )}
    </main>
  );
}