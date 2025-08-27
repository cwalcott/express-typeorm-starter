import { describe, it, expect } from 'vitest';
import { UserService } from '../services/UserService.js';

describe('UserService', () => {
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(UserService.validateEmail('test@example.com')).toBe(true);
      expect(UserService.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(UserService.validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(UserService.validateEmail('invalid-email')).toBe(false);
      expect(UserService.validateEmail('user@')).toBe(false);
      expect(UserService.validateEmail('@domain.com')).toBe(false);
      expect(UserService.validateEmail('user@domain')).toBe(false);
      expect(UserService.validateEmail('')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(UserService.validateEmail(null as unknown as string)).toBe(false);
      expect(UserService.validateEmail(undefined as unknown as string)).toBe(false);
      expect(UserService.validateEmail(123 as unknown as string)).toBe(false);
    });

    it('should handle emails with whitespace', () => {
      expect(UserService.validateEmail('  test@example.com  ')).toBe(true);
      expect(UserService.validateEmail(' invalid email ')).toBe(false);
    });
  });

  describe('validateAge', () => {
    it('should return true for valid ages', () => {
      expect(UserService.validateAge(0)).toBe(true);
      expect(UserService.validateAge(25)).toBe(true);
      expect(UserService.validateAge(150)).toBe(true);
    });

    it('should return false for invalid ages', () => {
      expect(UserService.validateAge(-1)).toBe(false);
      expect(UserService.validateAge(151)).toBe(false);
    });

    it('should return false for non-number inputs', () => {
      expect(UserService.validateAge('25' as unknown as number)).toBe(false);
      expect(UserService.validateAge(null as unknown as number)).toBe(false);
      expect(UserService.validateAge(undefined as unknown as number)).toBe(false);
      expect(UserService.validateAge(NaN)).toBe(false);
    });
  });

  describe('sanitizeName', () => {
    it('should capitalize first letter of each word', () => {
      expect(UserService.sanitizeName('john doe')).toBe('John Doe');
      expect(UserService.sanitizeName('mary jane watson')).toBe('Mary Jane Watson');
    });

    it('should trim whitespace', () => {
      expect(UserService.sanitizeName('  john doe  ')).toBe('John Doe');
      expect(UserService.sanitizeName('\t\njohn doe\n\t')).toBe('John Doe');
    });

    it('should handle mixed case input', () => {
      expect(UserService.sanitizeName('jOHN dOE')).toBe('John Doe');
      expect(UserService.sanitizeName('MARY jane')).toBe('Mary Jane');
    });

    it('should remove extra spaces between words', () => {
      expect(UserService.sanitizeName('john    doe')).toBe('John Doe');
      expect(UserService.sanitizeName('mary  jane   watson')).toBe('Mary Jane Watson');
    });

    it('should return empty string for invalid inputs', () => {
      expect(UserService.sanitizeName('')).toBe('');
      expect(UserService.sanitizeName('   ')).toBe('');
      expect(UserService.sanitizeName(null as unknown as string)).toBe('');
      expect(UserService.sanitizeName(undefined as unknown as string)).toBe('');
    });

    it('should handle single word names', () => {
      expect(UserService.sanitizeName('john')).toBe('John');
      expect(UserService.sanitizeName('MARY')).toBe('Mary');
    });
  });

  describe('validateUser', () => {
    it('should return valid for correct user data', () => {
      const result = UserService.validateUser({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid email', () => {
      const result = UserService.validateUser({
        name: 'John Doe',
        email: 'invalid-email',
        age: 30
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should return errors for invalid age', () => {
      const result = UserService.validateUser({
        name: 'John Doe',
        email: 'john@example.com',
        age: 200
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age must be between 0 and 150');
    });

    it('should return errors for empty name', () => {
      const result = UserService.validateUser({
        name: '   ',
        email: 'john@example.com',
        age: 30
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const result = UserService.validateUser({
        name: '',
        email: 'invalid',
        age: -5
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Age must be between 0 and 150');
      expect(result.errors).toContain('Name is required');
    });
  });
});
