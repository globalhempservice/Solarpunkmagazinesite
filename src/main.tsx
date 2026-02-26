
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// ─── Global safety net ──────────────────────────────────────────────────────
// Catch uncaught JS errors and unhandled promise rejections BEFORE they kill
// the tab. We log them but suppress the browser's default "unhandled" console
// noise so the error tracking remains clean.
window.addEventListener('error', (e) => {
  console.error('[uncaught error]', e.error ?? e.message)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandled promise]', e.reason)
  // Don't let benign network/fetch rejections bubble to crash reports
  if (
    e.reason?.name === 'AbortError' ||
    e.reason?.message?.includes('Failed to fetch') ||
    e.reason?.message?.includes('NetworkError')
  ) {
    e.preventDefault()
  }
})

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary label="app">
    <App />
  </ErrorBoundary>
)
  