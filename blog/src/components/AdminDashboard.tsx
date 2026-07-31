import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Edit3, FileText, MessageSquare, Plus, RefreshCw, Save, Shield, Trash2 } from 'lucide-react';
import type { BlogPost, BlogPostCategory, BlogPostStatus } from '../data/posts-new';
import { categories } from '../data/posts-new';
import { createAdminPost, deleteAdminPost, fetchAdminPosts, updateAdminPost } from '../utils/postsApi';

interface AdminComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  username: string;
  content: string;
  created_at: string;
  is_hidden?: boolean;
}

interface AdminDashboardProps {
  onPostsChanged?: () => void;
}

interface PostForm {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  tags: string;
  category: BlogPostCategory;
  excerpt: string;
  content: string;
  coverEmoji: string;
  status: BlogPostStatus;
}

const editableCategories = categories.filter(category => category.id !== 'all') as Array<{ id: BlogPostCategory; label: string }>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyPostForm(): PostForm {
  return {
    id: '',
    title: '',
    subtitle: '',
    date: today(),
    readTime: '3 min read',
    tags: '',
    category: 'note',
    excerpt: '',
    content: '',
    coverEmoji: '',
    status: 'draft',
  };
}

function postToForm(post: BlogPost): PostForm {
  return {
    id: post.id,
    title: post.title,
    subtitle: post.subtitle || '',
    date: post.date,
    readTime: post.readTime,
    tags: post.tags.join(', '),
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    coverEmoji: post.coverEmoji || '',
    status: post.status,
  };
}

function formToPost(form: PostForm): BlogPost {
  return {
    id: form.id.trim(),
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || undefined,
    date: form.date,
    readTime: form.readTime.trim(),
    tags: form.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean),
    category: form.category,
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    coverEmoji: form.coverEmoji.trim() || undefined,
    status: form.status,
  };
}

async function fetchAdminComments(token: string): Promise<AdminComment[]> {
  const res = await fetch('/api/comments?limit=100', {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unable to load comments');
  return res.json();
}

async function deleteComment(id: string, token: string): Promise<void> {
  const res = await fetch(`/api/comments?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unable to delete comment');
}

export default function AdminDashboard({ onPostsChanged }: AdminDashboardProps) {
  const [token, setToken] = useState('');
  const [draftToken, setDraftToken] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [postForm, setPostForm] = useState<PostForm>(emptyPostForm);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const stats = useMemo(() => ({
    posts: posts.length,
    published: posts.filter(post => post.status === 'published').length,
    drafts: posts.filter(post => post.status === 'draft').length,
    comments: comments.length,
  }), [comments.length, posts]);

  const loadAdminData = async (nextToken = token) => {
    if (!nextToken.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [nextPosts, nextComments] = await Promise.all([
        fetchAdminPosts(nextToken.trim()),
        fetchAdminComments(nextToken.trim()),
      ]);
      setPosts(nextPosts);
      setComments(nextComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notice) {
      const timeoutId = window.setTimeout(() => setNotice(null), 3000);
      return () => window.clearTimeout(timeoutId);
    }
  }, [notice]);

  const handleTokenSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanToken = draftToken.trim();
    setToken(cleanToken);
    loadAdminData(cleanToken);
  };

  const startNewPost = () => {
    setEditingPostId(null);
    setPostForm(emptyPostForm());
    setActiveTab('posts');
  };

  const editPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setPostForm(postToForm(post));
    setActiveTab('posts');
  };

  const updateForm = (field: keyof PostForm, value: string) => {
    setPostForm(current => ({ ...current, [field]: value }));
  };

  const handleSavePost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError(null);
    try {
      const payload = formToPost(postForm);
      const saved = editingPostId
        ? await updateAdminPost(token, { ...payload, id: editingPostId })
        : await createAdminPost(token, payload);

      setPosts(current => [saved, ...current.filter(post => post.id !== saved.id)]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setEditingPostId(saved.id);
      setPostForm(postToForm(saved));
      setNotice('Post saved');
      await onPostsChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!token || !window.confirm('Delete this post?')) return;

    setError(null);
    try {
      await deleteAdminPost(token, postId);
      setPosts(current => current.filter(post => post.id !== postId));
      if (editingPostId === postId) startNewPost();
      setNotice('Post deleted');
      await onPostsChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete post');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token || !window.confirm('Delete this comment?')) return;

    setError(null);
    try {
      await deleteComment(commentId, token);
      setComments(current => current.filter(comment => comment.id !== commentId));
      setNotice('Comment deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete comment');
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24 animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={16} className="text-accent/70 dark:text-dark-accent/80" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent dark:text-dark-accent">Admin</span>
          <div className="flex-1 h-px bg-gradient-to-r from-ink/8 dark:from-dark-border/40 to-transparent" />
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ink dark:text-dark-text italic leading-tight">
          Dashboard
        </h1>
      </div>

      <form onSubmit={handleTokenSubmit} className="relative p-5 art-border rounded-sm mb-8">
        <div className="absolute -top-2.5 left-4 bg-paper dark:bg-dark-bg px-2 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase">
          Access token
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="password"
            value={draftToken}
            onChange={event => setDraftToken(event.target.value)}
            placeholder="ADMIN_TOKEN"
            autoComplete="off"
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

      {token && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              ['Posts', stats.posts],
              ['Published', stats.published],
              ['Drafts', stats.drafts],
              ['Comments', stats.comments],
            ].map(([label, value]) => (
              <div key={label} className="p-4 border border-ink/5 dark:border-dark-border/40 rounded-sm bg-paper-warm/20 dark:bg-dark-surface/25">
                <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-ink-muted/45 dark:text-dark-text-muted/50">{label}</span>
                <span className="mt-2 block font-serif text-3xl text-ink dark:text-dark-text italic">{value}</span>
              </div>
            ))}
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-[0.12em] transition-colors ${activeTab === 'posts' ? 'bg-ink dark:bg-dark-text text-paper dark:text-dark-bg' : 'text-ink-muted/60 dark:text-dark-text-muted/70 hover:text-accent dark:hover:text-dark-accent'}`}
            >
              <FileText size={14} /> Posts
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-[0.12em] transition-colors ${activeTab === 'comments' ? 'bg-ink dark:bg-dark-text text-paper dark:text-dark-bg' : 'text-ink-muted/60 dark:text-dark-text-muted/70 hover:text-accent dark:hover:text-dark-accent'}`}
            >
              <MessageSquare size={14} /> Comments
            </button>
            <button
              onClick={() => loadAdminData()}
              disabled={loading}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-[0.12em] text-ink-muted/60 dark:text-dark-text-muted/70 hover:text-accent dark:hover:text-dark-accent disabled:opacity-40"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </>
      )}

      {error && <p className="mb-6 text-[11px] font-mono text-rose dark:text-rose-light tracking-wider">{error}</p>}
      {notice && <p className="mb-6 text-[11px] font-mono text-sage dark:text-sage-light tracking-wider">{notice}</p>}

      {!token ? null : activeTab === 'posts' ? (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_21rem] gap-8">
          <form onSubmit={handleSavePost} className="relative p-5 art-border rounded-sm space-y-5">
            <div className="absolute -top-2.5 left-4 bg-paper dark:bg-dark-bg px-2 text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-[0.15em] uppercase">
              {editingPostId ? 'Edit post' : 'New post'}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Slug</span>
                <input value={postForm.id} onChange={event => updateForm('id', event.target.value)} disabled={Boolean(editingPostId)} placeholder="auto-from-title" maxLength={100} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm font-mono focus:outline-none focus:border-accent/40 disabled:opacity-50" />
              </label>
              <label className="block">
                <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Date</span>
                <input type="date" value={postForm.date} onChange={event => updateForm('date', event.target.value)} required className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm font-mono focus:outline-none focus:border-accent/40" />
              </label>
            </div>

            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Title</span>
              <input value={postForm.title} onChange={event => updateForm('title', event.target.value)} required maxLength={160} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-lg font-serif focus:outline-none focus:border-accent/40" />
            </label>

            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Subtitle</span>
              <input value={postForm.subtitle} onChange={event => updateForm('subtitle', event.target.value)} maxLength={220} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm focus:outline-none focus:border-accent/40" />
            </label>

            <div className="grid sm:grid-cols-4 gap-5">
              <label className="block sm:col-span-1">
                <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Status</span>
                <select value={postForm.status} onChange={event => updateForm('status', event.target.value)} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm font-mono focus:outline-none focus:border-accent/40">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="block sm:col-span-1">
                <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Category</span>
                <select value={postForm.category} onChange={event => updateForm('category', event.target.value)} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm font-mono focus:outline-none focus:border-accent/40">
                  {editableCategories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-1">
                <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Read</span>
                <input value={postForm.readTime} onChange={event => updateForm('readTime', event.target.value)} required maxLength={40} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm font-mono focus:outline-none focus:border-accent/40" />
              </label>
              <label className="block sm:col-span-1">
                <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Mark</span>
                <input value={postForm.coverEmoji} onChange={event => updateForm('coverEmoji', event.target.value)} maxLength={16} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm focus:outline-none focus:border-accent/40" />
              </label>
            </div>

            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Tags</span>
              <input value={postForm.tags} onChange={event => updateForm('tags', event.target.value)} placeholder="ethics, history, notes" className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm font-mono focus:outline-none focus:border-accent/40" />
            </label>

            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Excerpt</span>
              <textarea value={postForm.excerpt} onChange={event => updateForm('excerpt', event.target.value)} required rows={3} maxLength={800} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm leading-relaxed resize-y focus:outline-none focus:border-accent/40" />
            </label>

            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/50 dark:text-dark-text-muted/60 mb-2">Markdown</span>
              <textarea value={postForm.content} onChange={event => updateForm('content', event.target.value)} required rows={16} maxLength={120000} className="w-full px-0 py-2 border-b border-ink/8 dark:border-dark-border/40 bg-transparent text-sm leading-relaxed resize-y font-mono focus:outline-none focus:border-accent/40" />
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-ink dark:bg-dark-text text-paper dark:text-dark-bg font-mono text-xs tracking-[0.1em] uppercase transition-all hover:bg-accent dark:hover:bg-dark-accent hover:text-white rounded-sm disabled:opacity-40">
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={startNewPost} className="flex items-center gap-2 px-4 py-2.5 text-ink-muted/60 dark:text-dark-text-muted/70 hover:text-accent dark:hover:text-dark-accent font-mono text-xs tracking-[0.1em] uppercase transition-colors rounded-sm">
                <Plus size={14} /> New
              </button>
              {editingPostId && (
                <button type="button" onClick={() => handleDeletePost(editingPostId)} className="ml-auto flex items-center gap-2 px-4 py-2.5 text-rose dark:text-rose-light font-mono text-xs tracking-[0.1em] uppercase transition-colors rounded-sm">
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </form>

          <aside className="space-y-3">
            {posts.map(post => (
              <article key={post.id} className="p-4 border-l-[3px] border-l-accent/25 dark:border-l-dark-accent/35 rounded-r-lg hover:bg-paper-warm/35 dark:hover:bg-dark-surface/45 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => editPost(post)} className="min-w-0 text-left flex-1">
                    <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-ink-muted/40 dark:text-dark-text-muted/50 mb-1">{post.status} / {post.category}</span>
                    <span className="block font-serif text-xl font-semibold text-ink dark:text-dark-text leading-snug">{post.title}</span>
                    <span className="block mt-1 text-[10px] font-mono text-ink-muted/45 dark:text-dark-text-muted/50 tracking-wider">{post.id}</span>
                  </button>
                  <button onClick={() => editPost(post)} className="p-2 text-ink-muted/40 dark:text-dark-text-muted/50 hover:text-accent dark:hover:text-dark-accent" aria-label="Edit post"><Edit3 size={14} /></button>
                </div>
              </article>
            ))}
            {!posts.length && !loading && <p className="text-center py-12 text-ink-muted/40 dark:text-dark-text-muted/50 font-mono text-xs tracking-widest uppercase">No managed posts</p>}
          </aside>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map(comment => (
            <article key={comment.id} className="relative p-5 border-l-[3px] border-l-accent/30 dark:border-l-dark-accent/40 rounded-r-lg hover:bg-paper-warm/30 dark:hover:bg-dark-surface/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink dark:text-dark-text">{comment.username}</span>
                    <span className="text-[10px] font-mono text-ink-muted/40 dark:text-dark-text-muted/50 tracking-wider">{comment.post_id}</span>
                    {comment.parent_id && <span className="text-[10px] font-mono text-ink-muted/35 dark:text-dark-text-muted/40 tracking-wider">reply</span>}
                    <span className="text-[10px] font-mono text-ink-muted/35 dark:text-dark-text-muted/40 tracking-wider">{format(new Date(comment.created_at), 'PPp')}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-light/80 dark:text-dark-text-muted/80">{comment.content}</p>
                </div>
                <button onClick={() => handleDeleteComment(comment.id)} className="p-2 text-ink-muted/40 dark:text-dark-text-muted/50 hover:text-rose dark:hover:text-rose-light transition-colors" aria-label="Delete comment">
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
          {!comments.length && !loading && <p className="text-center py-12 text-ink-muted/40 dark:text-dark-text-muted/50 font-mono text-xs tracking-widest uppercase">No comments</p>}
        </div>
      )}

      {loading && <p className="text-center py-12 text-ink-muted/40 dark:text-dark-text-muted/50 font-mono text-xs tracking-widest uppercase animate-pulse">Loading...</p>}
    </main>
  );
}