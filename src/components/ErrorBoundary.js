import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to your preferred error tracking service
    console.error('PhotoBooth Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>😢 Oops! Something went wrong</h2>
            <p>We're sorry for the inconvenience. Here are some things you can try:</p>
            <ul>
              <li>Refresh the page</li>
              <li>Check your camera permissions</li>
              <li>Try a different browser</li>
            </ul>
            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-btn">
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="refresh-btn"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;