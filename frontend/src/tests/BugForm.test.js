import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BugForm from '../components/BugForm';

describe('BugForm Component', () => {
  it('renders all form fields', () => {
    render(<BugForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/bug title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reported by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    const handleSubmit = vi.fn();
    render(<BugForm onSubmit={handleSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/reporter name is required/i)).toBeInTheDocument();
    });
    
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for short title', async () => {
    const user = userEvent.setup();
    render(<BugForm onSubmit={vi.fn()} />);
    
    const titleInput = screen.getByLabelText(/bug title/i);
    await user.type(titleInput, 'ab');
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short description', async () => {
    const user = userEvent.setup();
    render(<BugForm onSubmit={vi.fn()} />);
    
    const descInput = screen.getByLabelText(/description/i);
    await user.type(descInput, 'short');
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('clears validation errors when user types', async () => {
    const user = userEvent.setup();
    render(<BugForm onSubmit={vi.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: /report bug/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    });
    
    const titleInput = screen.getByLabelText(/bug title/i);
    await user.type(titleInput, 'Valid Title');
    
    await waitFor(() => {
      expect(screen.queryByText(/title must be at least 3 characters/i)).not.toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<BugForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/bug title/i), 'Test Bug');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    
    await user.click(screen.getByRole('button', { name: /report bug/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Test Bug',
        description: 'This is a detailed description',
        reportedBy: 'Test User',
        priority: 'medium',
        status: 'open',
        assignedTo: ''
      });
    });
  });

  it('allows selecting priority and status', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<BugForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/bug title/i), 'Test Bug');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description');
    await user.type(screen.getByLabelText(/reported by/i), 'Test User');
    
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
    await user.selectOptions(screen.getByLabelText(/status/i), 'in-progress');
    
    await user.click(screen.getByRole('button', { name: /report bug/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high',
          status: 'in-progress'
        })
      );
    });
  });

  it('resets form after successful submission when not in edit mode', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<BugForm onSubmit={handleSubmit} />);
    
    const titleInput = screen.getByLabelText(/bug title/i);
    const descInput = screen.getByLabelText(/description/i);
    const reporterInput = screen.getByLabelText(/reported by/i);
    
    await user.type(titleInput, 'Test Bug');
    await user.type(descInput, 'Test Description');
    await user.type(reporterInput, 'Test User');
    
    await user.click(screen.getByRole('button', { name: /report bug/i }));
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descInput).toHaveValue('');
      expect(reporterInput).toHaveValue('');
    });
  });

  it('populates form with initial data in edit mode', () => {
    const initialData = {
      title: 'Existing Bug',
      description: 'Existing description',
      reportedBy: 'Original Reporter',
      priority: 'high',
      status: 'in-progress',
      assignedTo: 'Developer'
    };
    
    render(<BugForm onSubmit={vi.fn()} initialData={initialData} />);
    
    expect(screen.getByLabelText(/bug title/i)).toHaveValue('Existing Bug');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description');
    expect(screen.getByLabelText(/reported by/i)).toHaveValue('Original Reporter');
    expect(screen.getByLabelText(/priority/i)).toHaveValue('high');
    expect(screen.getByLabelText(/status/i)).toHaveValue('in-progress');
  });

  it('disables reporter field in edit mode', () => {
    const initialData = {
      title: 'Bug',
      description: 'Description',
      reportedBy: 'User'
    };
    
    render(<BugForm onSubmit={vi.fn()} initialData={initialData} />);
    
    expect(screen.getByLabelText(/reported by/i)).toBeDisabled();
  });
});
