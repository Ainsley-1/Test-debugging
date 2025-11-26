const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');
const { validateBugData, sanitizeInput } = require('../utils/validation');

// Get all bugs
router.get('/', async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const bugs = await Bug.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: bugs.length,
      data: bugs
    });
  } catch (error) {
    next(error);
  }
});

// Get single bug
router.get('/:id', async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found'
      });
    }

    res.json({
      success: true,
      data: bug
    });
  } catch (error) {
    next(error);
  }
});

// Create new bug
router.post('/', async (req, res, next) => {
  try {
    const validation = validateBugData(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const sanitizedData = {
      title: sanitizeInput(req.body.title),
      description: sanitizeInput(req.body.description),
      reportedBy: sanitizeInput(req.body.reportedBy),
      status: req.body.status || 'open',
      priority: req.body.priority || 'medium',
      assignedTo: req.body.assignedTo ? sanitizeInput(req.body.assignedTo) : 'Unassigned'
    };

    const bug = await Bug.create(sanitizedData);
    
    res.status(201).json({
      success: true,
      data: bug
    });
  } catch (error) {
    next(error);
  }
});

// Update bug
router.put('/:id', async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found'
      });
    }

    const allowedUpdates = ['title', 'description', 'status', 'priority', 'assignedTo'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = typeof req.body[key] === 'string' 
          ? sanitizeInput(req.body[key]) 
          : req.body[key];
      }
    });

    const updatedBug = await Bug.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedBug
    });
  } catch (error) {
    next(error);
  }
});

// Delete bug
router.delete('/:id', async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    
    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found'
      });
    }

    await Bug.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Bug deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;