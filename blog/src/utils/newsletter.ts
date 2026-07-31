import { readJson, writeJson } from './storage';

const STORAGE_KEY = 'blog_newsletter_signups';

export interface NewsletterSignup {
  email: string;
  createdAt: string;
}

export function addNewsletterSignup(email: string): NewsletterSignup {
  const signups = readJson<NewsletterSignup[]>(STORAGE_KEY, []);
  const signup = { email: email.trim().toLowerCase(), createdAt: new Date().toISOString() };
  const next = signups.filter(existing => existing.email !== signup.email).concat(signup);
  writeJson(STORAGE_KEY, next);
  return signup;
}

export function getNewsletterSignups(): NewsletterSignup[] {
  return readJson<NewsletterSignup[]>(STORAGE_KEY, []);
}