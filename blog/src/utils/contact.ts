import { readJson, writeJson } from './storage';

const STORAGE_KEY = 'blog_contact_messages';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export function addContactMessage(input: Omit<ContactMessage, 'id' | 'createdAt'>): ContactMessage {
  const messages = readJson<ContactMessage[]>(STORAGE_KEY, []);
  const message = {
    ...input,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  writeJson(STORAGE_KEY, [message, ...messages].slice(0, 50));
  return message;
}

export function getContactMessages(): ContactMessage[] {
  return readJson<ContactMessage[]>(STORAGE_KEY, []);
}