import { createRoot } from 'react-dom/client';
import App, { ErrorBoundary } from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

console.log('[main.tsx] Starting app initialization');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[main.tsx] Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found</div>';
} else {
  console.log('[main.tsx] Root element found, creating React root');
  
  try {
    createRoot(rootElement).render(
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    );
    console.log('[main.tsx] React app rendered successfully');
  } catch (err) {
    console.error('[main.tsx] Failed to render app:', err);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Error rendering app: ${(err as Error).message}</div>`;
  }
}
