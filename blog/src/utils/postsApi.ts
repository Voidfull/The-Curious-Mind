import type { BlogPost } from '../data/posts-new';

const ADMIN_HEADERS = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

async function readJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }
  return data as T;
}

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch('/api/posts', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchAdminPosts(token: string): Promise<BlogPost[]> {
  const res = await fetch('/api/posts', {
    cache: 'no-store',
    headers: ADMIN_HEADERS(token),
  });
  return readJson<BlogPost[]>(res);
}

export async function createAdminPost(token: string, post: BlogPost): Promise<BlogPost> {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: ADMIN_HEADERS(token),
    body: JSON.stringify(post),
  });
  return readJson<BlogPost>(res);
}

export async function updateAdminPost(token: string, post: BlogPost): Promise<BlogPost> {
  const res = await fetch(`/api/posts?id=${encodeURIComponent(post.id)}`, {
    method: 'PUT',
    headers: ADMIN_HEADERS(token),
    body: JSON.stringify(post),
  });
  return readJson<BlogPost>(res);
}

export async function deleteAdminPost(token: string, postId: string): Promise<void> {
  const res = await fetch(`/api/posts?id=${encodeURIComponent(postId)}`, {
    method: 'DELETE',
    headers: ADMIN_HEADERS(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Request failed');
  }
}