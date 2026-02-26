import React from 'react'

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Wraps any subtree. If a component inside throws, we show a recovery
 * screen instead of a blank white page. This is the last line of defence
 * before the user sees "can't open this page".
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; label?: string },
  State
> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep the theme class so the page doesn't flash white even on error
    const savedTheme = localStorage.getItem('dewii-theme')
    if (savedTheme) document.documentElement.classList.add(savedTheme)

    console.error(`[ErrorBoundary:${this.props.label ?? 'root'}]`, error, info.componentStack)
  }

  private reload = () => window.location.reload()
  private reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: this.props.label ? '40vh' : '100vh',
          background: this.props.label ? 'transparent' : '#041F1A',
          color: 'white',
          gap: '12px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '2rem' }}>⚠️</span>
        <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
          {this.props.label ? `${this.props.label} failed to load` : 'Something went wrong'}
        </p>
        <p style={{ fontSize: '13px', opacity: 0.5, margin: 0 }}>
          {this.state.error?.message ?? 'An unexpected error occurred'}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {this.props.label && (
            <button
              onClick={this.reset}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          )}
          <button
            onClick={this.reload}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reload app
          </button>
        </div>
      </div>
    )
  }
}
