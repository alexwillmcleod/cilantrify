import { Accessor, createSignal, Show } from 'solid-js';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from '@solidjs/router';
import { Portal } from 'solid-js/web';

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
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [isCodeInvalid, setIsCodeInvalid] = createSignal<boolean>(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (isLoading()) return;
    setIsCodeInvalid(false);
    setIsLoading(true);
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
      navigate('/explore');
    } catch (err) {
      setIsCodeInvalid(true);
    }
    setIsLoading(false);
    onNext();
  };
  return (
    <div class="flex flex-col justify-center items-center px-4 md:px-24 py-12 gap-8">
      <h2 class="text-2xl text-center">
        Email Successfully sent to
        <p class="font-bold">{email()}</p>
      </h2>
      <span class="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Code"
          class="input input-bordered w-full max-w-xs text-xl"
          value={code()}
          onChange={(e) => setCode(e.target.value)}
        />
        <label class="label">
          <span
            class={`text-lg label-text-alt text-error ${
              isCodeInvalid() ? 'flex' : 'opacity-0'
            }`}
          >
            Invalid Code
          </span>
        </label>
        <button
          onClick={handleContinue}
          class="btn btn-primary btn-md text-xl"
        >
          Enter Code
        </button>
        <button
          onClick={onPrevious}
          class="text-blue-300 text-lg"
        >
          I mispelt the email
        </button>
      </span>
      <Portal>
        <Show when={isLoading()}>
          <div class="fixed top-0 left-0 w-screen z-1000 h-screen justify-center items-center bg-white/5">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </Show>
      </Portal>
    </div>
  );
}
