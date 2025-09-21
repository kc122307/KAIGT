// Global error handling utilities
// This helps prevent browser extension errors from cluttering the console

/**
 * Setup global error handlers to catch and filter common extension-related errors
 */
export const setupGlobalErrorHandling = () => {
  // List of error messages from browser extensions that we want to suppress
  const extensionErrorPatterns = [
    'Video element not found for attaching listeners',
    'Extension context invalidated',
    'chrome-extension://',
    'moz-extension://',
    'webkit-masked-url:',
    'Non-Error promise rejection captured',
  ];

  // Override console.error to filter extension errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ').toString();
    
    // Check if this is an extension-related error we want to suppress
    const isExtensionError = extensionErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Also check for common GSAP errors
    const isGSAPError = errorMessage.includes('GSAP target') || 
                       errorMessage.includes('Invalid scope') ||
                       errorMessage.includes('not found. https://gsap.com');
    
    // Only log non-extension and non-GSAP errors
    if (!isExtensionError && !isGSAPError) {
      originalConsoleError.apply(console, args);
    }
  };
  
  // Also override console.warn for GSAP warnings
  console.warn = (...args: any[]) => {
    const warnMessage = args.join(' ').toString();
    
    const isGSAPWarning = warnMessage.includes('GSAP') || 
                         warnMessage.includes('Invalid scope') ||
                         warnMessage.includes('not found');
    
    if (!isGSAPWarning) {
      originalConsoleWarn.apply(console, args);
    }
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.toString() || '';
    
    // Check if this is an extension-related error
    const isExtensionError = extensionErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isExtensionError) {
      event.preventDefault(); // Prevent the error from being logged
    }
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';
    
    // Check if this is an extension-related error
    const isExtensionError = extensionErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase()) ||
      errorSource.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isExtensionError) {
      event.preventDefault(); // Prevent the error from being logged
    }
  });
};

/**
 * Clean up GSAP-specific console warnings
 */
export const suppressGSAPWarnings = () => {
  // Store the original GSAP warning function if it exists
  if (typeof window !== 'undefined' && (window as any).gsap) {
    const gsap = (window as any).gsap;
    
    // Override GSAP's warning system to be less verbose for missing elements
    if (gsap.utils && gsap.utils.toArray) {
      const originalToArray = gsap.utils.toArray;
      
      gsap.utils.toArray = (targets: any) => {
        const result = originalToArray(targets);
        
        // If no elements found, don't throw warnings for common selectors
        if (result.length === 0 && typeof targets === 'string') {
          const commonSelectors = ['.goal-card', '.stats-card', '.parallax-sidebar', '.scroll-fade'];
          
          if (commonSelectors.includes(targets)) {
            // Return empty array silently for these selectors
            return [];
          }
        }
        
        return result;
      };
    }
  }
};

/**
 * Initialize all error handling
 */
export const initializeErrorHandling = () => {
  setupGlobalErrorHandling();
  suppressGSAPWarnings();
  
  // Log that error handling is active (only in development)
  if (import.meta.env.DEV) {
    console.log('🛡️ Global error handling initialized');
  }
};