import { render, screen } from '@testing-library/react';
import App from '../../App';
ECHO is on.
  render(<App />);
  expect(screen.getByText(/Bug Tracker Application/i)).toBeInTheDocument();
});
