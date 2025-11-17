import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { ExploreMarketsPage } from './pages/ExploreMarketsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { Footer } from './components/Footer';

type Page = 'landing' | 'explore' | 'project' | 'create' | 'dashboard' | 'profile' | 'settings';

const VALID_PAGES: Readonly<Set<string>> = new Set<Page>([
  'landing', 'explore', 'project', 'create', 'dashboard', 'profile', 'settings'
]);

function isValidPage(page: string | null | undefined): page is Page {
  return !!page && VALID_PAGES.has(page);
}
type AuthUser = { id: string; name: string; avatarUrl?: string };

// Error Boundary Component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#dc2626', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
              Application Error
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              {this.state.error?.message || 'Something went wrong'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function selectAvatarUrl(session: any): string | undefined {
  const meta: any = session?.user?.user_metadata || {};
  const direct = meta.avatar_url || meta.picture;
  if (direct) return direct as string;
  const identities: any[] = session?.user?.identities || [];
  const discord = identities.find((i) => i?.provider === 'discord');
  const idData: any = discord?.identity_data || {};
  const sub = idData.sub || meta.sub;
  const avatar = idData.avatar || meta.avatar;
  if (sub && avatar) {
    return `https://cdn.discordapp.com/avatars/${sub}/${avatar}.png?size=128`;
  }
  return undefined;
}

function App() {
  
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | undefined>(undefined);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNavigation = (page: Page, projectId?: string) => {
    
    setCurrentPage(page);
    if (projectId) {
      setSelectedProjectId(projectId);
    } else {
      setSelectedProjectId(null);
    }
    
    // Update URL hash for better navigation history and bookmarking
    let path = `#/${page}`;
    if (page === 'project' && projectId) {
      path += `/${projectId}`;
    }
    window.location.hash = path;
    window.scrollTo(0, 0);
  };

  const handleConnectApp = async () => {
    // localStorage.setItem('postAuthRedirect', 'dashboard');
    const supabaseMod = await import('./lib/supabase');
    const supabase = supabaseMod.getSupabaseSafe?.() ?? null;
    if (!supabase) {
      setError('Supabase is not configured');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    try {
      const supabaseMod = await import('./lib/supabase');
      const supabase = supabaseMod.getSupabaseSafe?.() ?? null;
      if (supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setAuthUser(undefined);
      handleNavigation('landing');
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [page, projectId] = hash.split('/');
      
      
      if (isValidPage(page)) {
        setCurrentPage(page as Page);
        if (projectId) {
          setSelectedProjectId(projectId);
        }
      } else {
        // Default to landing if hash is invalid or empty
        setCurrentPage('landing');
        setSelectedProjectId(null);
      }
    };

    const checkSession = async () => {
      try {
        
        const supabaseMod = await import('./lib/supabase');
        const supabase = supabaseMod.getSupabaseSafe?.() ?? null;
        if (!supabase) {
          setAuthUser(undefined);
          return;
        }
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[App] Session error:', sessionError);
          setError(null);
          return;
        }
        
        const session = data.session;
        
        
        if (session) {
          const meta: any = session.user.user_metadata || {};
          const name: string = meta.full_name || meta.name || session.user.email || 'User';
          const avatarUrl: string | undefined = selectAvatarUrl(session);
          setAuthUser({ id: session.user.id, name, avatarUrl });
          

          const postAuthTarget = null; // localStorage.getItem('postAuthRedirect');
          if (postAuthTarget === 'dashboard') {
            handleNavigation('dashboard');
            // localStorage.removeItem('postAuthRedirect');
          } else {
            handleHashChange(); // Restore state from URL after auth
          }
        } else {
          setAuthUser(undefined);
          handleHashChange(); // Also handle hash on initial load without session
        }
      } catch (err) {
        console.error('[App] Error checking session:', err);
        setError(null);
      } finally {
        setIsInitializing(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    checkSession();

    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const supabaseMod = await import('./lib/supabase');
        const supabase = supabaseMod.getSupabaseSafe?.() ?? null;
        if (!supabase) return;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          
          if (session) {
            const target = null; // localStorage.getItem('postAuthRedirect');
            if (target === 'dashboard') {
              handleNavigation('dashboard');
              // localStorage.removeItem('postAuthRedirect');
            }
            const meta: any = session.user.user_metadata || {};
            const name: string = meta.full_name || meta.name || session.user.email || 'User';
            const avatarUrl: string | undefined = selectAvatarUrl(session);
            setAuthUser({ id: session.user.id, name, avatarUrl });
          } else {
            setAuthUser(undefined);
          }
        });
        unsub = () => subscription.unsubscribe();
      } catch (err) {
        console.error('[App] Error setting up auth listener:', err);
      }
    })();
    return () => {
      if (unsub) unsub();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (authUser) {
        try {
          const { getClient } = await import('./lib/linera');
          await getClient();
          
        } catch (error) {
          
          // Don't auto-initialize wallet - let user do it manually in Profile
          // This prevents blocking the UI during auth redirect
        }
      }
    })();
  }, [authUser]);

  const renderPage = () => {
    try {
      switch (currentPage) {
        case 'landing':
          return <LandingPage onProjectClick={(id) => handleNavigation('project', id)} />;
        case 'explore':
          return <ExploreMarketsPage onProjectClick={(id) => handleNavigation('project', id)} />;
        case 'project':
          return <ProjectDetailsPage projectId={selectedProjectId} />;
        case 'create':
          return <CreateProjectPage />;
        case 'dashboard':
          return <DashboardPage user={authUser} />;
        case 'profile':
          return <ProfilePage user={authUser} />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <LandingPage onProjectClick={(id) => handleNavigation('project', id)} />;
      }
    } catch (err) {
      console.error('[App] Error rendering page:', err);
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Page Error</h2>
            <p className="text-gray-600 mb-4">Failed to render {currentPage} page</p>
            <button
              onClick={() => handleNavigation('landing')}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
  };

  // Show loading state during initialization
  if (isInitializing) {
    
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #10B981',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '24px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '12px'
        }}>
          <h2 style={{ color: '#dc2626', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Error</h2>
          <p style={{ color: '#991b1b', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsInitializing(true);
              window.location.reload();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen" onClick={(e) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hasAttribute('href')) {
        const href = anchor.getAttribute('href')!;
        // Only prevent default for internal links starting with # or relative paths
        if (href.startsWith('#') || href.startsWith('/')) {
          e.preventDefault();
          const newHash = href.startsWith('#') ? href : `#${href.substring(1)}`;
          
          window.location.hash = newHash;
        }
        // External links will navigate normally
      }
    }}>
      <Header 
        onConnectApp={handleConnectApp}
        user={authUser}
        onProfile={() => handleNavigation('profile')}
        onSettings={() => handleNavigation('settings')}
        onLogout={handleLogout}
      />
      <div>
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
}

export default App;
