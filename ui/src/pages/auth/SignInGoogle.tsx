import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

export default function SignInGoogle() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState('Signing in with Google...');
  const navigate = useNavigate();
  const code: string | null = searchParams.get('code');

  const { setToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.post('/auth/google/callback', {
        code,
      });
      const token = res.data;
      setToken(token);
    };
    fetchData();
    navigate('/recipe/create/ingredients');
  });

  return <div>{message}</div>;
}
