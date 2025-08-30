import { z } from 'zod';

export const UserSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Name must be 100 characters or less' })
    .trim()
    .transform((name) =>
      name
        .split(' ')
        .filter((word) => word.length > 0)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    ),
  email: z
    .email()
    .trim()
    .max(255, { message: 'Email must be 255 characters or less' })
    .toLowerCase(),
  age: z
    .number()
    .int({ message: 'Age must be an integer' })
    .min(0, { message: 'Age must be between 0 and 150' })
    .max(150, { message: 'Age must be between 0 and 150' })
    .optional()
});
