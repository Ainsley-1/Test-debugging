const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, server } = require('../../server');
const Bug = require('../../models/Bug');

let mongoServer;

// Setup - Connect to in-memory MongoDB
beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  await Bug.deleteMany({});
});

// Teardown - Disconnect and stop server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  server.close();
});

describe('Bug API - Integration Tests', () => {
  describe('GET /api/bugs', () => {
    test('should return empty array when no bugs exist', async () => {
      const res = await request(app).get('/api/bugs');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    test('should return all bugs', async () => {
      await Bug.create([
        {
          title: 'Bug 1',
          description: 'Description for bug 1',
          reportedBy: 'User 1'
        },
        {
          title: 'Bug 2',
          description: 'Description for bug 2',
          reportedBy: 'User 2'
        }
      ]);

      const res = await request(app).get('/api/bugs');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });

    test('should filter bugs by status', async () => {
      await Bug.create([
        {
          title: 'Open Bug',
          description: 'Description',
          reportedBy: 'User',
          status: 'open'
        },
        {
          title: 'Resolved Bug',
          description: 'Description',
          reportedBy: 'User',
          status: 'resolved'
        }
      ]);

      const res = await request(app).get('/api/bugs?status=open');
      
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].status).toBe('open');
    });
  });

  describe('POST /api/bugs', () => {
    test('should create a new bug with valid data', async () => {
      const newBug = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reportedBy: 'Test User',
        priority: 'high'
      };

      const res = await request(app)
        .post('/api/bugs')
        .send(newBug);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(newBug.title);
      expect(res.body.data.status).toBe('open');
      expect(res.body.data.priority).toBe('high');
    });

    test('should fail with invalid data', async () => {
      const invalidBug = {
        title: 'ab',
        description: 'short',
        reportedBy: ''
      };

      const res = await request(app)
        .post('/api/bugs')
        .send(invalidBug);
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toBeDefined();
    });

    test('should sanitize input data', async () => {
      const bugWithHTML = {
        title: '<script>alert("xss")</script>Bug Title',
        description: 'Description with <b>HTML</b> tags',
        reportedBy: 'User<script>'
      };

      const res = await request(app)
        .post('/api/bugs')
        .send(bugWithHTML);
      
      expect(res.status).toBe(201);
      expect(res.body.data.title).not.toContain('<script>');
      expect(res.body.data.description).not.toContain('<b>');
    });
  });

  describe('GET /api/bugs/:id', () => {
    test('should return a specific bug', async () => {
      const bug = await Bug.create({
        title: 'Specific Bug',
        description: 'Description for specific bug',
        reportedBy: 'User'
      });

      const res = await request(app).get(`/api/bugs/${bug._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(bug._id.toString());
    });

    test('should return 404 for non-existent bug', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/bugs/${fakeId}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/bugs/invalid-id');
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/bugs/:id', () => {
    test('should update a bug', async () => {
      const bug = await Bug.create({
        title: 'Original Title',
        description: 'Original description',
        reportedBy: 'User',
        status: 'open'
      });

      const updates = {
        status: 'in-progress',
        assignedTo: 'Developer'
      };

      const res = await request(app)
        .put(`/api/bugs/${bug._id}`)
        .send(updates);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('in-progress');
      expect(res.body.data.assignedTo).toBe('Developer');
    });

    test('should return 404 when updating non-existent bug', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/bugs/${fakeId}`)
        .send({ status: 'resolved' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/bugs/:id', () => {
    test('should delete a bug', async () => {
      const bug = await Bug.create({
        title: 'Bug to Delete',
        description: 'This bug will be deleted',
        reportedBy: 'User'
      });

      const res = await request(app).delete(`/api/bugs/${bug._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const deletedBug = await Bug.findById(bug._id);
      expect(deletedBug).toBeNull();
    });

    test('should return 404 when deleting non-existent bug', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/bugs/${fakeId}`);
      
      expect(res.status).toBe(404);
    });
  });
});