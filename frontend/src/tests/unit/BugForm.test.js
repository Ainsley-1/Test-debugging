import { render, screen } from '@testing-library/react';
import BugForm from '../../components/BugForm';
ECHO is on.
  render(<BugForm />);
  expect(screen.getByPlaceholderText(/bug title/i)).toBeInTheDocument();
});
