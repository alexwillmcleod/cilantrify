import axios from 'axios';
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
  const [firstName, setFirstName] = useState('World');
  const { getHeader } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('auth/info', {
        headers: {
          Authorization: getHeader(),
        },
      });
      setFirstName(res.data['given_name']);
    };
    fetchData();
  });
  return <p>Hello, {firstName}!</p>;
}
