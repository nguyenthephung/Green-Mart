// Debug utility for authentication
export const authDebug = {
  log: (action: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH DEBUG] ${action}:`, data);
    }
  },
  
  logUserState: (user: any, isAuthenticated: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH DEBUG] User State:', {
        user: user ? { id: user.id, email: user.email, role: user.role } : null,
        isAuthenticated,
        hasToken: !!localStorage.getItem('token')
      });
    }
  },
  
  logNavigation: (from: string, to: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH DEBUG] Navigation: ${from} -> ${to}`);
    }
  }
};
