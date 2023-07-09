import { createSignal } from 'solid-js';
import Cookies from 'js-cookie';

export function useAuth() {
  const login = (newToken: string) => {
    Cookies.set('auth-token', newToken);
  };
  const logout = () => {
    Cookies.remove('auth-token');
  };
  const getHeader = () => {
    const token = Cookies.get('auth-token');
    if (!token) return '';
    return `Bearer ${token}`;
  };

  return {
    login,
    logout,
    getHeader,
  };
}
