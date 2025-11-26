import { useState } from 'react';

const BugForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    reportedBy: initialData?.reportedBy || '',
    priority: initialData?.priority || 'medium',
    status: initialData?.status || 'open',
    assignedTo: initialData?.assignedTo || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.reportedBy || formData.reportedBy.trim().length === 0) {
      newErrors.reportedBy = 'Reporter name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          reportedBy: '',
          priority: 'medium',
          status: 'open',
          assignedTo: ''
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bug-form">
      <div className="form-group">
        <label htmlFor="title">Bug Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'error' : ''}
          placeholder="Enter bug title"
        />
        {errors.title && <span className="error-text">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? 'error' : ''}
          placeholder="Describe the bug in detail"
          rows="4"
        />
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="reportedBy">Reported By *</label>
          <input
            type="text"
            id="reportedBy"
            name="reportedBy"
            value={formData.reportedBy}
            onChange={handleChange}
            className={errors.reportedBy ? 'error' : ''}
            placeholder="Your name"
            disabled={!!initialData}
          />
          {errors.reportedBy && <span className="error-text">{errors.reportedBy}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="assignedTo">Assigned To</label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            placeholder="Assignee name"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <button type="submit" className="submit-btn">
        {initialData ? 'Update Bug' : 'Report Bug'}
      </button>
    </form>
  );
};

export default BugForm;