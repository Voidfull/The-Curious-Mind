import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import PostView from './components/PostView';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import { getPost } from './data/posts';

type View = { type: 'home' } | { type: 'post'; postId: string };

function BlogApp() {
  const { isDark } = useTheme();

  const [view, setView] = useState<View>(() => {
    const hash = window.location.hash.slice(1);
    if (hash && hash.startsWith('post/')) {
      const postId = hash.replace('post/', '');
      if (getPost(postId)) {
        return { type: 'post', postId };
      }
    }
    return { type: 'home' };
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    if (view.type === 'post') {
      window.location.hash = `post/${view.postId}`;
    } else {
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [view]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && hash.startsWith('post/')) {
        const postId = hash.replace('post/', '');
        if (getPost(postId)) {
          setView({ type: 'post', postId });
          return;
        }
      }
      setView({ type: 'home' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToPost = useCallback((postId: string) => {
    setView({ type: 'post', postId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateHome = useCallback(() => {
    setView({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setActiveTag(null);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    if (tag) {
      setActiveTag(tag);
    } else {
      setActiveTag(null);
    }
    if (view.type === 'post') {
      navigateHome();
    }
  }, [view.type, navigateHome]);

  const currentPost = view.type === 'post' ? getPost(view.postId) : null;

  return (
    <div
      className="grain min-h-screen text-ink dark:text-dark-text relative overflow-x-hidden"
      style={{
        // Soft gradient background
        background: isDark
          ? 'linear-gradient(180deg, #0a0a0f 0%, #12121c 50%, #0a0a0f 100%)'
          : 'linear-gradient(180deg, #faf8f5 0%, #f5efe7 50%, #faf8f5 100%)',
      }}
    >
      {/* Extra soft diagonal gradient wash */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 10%, rgba(232,132,90,0.06), transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(144,112,192,0.05), transparent 40%)'
            : 'radial-gradient(ellipse at 20% 10%, rgba(192,83,43,0.04), transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(144,112,192,0.03), transparent 40%)',
        }}
      />

      {/* Animated background — particles, blobs, orbits, constellations */}
      <AnimatedBackground />

      <div className="relative z-10">
        <Header
          onNavigateHome={navigateHome}
          showBack={view.type === 'post'}
        />

        {view.type === 'home' && (
          <HomePage
            onPostClick={navigateToPost}
            activeCategory={activeCategory}
            activeTag={activeTag}
            onCategoryChange={handleCategoryChange}
            onTagClick={handleTagClick}
          />
        )}

        {view.type === 'post' && currentPost && (
          <PostView
            post={currentPost}
            onTagClick={handleTagClick}
          />
        )}

        {view.type === 'post' && !currentPost && (
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <div className="font-serif text-6xl text-ink/10 dark:text-dark-text/10 mb-6 italic">?</div>
            <h2 className="font-serif text-3xl font-semibold text-ink dark:text-dark-text italic mb-3">
              Lost in thought
            </h2>
            <p className="text-ink-muted/50 dark:text-dark-text-muted/60 font-mono text-sm tracking-wider mb-8">
              This page seems to have wandered off
            </p>
            <button
              onClick={navigateHome}
              className="px-6 py-3 bg-ink dark:bg-dark-text text-paper dark:text-dark-bg font-mono text-xs tracking-[0.15em] uppercase hover:bg-accent dark:hover:bg-dark-accent hover:text-white transition-all rounded-sm"
            >
              Return home
            </button>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BlogApp />
    </ThemeProvider>
  );
}
