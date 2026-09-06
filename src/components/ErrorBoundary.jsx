import React from 'react'

// Error boundary for catching render errors in child components
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo)
      }
      return (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
          <div className="flex items-center gap-3 text-red-400 mb-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium">Visualization Error</span>
          </div>
          <p className="text-sm text-slate-500">
            This chart couldn't render. It will retry when new data arrives.
          </p>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-2 text-xs text-slate-600">
              <summary>Error details</summary>
              <pre className="mt-1 p-2 bg-slate-900 rounded overflow-auto">{this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}