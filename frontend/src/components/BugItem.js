const BugItem = ({ bug, onUpdate, onDelete }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#9c27b0'
    };
    return colors[priority] || '#757575';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#2196f3',
      'in-progress': '#ff9800',
      resolved: '#4caf50'
    };
    return colors[status] || '#757575';
  };

  const handleStatusChange = (newStatus) => {
    onUpdate(bug._id, { status: newStatus });
  };

  return (
    <div className="bug-item">
      <div className="bug-header">
        <h3>{bug.title}</h3>
        <div className="bug-badges">
          <span 
            className="badge priority"
            style={{ backgroundColor: getPriorityColor(bug.priority) }}
          >
            {bug.priority}
          </span>
          <span 
            className="badge status"
            style={{ backgroundColor: getStatusColor(bug.status) }}
          >
            {bug.status}
          </span>
        </div>
      </div>

      <p className="bug-description">{bug.description}</p>

      <div className="bug-meta">
        <div className="meta-item">
          <strong>Reported by:</strong> {bug.reportedBy}
        </div>
        <div className="meta-item">
          <strong>Assigned to:</strong> {bug.assignedTo || 'Unassigned'}
        </div>
        <div className="meta-item">
          <strong>Created:</strong> {new Date(bug.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="bug-actions">
        <select 
          value={bug.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="status-select"
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <button 
          onClick={() => onDelete(bug._id)}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BugItem;