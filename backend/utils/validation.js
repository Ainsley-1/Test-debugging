const validateBugData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!data.reportedBy || data.reportedBy.trim().length === 0) {
    errors.push('Reporter name is required');
  }

  const validStatuses = ['open', 'in-progress', 'resolved'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('Invalid status value');
  }

  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push('Invalid priority value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  validateBugData,
  sanitizeInput
};