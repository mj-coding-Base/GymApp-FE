import { useEffect } from 'react';

const CookieDebug = () => {
  useEffect(() => {
    console.log('All cookies:', document.cookie);
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user-details='));
    console.log('Raw user-details cookie:', userCookie);
  }, []);

  return null;
};

export default CookieDebug;