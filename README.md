# The Curious Mind — Personal Blog

A clean, atmospheric personal blog built with React, Vite, and Tailwind CSS. Features a distinctive editorial aesthetic with animated backgrounds, dark/light mode, and a full comment system.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)

## Features

- **Rich editorial design** — Cormorant Garamond serif headings, drop caps, decorative dividers, and a grain texture overlay
- **Animated background** — Canvas-based particle system with flowing trails, connection lines, aurora waves, pulsing halos, and floating glyphs
- **Ouroboros logo** — Detailed SVG serpent with bonsai tree and root motifs, breathing and rotation animations
- **Dark / light mode** — Persisted to `localStorage`, respects system preference on first visit
- **Comment system** — Stored in `localStorage` with username persistence, relative timestamps, and colored avatars
- **Post filtering** — Filter by category (Essay, Article, Interesting Find, Note) or by tag, with live search
- **Hash-based routing** — Deep-linkable post URLs via `#post/<id>`
- **Single-file build** — Outputs a self-contained `index.html` via `vite-plugin-singlefile`

## Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4.1 | Styling |
| Vite | 7.3 | Build tool |
| date-fns | 4.4 | Date formatting |
| lucide-react | 1.17 | Icons |
| vite-plugin-singlefile | 2.3 | Single HTML output |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production (outputs a single index.html)
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── AnimatedBackground.tsx  # Canvas particles + CSS decorative layers
│   ├── CommentSection.tsx      # Comment form and display
│   ├── Decorations.tsx         # Reusable SVG/decorative elements
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── HomePage.tsx            # Post listing with search + filters
│   ├── Ouroboros.tsx           # Animated SVG logo
│   ├── PostCard.tsx            # Post preview card
│   ├── PostView.tsx            # Full post reader
│   └── Sidebar.tsx             # Category + tag navigation
├── context/
│   └── ThemeContext.tsx        # Dark/light mode provider
├── data/
│   ├── comments.ts             # Comment CRUD (localStorage)
│   └── posts.ts                # Post data and helpers
├── App.tsx                     # Root component + routing
├── index.css                   # Global styles, Tailwind theme, animations
├── main.tsx
└── cn.ts                       # clsx + tailwind-merge helper
```

## Adding Posts

Posts live in `src/data/posts.ts`. Add an object to the `posts` array:

```ts
{
  id: 'my-post-slug',           // used in the URL hash
  title: 'My Post Title',
  subtitle: 'An optional subtitle',
  date: '2026-06-11',
  readTime: '5 min read',
  tags: ['tag-one', 'tag-two'],
  category: 'essay',            // 'essay' | 'article' | 'interesting-find' | 'note'
  coverEmoji: '🌿',
  excerpt: 'A short summary shown on the post card.',
  content: `<p>Your HTML content here...</p>`,
}
```

Content supports standard HTML tags. Headings (`h2`, `h3`), blockquotes, lists, code blocks, and inline `code` all have styled variants via the `.prose-blog` class.

## Fonts

Loaded from Google Fonts:

- **Cormorant Garamond** — headings and decorative text
- **DM Sans** — body copy
- **Space Mono** — monospace labels, metadata, and UI elements

## License

MIT
