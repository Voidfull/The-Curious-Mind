import { Suspense, lazy, useState, useCallback, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import PostView from './components/PostView';
import Footer from './components/Footer';
import ContactPage from './components/ContactPage';
import AdminDashboard from './components/AdminDashboard';
import ReadingProgress from './components/ReadingProgress';
const AnimatedBackground = lazy(() => import('./components/AnimatedBackground-new'));
import { getPost } from './data/posts-new';
import { trackEvent } from './utils/analytics';

type View = { type: 'home' } | { type: 'post'; postId: string } | { type: 'contact' } | { type: 'admin' };
type NavigationMode = 'push' | 'replace';

function parseHash(): View {
  const hash = window.location.hash.slice(1);
  if (hash === 'contact') return { type: 'contact' };
  if (hash === 'admin') return { type: 'admin' };
  if (hash && hash.startsWith('post/')) {
    const postId = hash.replace('post/', '');
    if (getPost(postId)) return { type: 'post', postId };
  }
  return { type: 'home' };
}

function routeHash(view: View) {
  if (view.type === 'post') return `#post/${view.postId}`;
  if (view.type === 'contact') return '#contact';
  if (view.type === 'admin') return '#admin';
  return '';
}

function routeUrl(view: View) {
  return `${window.location.pathname}${window.location.search}${routeHash(view)}`;
}

function sameView(a: View, b: View) {
  return a.type === b.type && (a.type !== 'post' || (b.type === 'post' && a.postId === b.postId));
}

function writeRoute(view: View, mode: NavigationMode) {
  const nextUrl = routeUrl(view);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl === currentUrl) return;

  if (mode === 'replace') {
    window.history.replaceState(null, '', nextUrl);
  } else {
    window.history.pushState(null, '', nextUrl);
  }
}

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(property ? 'property' : 'name', name);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function useRouteMetadata(view: View) {
  useEffect(() => {
    const post = view.type === 'post' ? getPost(view.postId) : null;
    const title = post ? `${post.title} | The Curious Mind` : view.type === 'contact' ? 'Contact | The Curious Mind' : 'The Curious Mind - Personal Blog';
    const description = post?.excerpt || 'Essays, articles, and notes from The Curious Mind.';
    const url = `${window.location.origin}${routeUrl(view)}`;

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', post ? 'article' : 'website', true);
    setMeta('og:url', url, true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
  }, [view]);
}

function BlogApp() {
  const { isDark } = useTheme();
  const [view, setView] = useState<View>(parseHash);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useRouteMetadata(view);

  useEffect(() => {
    const syncFromLocation = () => {
      const nextView = parseHash();
      setView((currentView) => (sameView(currentView, nextView) ? currentView : nextView));
    };

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, []);

  const navigateToView = useCallback((nextView: View, mode: NavigationMode = 'push') => {
    setView((currentView) => (sameView(currentView, nextView) ? currentView : nextView));
    writeRoute(nextView, mode);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const navigateToPost = useCallback((postId: string) => {
    navigateToView({ type: 'post', postId });
    trackEvent('post_open', { postId });
  }, [navigateToView]);

  const navigateHome = useCallback(() => {
    navigateToView({ type: 'home' });
  }, [navigateToView]);

  const navigateContact = useCallback(() => {
    navigateToView({ type: 'contact' });
    trackEvent('contact_open');
  }, [navigateToView]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setActiveTag(null);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setActiveTag(tag || null);
    if (view.type !== 'home') navigateHome();
  }, [view.type, navigateHome]);

  const currentPost = view.type === 'post' ? getPost(view.postId) : null;

  return (
    <div
      className="grain min-h-screen text-ink dark:text-dark-text relative overflow-x-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #0a0a0f 0%, #12121c 50%, #0a0a0f 100%)'
          : 'linear-gradient(180deg, #faf8f5 0%, #f5efe7 50%, #faf8f5 100%)',
      }}
    >
      <ReadingProgress active={view.type === 'post'} />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 10%, rgba(232,132,90,0.06), transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(144,112,192,0.05), transparent 40%)'
            : 'radial-gradient(ellipse at 20% 10%, rgba(192,83,43,0.04), transparent 40%), radial-gradient(ellipse at 80% 90%, rgba(144,112,192,0.03), transparent 40%)',
          transform: 'translateZ(0)',
          willChange: 'transform',
          contain: 'strict',
        }}
      />

      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>

      <div className="relative z-10">
        <Header
          onNavigateHome={navigateHome}
          onNavigateContact={navigateContact}
          showBack={view.type !== 'home'}
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
            onPostNavigate={navigateToPost}
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

        {view.type === 'contact' && <ContactPage onNavigateHome={navigateHome} />}
        {view.type === 'admin' && <AdminDashboard />}

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