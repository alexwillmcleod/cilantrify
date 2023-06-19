import { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import ContinueButton from '../../components/ContinueButton';
import useAuth from '../../hooks/useAuth';

export default function VerifyEmail() {
  // This component will ask for the user's first name and last name
  // and then call the final endpoint
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const { code } = useParams();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinueClick = async () => {
    if (!firstNameRef.current || firstNameRef.current!.value == '') {
      setErrorMessage('You must have a first name');
      setIsErrorVisible(true);
      return;
    }
    if (!lastNameRef.current || lastNameRef.current!.value == '') {
      setErrorMessage('You must have a last name');
      setIsErrorVisible(true);
      return;
    }
    const firstName = firstNameRef.current!.value;
    const lastName = lastNameRef.current!.value;
    const res = await axios.post('auth/sso/callback', {
      code,
      name: `${firstName} ${lastName}`,
      given_name: firstName,
      family_name: lastName,
    });
    console.log(res.status);
    if (res.status != 200) {
      setErrorMessage('Could not sign you in');
      setIsErrorVisible(true);
      console.log('Failed');
      return;
    }
    if (!res.data) {
      setErrorMessage('Could not sign you in');
      setIsErrorVisible(true);
      console.log('Failed');
      return;
    }
    const { token } = res.data;
    setToken(token);
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col gap-10 items-center">
        <h3 className="font-bold text-display text-accent-blue text-3xl ">
          Where should we call you?
        </h3>
        <span className="flex flex-col gap-3">
          <p>First Name</p>
          <input
            className="w-80 px-4 py-2 bg-accent-blue-clear rounded-lg"
            ref={firstNameRef}
          />
          <p>Last Name</p>
          <input
            className="w-80 px-4 py-2 bg-accent-blue-clear rounded-lg"
            ref={lastNameRef}
          />
          <ContinueButton
            isErrorVisible={isErrorVisible}
            errorMessage={errorMessage}
            onClick={() => handleContinueClick()}
          />
        </span>
      </div>
    </div>
  );
}
