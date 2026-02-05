/**
 * Validation utilities for forms
 */

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
    return errors;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
};

/**
 * Validate password
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options;
  
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return errors;
  }
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

/**
 * Validate username
 */
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username is required');
    return errors;
  }
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  
  if (username.length > 20) {
    errors.push('Username must not exceed 20 characters');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return errors;
};

/**
 * Validate SKU
 */
export const validateSKU = (sku) => {
  const errors = [];
  
  if (!sku) {
    errors.push('SKU is required');
    return errors;
  }
  
  if (sku.length < 2) {
    errors.push('SKU must be at least 2 characters');
  }
  
  if (sku.length > 50) {
    errors.push('SKU must not exceed 50 characters');
  }
  
  if (!/^[A-Z0-9-]+$/.test(sku)) {
    errors.push('SKU can only contain uppercase letters, numbers, and hyphens');
  }
  
  return errors;
};

/**
 * Validate product name
 */
export const validateProductName = (name) => {
  const errors = [];
  
  if (!name) {
    errors.push('Product name is required');
    return errors;
  }
  
  if (name.length < 2) {
    errors.push('Product name must be at least 2 characters');
  }
  
  if (name.length > 200) {
    errors.push('Product name must not exceed 200 characters');
  }
  
  return errors;
};

/**
 * Validate number (quantity, price, etc.)
 */
export const validateNumber = (value, options = {}) => {
  const {
    min = 0,
    max = Infinity,
    required = true,
    integer = false,
    fieldName = 'Value',
  } = options;
  
  const errors = [];
  
  if (required && (value === null || value === undefined || value === '')) {
    errors.push(`${fieldName} is required`);
    return errors;
  }
  
  const num = Number(value);
  
  if (isNaN(num)) {
    errors.push(`${fieldName} must be a valid number`);
    return errors;
  }
  
  if (integer && !Number.isInteger(num)) {
    errors.push(`${fieldName} must be a whole number`);
  }
  
  if (num < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }
  
  if (num > max) {
    errors.push(`${fieldName} must not exceed ${max}`);
  }
  
  return errors;
};

/**
 * Validate file
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    required = false,
  } = options;
  
  const errors = [];
  
  if (!file) {
    if (required) {
      errors.push('File is required');
    }
    return errors;
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must not exceed ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  return errors;
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  const errors = [];
  
  if (!phone) {
    return errors; // Optional field
  }
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) {
    errors.push('Phone number must be at least 10 digits');
  }
  
  if (cleaned.length > 15) {
    errors.push('Phone number must not exceed 15 digits');
  }
  
  return errors;
};

/**
 * Validate URL
 */
export const validateURL = (url) => {
  const errors = [];
  
  if (!url) {
    return errors; // Optional field
  }
  
  try {
    new URL(url);
  } catch (error) {
    errors.push('Invalid URL format');
  }
  
  return errors;
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  if (!startDate || !endDate) {
    return errors; // Optional
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    errors.push('Start date must be before end date');
  }
  
  return errors;
};

/**
 * Generic form validator
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = data[field];
    const fieldErrors = [];
    
    // Required validation
    if (fieldRules.required && !value) {
      fieldErrors.push(`${fieldRules.label || field} is required`);
    }
    
    // Min length validation
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      fieldErrors.push(`${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`);
    }
    
    // Max length validation
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      fieldErrors.push(`${fieldRules.label || field} must not exceed ${fieldRules.maxLength} characters`);
    }
    
    // Min value validation
    if (fieldRules.min !== undefined && value !== undefined && Number(value) < fieldRules.min) {
      fieldErrors.push(`${fieldRules.label || field} must be at least ${fieldRules.min}`);
    }
    
    // Max value validation
    if (fieldRules.max !== undefined && value !== undefined && Number(value) > fieldRules.max) {
      fieldErrors.push(`${fieldRules.label || field} must not exceed ${fieldRules.max}`);
    }
    
    // Pattern validation
    if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
      fieldErrors.push(fieldRules.patternMessage || `${fieldRules.label || field} format is invalid`);
    }
    
    // Custom validation
    if (fieldRules.validate && value) {
      const customError = fieldRules.validate(value, data);
      if (customError) {
        fieldErrors.push(customError);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Get first error message from errors object
 */
export const getFirstError = (errors) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }
  
  const firstField = Object.keys(errors)[0];
  const fieldErrors = errors[firstField];
  
  return Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
};