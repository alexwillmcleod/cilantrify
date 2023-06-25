import { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function EmailSent() {
  const location = useLocation();
  const navigate = useNavigate();

  const { setToken } = useAuth();

  const email = location.state.email;

  const [code, setCode] = useState<string>();

  const handleCodeChange = (e: any) => {
    setCode(e.target.value.replace(/\D/g, ''));
  };

  const handleWrongEmail = () => {
    navigate('/auth/email');
  };

  const handleSubmitCode = async () => {
    if (!code) return;
    const numberCode = Number.parseInt(code!);
    if (!numberCode) return;
    try {
      const res = await axios.post('/auth/sso/sign-in', {
        code: numberCode,
        email,
      });
      setToken(res.data) > navigate('/dashboard');
      return;
    } catch (err: any) {
      if (err.message != 'Request failed with status code 404') return;
      navigate('/auth/email/create', {
        state: {
          email,
          code: numberCode,
        },
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-20 gap-10">
      <span className="flex flex-col gap-2 items-center">
        <p className="text-display text-2xl -center font-bold text-accent-blue">
          Email Sent to {email}
        </p>

        <p className="text-display text-lg font-regular text-accent-blue">
          Check your inbox!
        </p>
      </span>
      <span className="flex flex-col gap-2">
        <input
          value={code}
          onChange={handleCodeChange}
          type="text"
          className="rounded-md shadow-md p-2 border-2 border-accent-blue"
        />
        <button
          className="text-display text-lg font-bold bg-accent-blue text-white p-2 rounded-xl"
          onClick={handleSubmitCode}
        >
          Let's Go!
        </button>
        <button
          className="text-accent-blue "
          onClick={handleWrongEmail}
        >
          Wrong email
        </button>
      </span>
    </div>
  );
}
