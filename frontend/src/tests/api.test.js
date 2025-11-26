import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { bugAPI } from '../services/api';

vi.mock('axios');

describe('Bug API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllBugs', () => {
    it('fetches all bugs without filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ _id: '1', title: 'Bug 1' }]
        }
      };
      
      axios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse)
      });
      
      const result = await bugAPI.getAllBugs();
      
      expect(result).toEqual(mockResponse.data);
    });

    it('fetches bugs with filters', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: { success: true, data: [] }
      });
      
      axios.create.mockReturnValue({ get: mockGet });
      
      await bugAPI.getAllBugs({ status: 'open', priority: 'high' });
      
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('status=open'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('priority=high'));
    });
  });

  describe('createBug', () => {
    it('creates a new bug', async () => {
      const newBug = {
        title: 'New Bug',
        description: 'Description',
        reportedBy: 'User'
      };
      
      const mockResponse = {
        data: {
          success: true,
          data: { _id: '1', ...newBug }
        }
      };
      
      axios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue(mockResponse)
      });
      
      const result = await bugAPI.createBug(newBug);
      
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateBug', () => {
    it('updates an existing bug', async () => {
      const updates = { status: 'resolved' };
      const mockResponse = {
        data: {
          success: true,
          data: { _id: '1', status: 'resolved' }
        }
      };
      
      axios.create.mockReturnValue({
        put: vi.fn().mockResolvedValue(mockResponse)
      });
      
      const result = await bugAPI.updateBug('1', updates);
      
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteBug', () => {
    it('deletes a bug', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Bug deleted'
        }
      };
      
      axios.create.mockReturnValue({
        delete: vi.fn().mockResolvedValue(mockResponse)
      });
      
      const result = await bugAPI.deleteBug('1');
      
      expect(result).toEqual(mockResponse.data);
    });
  });
});