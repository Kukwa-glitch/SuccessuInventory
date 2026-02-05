/**
 * Application Constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',
  UPDATE_PASSWORD: '/auth/update-password',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  ADD_STOCK: (id) => `/products/${id}/add-stock`,
  DEDUCT_STOCK: (id) => `/products/${id}/deduct-stock`,
  CATEGORIES: '/products/categories',
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id) => `/transactions/${id}`,
  TRANSACTIONS_BY_PRODUCT: (id) => `/transactions/product/${id}`,
  RECENT_TRANSACTIONS: '/transactions/recent',
  
  // Documents
  DOCUMENTS: '/documents',
  DOCUMENT_BY_ID: (id) => `/documents/${id}`,
  DOCUMENTS_BY_PRODUCT: (id) => `/documents/product/${id}`,
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_BY_CATEGORY: '/dashboard/by-category',
  DASHBOARD_LOW_STOCK: '/dashboard/low-stock',
  
  // Reports
  EXPORT_INVENTORY: '/reports/inventory',
  EXPORT_DOCUMENTS: '/reports/documents',
  ANALYTICS: '/reports/analytics',
};

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued',
};

// Stock Status
export const STOCK_STATUS = {
  IN_STOCK: 'in-stock',
  LOW_STOCK: 'low-stock',
  OUT_OF_STOCK: 'out-of-stock',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  ADD: 'add',
  DEDUCT: 'deduct',
  ADJUST: 'adjust',
};

// Document Types
export const DOCUMENT_TYPES = {
  IMAGE: 'image',
  PDF: 'pdf',
  DOCUMENT: 'document',
};

// Units of Measurement
export const UNITS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'g', label: 'Grams' },
  { value: 'l', label: 'Liters' },
  { value: 'ml', label: 'Milliliters' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'pair', label: 'Pair' },
];

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'darkMode',
  SIDEBAR_STATE: 'sidebarOpen',
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MM/DD/YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
};

// Breakpoints (should match Tailwind config)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Navigation Items
export const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    badge: null,
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: 'Box',
    badge: 'products',
  },
  {
    path: '/transactions',
    label: 'Transactions',
    icon: 'Activity',
    badge: null,
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: 'PieChart',
    badge: null,
  },
  {
    path: '/documents',
    label: 'Documents',
    icon: 'FileText',
    badge: null,
  },
];

// Status Colors
export const STATUS_COLORS = {
  'in-stock': {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800',
  },
  'low-stock': {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  'out-of-stock': {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please login again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UPLOAD_ERROR: 'File upload failed. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  LOGOUT: 'Logged out successfully',
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  STOCK_ADDED: 'Stock added successfully',
  STOCK_DEDUCTED: 'Stock deducted successfully',
  PASSWORD_UPDATED: 'Password updated successfully',
};

// Query Keys (for React Query)
export const QUERY_KEYS = {
  PRODUCTS: 'products',
  PRODUCT: 'product',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  TRANSACTION: 'transaction',
  DOCUMENTS: 'documents',
  DOCUMENT: 'document',
  DASHBOARD_STATS: 'dashboard-stats',
  DASHBOARD_CATEGORY: 'dashboard-category',
  LOW_STOCK: 'low-stock',
  RECENT_ACTIVITY: 'recent-activity',
  ANALYTICS: 'analytics',
  CURRENT_USER: 'current-user',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  SKU: /^[A-Z0-9-]+$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
  URL: /^https?:\/\/.+/,
};

// Animation Durations (in ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Default Values
export const DEFAULTS = {
  MIN_STOCK_LEVEL: 10,
  PRODUCT_UNIT: 'pcs',
  PRODUCT_STATUS: 'active',
  USER_ROLE: 'staff',
  PRODUCT_PRICE: 0,
  PRODUCT_QUANTITY: 0,
  LOCATION: 'Main Warehouse',
};

export default {
  API_ENDPOINTS,
  ROLES,
  PRODUCT_STATUS,
  STOCK_STATUS,
  TRANSACTION_TYPES,
  DOCUMENT_TYPES,
  UNITS,
  FILE_LIMITS,
  PAGINATION,
  STORAGE_KEYS,
  TOAST_TYPES,
  DATE_FORMATS,
  BREAKPOINTS,
  NAV_ITEMS,
  STATUS_COLORS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  QUERY_KEYS,
  REGEX_PATTERNS,
  ANIMATION,
  DEFAULTS,
};