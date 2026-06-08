import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { useAppStore } from './store';
import { supabase } from './config/supabase';
import ErrorBoundary from './components/ErrorBoundary';

function Root() {
  const setUser = useAppStore((state) => state.setUser);
  const setSession = useAppStore((state) => state.setSession);

  useEffect(() => {
    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      }).catch(() => {
        // Ignore if supabase is not configured
        setSession(null);
        setUser(null);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      return () => {
        try {
          subscription.unsubscribe();
        } catch {
          // Ignore errors during cleanup
        }
      };
    } catch {
      // Ignore any errors from supabase setup
      setSession(null);
      setUser(null);
    }
  }, [setUser, setSession]);

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  );
}
