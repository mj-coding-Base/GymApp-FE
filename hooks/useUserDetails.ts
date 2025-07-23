import { useState, useEffect } from 'react';

// Global variable to store user data
let globalUser: any = null;

const useUserDetails = () => {
  const [user, setUser] = useState<any>(globalUser);
  const [loading, setLoading] = useState(true);

  const getCookie = (name: string) => {
    try {
      if (typeof document === 'undefined') return null;
      const value = document.cookie
        .split('; ')
        .find(row => row.trim().startsWith(`${name}=`))
        ?.split('=')[1];
      return value ? decodeURIComponent(value) : null;
    } catch (err) {
      console.error('Error reading cookie:', err);
      return null;
    }
  };

  const loadUser = () => {
    const userCookie = getCookie('user-details');
    
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(userCookie);
        globalUser = parsedUser; // Update global state
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial load
    loadUser();

    // Listen for storage events (cross-tab synchronization)
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { user, loading, refresh: loadUser };
};

// Export function to update user state globally
export const updateUserState = (userData: any) => {
  globalUser = userData;
  // Trigger storage event to sync across tabs
  window.dispatchEvent(new Event('storage'));
};

export default useUserDetails;