import LetsGoImage from '../../assets/lets-go.svg';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

export default function SignIn() {
  const { getHeader } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get('/auth/info', {
        headers: {
          Authorization: getHeader(),
        },
      });
      if (res.data != null) {
        navigate('/dashboard');
      }
    };
    fetchUser();
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className="grid grid-cols-2 max-lg:grid-cols-1 p-20 max-sm:p-6">
      <div className="flex flex-col justify-center items-center max-lg:hidden">
        <img
          className="w-[24rem]"
          src={LetsGoImage}
        />
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center gap-8 items-center">
          <p className="font-display font-bold text-5xl justify-center text-accent-blue max-sm:text-2xl">
            Let's Go!
          </p>
          <span className="flex flex-col gap-4 items-center">
            <a
              className="bg-accent-green px-4 py-2 w-fit rounded-xl font-bold text-white text-xl max-sm:text-sm"
              href={`${apiUrl}/auth/google`}
              // target="_blank"
            >
              <span className="flex flex-inline gap-[7px]">
                Continue with
                <span className="flex flex-inline gap-[0.2px]">
                  <p className="text-accent-blue">G</p>
                  <p className="text-accent-red">o</p>
                  <p className="text-accent-yellow">o</p>
                  <p className="text-accent-blue">g</p>
                  <p className="text-accent-dark-green">l</p>
                  <p className="text-accent-red">e</p>
                </span>
              </span>
            </a>
            <Link
              className="bg-accent-green px-4 py-2 w-fit rounded-xl font-bold text-white text-xl max-sm:text-sm"
              to="/sign-in"
            >
              <span className="flex flex-inline gap-[7px]">
                Continue with <p className="text-accent-red">Email</p>
              </span>
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
