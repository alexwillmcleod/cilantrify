import Join from '/join.svg';
import { Accessor } from 'solid-js';
import axios from 'axios';

interface EnterEmailProps {
  email: Accessor<string>;
  setEmail: (newEmail: string) => void;
  goToName: () => void;
  goToSend: () => void;
  setIsNew: (value: boolean) => void;
}

export default function EnterEmail({
  email,
  setEmail,
  goToName,
  goToSend,
  setIsNew,
}: EnterEmailProps) {
  const handleContinue = async () => {
    const emailRegex = new RegExp(
      '^[a-zA-Z0-9]+(?:.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:.[a-zA-Z0-9]+)*$'
    );
    const test: boolean = emailRegex.test(email());
    if (!test) return;

    try {
      const res = await axios.get('/auth/sso/exists', {
        params: {
          email: email(),
        },
        validateStatus: (status) => {
          return status === 200 || status === 302 || status === 404; // Resolve only if the status is 200, 302, or 404
        },
      });

      if (res.status === 404) {
        setIsNew(true);
        goToName();
        return;
      }

      if (res.status !== 302) {
        // Handle error
        return;
      }

      // If they account is found
      await axios.post('/auth/sso', {
        email: email(),
      });

      goToSend();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div class="flex flex-col px-24 lg:flex-row justify-around items-center">
      <img
        src={Join}
        class="max-w-sm hidden lg:flex"
      />
      <div class="flex flex-col gap-7 w-full max-w-md justify-center">
        <h1 class="text-5xl font-bold">Let's go!</h1>
        <div class="form-control w-full max-w-md">
          <label class="label">
            <span class="label-text">Continue with Email</span>
          </label>
          <input
            type="email"
            placeholder="Your Email"
            class="input input-bordered w-full max-w-md "
            value={email()}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          onClick={handleContinue}
          class="btn btn-primary max-w-md"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
