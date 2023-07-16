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
  handleGoogleLogin: (token: string) => Promise<void>;
  handleSSOLogin: (email: string, code: number) => Promise<void>;
  handleSSOCreate: (
    email: string,
    code: number,
    givenName: string,
    familyName: string
  ) => Promise<void>;
  getLoginData: () => void;
  setProfilePicture: (image: string) => void;
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

  const setProfilePicture = (image: string) => {
    setUser({ ...user()!, picture: image });
  };

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

  const handleSSOLogin = async (email: string, code: number) => {
    // We are going to handle logging in with email and code
    const res = await axios.post('/auth/sso/sign-in', {
      email,
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

  const handleSSOCreate = async (
    email: string,
    code: number,
    givenName: string,
    familyName: string
  ) => {
    // We are going to handle logging in with email and code
    try {
      const res = await axios.post('/auth/sso/create', {
        email,
        code,
        given_name: givenName,
        family_name: familyName,
      });
      const token = await res.data;
      Cookies.set('cilantrify-api-token', token, {
        secure: true,
        expires: 30,
      });
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      await getUserData();
    } catch (err) {
      console.error(err);
    }
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
      value={{
        user,
        handleGoogleLogin,
        handleSSOLogin,
        handleSSOCreate,
        getLoginData,
        handleLogout,
        setProfilePicture,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
