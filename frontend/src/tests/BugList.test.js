import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BugList from '../components/BugList';
import { bugAPI } from '../services/api';

vi.mock('../services/api');

describe('BugList Component', () => {
  const mockBugs = [
    {
      _id: '1',
      title: 'Bug 1',
      description: 'Description 1',
      reportedBy: 'User 1',
      status: 'open',
      priority: 'high',
      assignedTo: 'Developer 1',
      createdAt: '2024-01-01'
    },
    {
      _id: '2',
      title: 'Bug 2',
      description: 'Description 2',
      reportedBy: 'User 2',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: 'Developer 2',
      createdAt: '2024-01-02'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    bugAPI.getAllBugs.mockImplementation(() => new Promise(() => {}));
    render(<BugList />);
    
    expect(screen.getByText(/loading bugs/i)).toBeInTheDocument();
  });

  it('displays bugs after loading', async () => {
    bugAPI.getAllBugs.mockResolvedValue({ data: mockBugs });
    render(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Bug 2')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    bugAPI.getAllBugs.mockRejectedValue(new Error('Network error'));
    render(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load bugs/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no bugs exist', async () => {
    bugAPI.getAllBugs.mockResolvedValue({ data: [] });
    render(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText(/no bugs found/i)).toBeInTheDocument();
    });
  });

  it('filters bugs by status', async () => {
    const user = userEvent.setup();
    bugAPI.getAllBugs.mockResolvedValue({ data: mockBugs });
    render(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
    });
    
    const statusFilter = screen.getByDisplayValue(/all statuses/i);
    await user.selectOptions(statusFilter, 'open');
    
    await waitFor(() => {
      expect(bugAPI.getAllBugs).toHaveBeenCalledWith({ status: 'open' });
    });
  });

  it('filters bugs by priority', async () => {
    const user = userEvent.setup();
    bugAPI.getAllBugs.mockResolvedValue({ data: mockBugs });
    render(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
    });
    
    const priorityFilter = screen.getByDisplayValue(/all priorities/i);
    await user.selectOptions(priorityFilter, 'high');
    
    await waitFor(() => {
      expect(bugAPI.getAllBugs).toHaveBeenCalledWith({ priority: 'high' });
    });
  });

  it('updates bug status', async () => {
    const user = userEvent.setup();
    bugAPI.getAllBugs.mockResolvedValue({ data: mockBugs });
    bugAPI.updateBug.mockResolvedValue({ success: true });
    
    render(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
    });
    
    const statusSelects = screen.getAllByRole('combobox');
    const bugStatusSelect = statusSelects.find(select => 
      select.value === 'open'
    );
    
    await user.selectOptions(bugStatusSelect, 'resolved');
    
    await waitFor(() => {
      expect(bugAPI.updateBug).toHaveBeenCalledWith('1', { status: 'resolved' });
    });
  });

  it('deletes bug with confirmation', async () => {
    const user = userEvent.setup();
    bugAPI.getAllBugs.mockResolvedValue({ data: mockBugs });
    bugAPI.deleteBug.mockResolvedValue({ success: true });
    
    window.confirm = vi.fn(() => true);
    
    render(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(bugAPI.deleteBug).toHaveBeenCalledWith('1');
    });
  });

  it('does not delete bug when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    bugAPI.getAllBugs.mockResolvedValue({ data: mockBugs });
    
    window.confirm = vi.fn(() => false);
    
    render(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Bug 1')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);
    
    expect(bugAPI.deleteBug).not.toHaveBeenCalled();
  });

  it('refreshes list when refresh prop changes', async () => {
    bugAPI.getAllBugs.mockResolvedValue({ data: mockBugs });
    
    const { rerender } = render(<BugList refresh={0} />);
    
    await waitFor(() => {
      expect(bugAPI.getAllBugs).toHaveBeenCalledTimes(1);
    });
    
    rerender(<BugList refresh={1} />);
    
    await waitFor(() => {
      expect(bugAPI.getAllBugs).toHaveBeenCalledTimes(2);
    });
  });
});
