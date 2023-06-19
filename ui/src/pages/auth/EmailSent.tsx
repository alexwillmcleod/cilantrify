import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

export default function EmailSent() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state.email;

  const handleWrongEmail = () => {
    navigate('/auth/email');
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
        <button
          className="text-display text-lg font-bold bg-accent-blue text-white p-2 rounded-xl"
          onClick={handleWrongEmail}
        >
          Wrong email?
        </button>
        <p className="text-accent-blue">You may close this tab now</p>
      </span>
    </div>
  );
}
