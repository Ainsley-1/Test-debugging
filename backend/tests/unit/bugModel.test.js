const { validateBugData, sanitizeInput } = require('../../utils/validation');

describe('Validation Utils - Unit Tests', () => {
  describe('validateBugData', () => {
    test('should pass validation with valid data', () => {
      const validData = {
        title: 'Valid Bug Title',
        description: 'This is a valid bug description with enough characters',
        reportedBy: 'John Doe'
      };

      const result = validateBugData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail with short title', () => {
      const invalidData = {
        title: 'ab',
        description: 'Valid description here',
        reportedBy: 'John Doe'
      };

      const result = validateBugData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be at least 3 characters');
    });

    test('should fail with short description', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Short',
        reportedBy: 'John Doe'
      };

      const result = validateBugData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description must be at least 10 characters');
    });

    test('should fail without reporter name', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Valid description here',
        reportedBy: ''
      };

      const result = validateBugData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Reporter name is required');
    });

    test('should fail with invalid status', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Valid description here',
        reportedBy: 'John Doe',
        status: 'invalid-status'
      };

      const result = validateBugData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid status value');
    });

    test('should fail with invalid priority', () => {
      const invalidData = {
        title: 'Valid Title',
        description: 'Valid description here',
        reportedBy: 'John Doe',
        priority: 'super-urgent'
      };

      const result = validateBugData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid priority value');
    });

    test('should collect multiple errors', () => {
      const invalidData = {
        title: 'ab',
        description: 'short',
        reportedBy: ''
      };

      const result = validateBugData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('sanitizeInput', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = sanitizeInput(input);
      
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    test('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeInput(input);
      
      expect(result).toBe('Hello World');
    });

    test('should handle non-string input', () => {
      const input = 123;
      const result = sanitizeInput(input);
      
      expect(result).toBe(123);
    });

    test('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });
});