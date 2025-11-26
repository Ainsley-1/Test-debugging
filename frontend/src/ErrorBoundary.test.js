import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';
ECHO is on.
  render(
    <ErrorBoundary>
      <div>Test Content</div>
    </ErrorBoundary>
  );
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});
