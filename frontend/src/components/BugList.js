import { useState, useEffect } from 'react';
import BugItem from './BugItem';
import { bugAPI } from '../services/api';

const BugList = ({ refresh, onUpdate }) => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });

  const fetchBugs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (filter.status) filters.status = filter.status;
      if (filter.priority) filters.priority = filter.priority;

      const data = await bugAPI.getAllBugs(filters);
      setBugs(data.data);
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError('Failed to load bugs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, [refresh, filter]);

  const handleUpdate = async (id, updates) => {
    try {
      await bugAPI.updateBug(id, updates);
      fetchBugs();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating bug:', err);
      alert('Failed to update bug');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bug?')) {
      return;
    }

    try {
      await bugAPI.deleteBug(id);
      fetchBugs();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error deleting bug:', err);
      alert('Failed to delete bug');
    }
  };

  if (loading) {
    return <div className="loading">Loading bugs...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="bug-list-container">
      <div className="filters">
        <select 
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select 
          value={filter.priority}
          onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {bugs.length === 0 ? (
        <div className="empty-state">
          <p>No bugs found. Create one to get started!</p>
        </div>
      ) : (
        <div className="bug-list">
          {bugs.map(bug => (
            <BugItem 
              key={bug._id}
              bug={bug}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BugList;