import ContinueButton from '../../components/ContinueButton';
import { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

export default function SignInEmail() {
  const emailAddressInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinueClick = async () => {
    if (emailAddressInputRef.current == null) {
      setErrorMessage('Invalid Email Address');
      setIsErrorVisible(true);
      return;
    }
    if (emailAddressInputRef.current!.value == '') {
      setErrorMessage('Invalid Email Address');
      setIsErrorVisible(true);
      return;
    }
    const res = await axios.post('/auth/sso', {
      email: emailAddressInputRef.current!.value,
    });
    if (res.status != 200) {
      setErrorMessage('Failed to send email');
      setIsErrorVisible(true);
      return;
    }
    navigate(`/auth/email/sent`, {
      state: {
        email: emailAddressInputRef.current!.value,
      },
    });
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col gap-10 items-center">
        <h3 className="font-bold text-display text-accent-blue text-3xl ">
          Where should we send the invite to?
        </h3>
        <span className="flex flex-col gap-3">
          <p>Email Address</p>
          <input
            className="w-80 px-4 py-2 bg-accent-blue-clear rounded-lg"
            ref={emailAddressInputRef}
          />
          <ContinueButton
            isErrorVisible={isErrorVisible}
            errorMessage="Email is invalid"
            onClick={handleContinueClick}
          />
        </span>
      </div>
    </div>
  );
}
