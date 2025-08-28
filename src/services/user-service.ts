export class UserService {
  /**
   * Validates email format using a simple regex
   */
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validates age is within reasonable bounds
   */
  static validateAge(age: number): boolean {
    if (typeof age !== 'number' || isNaN(age)) {
      return false;
    }

    return age >= 0 && age <= 150;
  }

  /**
   * Sanitizes name by trimming whitespace and capitalizing first letter of each word
   */
  static sanitizeName(name: string): string {
    if (!name || typeof name !== 'string') {
      return '';
    }

    return name
      .trim()
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Validates complete user data
   */
  static validateUser(userData: { name: string; email: string; age: number }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.validateEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    if (!this.validateAge(userData.age)) {
      errors.push('Age must be between 0 and 150');
    }

    const sanitizedName = this.sanitizeName(userData.name);
    if (!sanitizedName) {
      errors.push('Name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
