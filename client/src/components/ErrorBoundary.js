import React from 'react';

/** Catches render errors so one broken screen shows a recovery message instead of a blank page. */
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="section center">
        <div className="container" style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 32, color: 'var(--navy-800)', marginBottom: 10 }}>Something went wrong</h1>
          <p className="muted">An unexpected error occurred. Please reload the page and try again.</p>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => window.location.assign('/')}>
            Back to home
          </button>
        </div>
      </section>
    );
  }
}
