import { useCookies } from 'react-cookie';

const useAuth = () => {
  const [cookies, setCookie] = useCookies(['api-token']);
  const getToken = () => cookies['api-token'];
  const sixMonths = 60 * 60 * 24 * 30 * 6;
  const setToken = (newToken: string) => {
    setCookie('api-token', newToken, {
      sameSite: 'lax',
      maxAge: sixMonths,
      path: '/',
    });
  };
  const getHeader = () => `Bearer ${getToken()}`;
  return { getHeader, getToken, setToken };
};

export default useAuth;
