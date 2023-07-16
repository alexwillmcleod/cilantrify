import { Accessor } from 'solid-js';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from '@solidjs/router';

interface EmailSuccessProps {
  email: Accessor<string>;
  code: Accessor<string>;
  setCode: (newCode: string) => void;
  onPrevious: () => void;
  isNew: Accessor<boolean>;
  onNext: () => void;
  givenName: Accessor<string>;
  familyName: Accessor<string>;
}

export default function EmailSuccess({
  email,
  onPrevious,
  code,
  setCode,
  isNew,
  givenName,
  familyName,
  onNext,
}: EmailSuccessProps) {
  const { handleSSOLogin, handleSSOCreate } = useAuth()!;
  const navigate = useNavigate();

  const handleContinue = async () => {
    try {
      if (isNew()) {
        await handleSSOCreate(
          email(),
          Number.parseInt(code()),
          givenName(),
          familyName()
        );
      } else {
        await handleSSOLogin(email(), Number.parseInt(code()));
      }
      navigate('/for-you');
    } catch (err) {
      console.error(err);
    }
    onNext();
  };
  return (
    <div class="flex flex-col justify-center items-center py-12 gap-8">
      <h2 class="font-bold text-xl">Email Successfully sent to {email()}</h2>
      <span class="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Code"
          class="input input-bordered w-full max-w-xs"
          value={code()}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={handleContinue}
          class="btn btn-primary btn-md"
        >
          Enter Code
        </button>
        <button
          onClick={onPrevious}
          class="text-md text-blue-300"
        >
          I mispelt the email
        </button>
      </span>
    </div>
  );
}
