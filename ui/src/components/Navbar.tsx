import defaultProfilePicture from '../assets/profile.svg';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [profilePicture, setProfilePicture] = useState<string>(
    defaultProfilePicture
  );
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { getHeader } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/auth/info', {
        headers: {
          Authorization: getHeader(),
        },
      });
      setProfilePicture(res.data['picture'] || profilePicture);
      // if (res.data != null) setIsLoggedIn(true);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-row p-10 justify-between sticky items-center">
      <span>
        <a
          href="/dashboard"
          className="font-bold font-display text-accent-green text-2xl sm:text-4xl"
        >
          Cilantrify
        </a>
      </span>
      <a>
        <img
          className="w-12 sm:w-14 rounded-full"
          src={profilePicture}
        ></img>
      </a>
    </div>
  );
}
