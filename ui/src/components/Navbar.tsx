import defaultProfilePicture from '../assets/profile.svg';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [profilePicture, setProfilePicture] = useState<string>(
    defaultProfilePicture
  );
  const { getHeader } = useAuth();

  useState(() => {
    const fetchData = async () => {
      const res = await axios.get('/auth/info', {
        headers: {
          Authorization: getHeader(),
        },
      });
      setProfilePicture(res.data['picture'] || profilePicture);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-row p-10 justify-between sticky items-center">
      <span>
        <a
          href="/"
          className="font-bold font-display text-accent-green text-2xl sm:text-4xl"
        >
          Cilantrify
        </a>
      </span>
      <span>
        <img
          className="w-12 sm:w-14 rounded-full"
          src={profilePicture}
        ></img>
      </span>
    </div>
  );
}
