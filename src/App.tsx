import { useState } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { ExploreMarketsPage } from './pages/ExploreMarketsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { DashboardPage } from './pages/DashboardPage';

type Page = 'landing' | 'explore' | 'project' | 'create' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleNavigation = (page: Page, projectId?: string) => {
    console.log('Navigating to:', page); // Debug log
    setCurrentPage(page);
    if (projectId) {
      setSelectedProjectId(projectId);
    }
    window.scrollTo(0, 0);
  };

  const handleConnectWallet = () => {
    handleNavigation('dashboard');
  };

  const renderPage = () => {
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
        return <DashboardPage />;
      default:
        return <LandingPage onProjectClick={(id) => handleNavigation('project', id)} />;
    }
  };

  return (
    <div className="min-h-screen" onClick={(e) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor?.href) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        console.log('Navigation clicked:', href); // Debug log
        if (href === '/' || href === '') {
          handleNavigation('landing');
        } else if (href === '/explore') {
          handleNavigation('explore');
        } else if (href === '/project') {
          handleNavigation('project');
        } else if (href === '/create') {
          handleNavigation('create');
        } else if (href === '/dashboard') {
          handleNavigation('dashboard');
        }
      }
    }}>
      <Header onConnectWallet={handleConnectWallet} />
      <div>
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
