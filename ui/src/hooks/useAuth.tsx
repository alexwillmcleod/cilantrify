import {
  createContext,
  useContext,
  createSignal,
  Accessor,
  onMount,
} from 'solid-js';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext<{
  user: Accessor<User | undefined>;
  handleGoogleLogin: (token: string) => void;
  getLoginData: () => void;
  handleLogout: () => void;
}>();

interface User {
  picture: string | undefined;
  email: string;
  given_name: string;
  family_name: string;
  id: number;
}

export const AuthProvider = (props: any) => {
  const [user, setUser] = createSignal<User | undefined>(undefined);

  onMount(() => {
    getLoginData();
  });

  const handleGoogleLogin = async (code: string) => {
    const res = await axios.post('/auth/google/callback', {
      code,
    });
    const token = await res.data;
    Cookies.set('cilantrify-api-token', token, {
      secure: true,
      expires: 30,
    });
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    await getUserData();
  };

  const getLoginData = async () => {
    const token = Cookies.get('cilantrify-api-token');
    if (!token) return;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    await getUserData();
  };

  const getUserData = async () => {
    const res = await axios.get('/auth/info');
    const user: User = await res.data;
    setUser(user);
  };

  const handleLogout = () => {
    setUser(undefined);
    axios.defaults.headers.common.Authorization = undefined;
    Cookies.remove('cilantrify-api-token');
  };

  return (
    <AuthContext.Provider
      value={{ user, handleGoogleLogin, getLoginData, handleLogout }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
