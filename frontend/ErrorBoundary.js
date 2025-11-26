import React from 'react';
ECHO is on.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
ECHO is on.
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
ECHO is on.
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
ECHO is on.
  render() {
    if (this.state.hasError) {
    }
    return this.props.children;
  }
}
ECHO is on.
export default ErrorBoundary;
