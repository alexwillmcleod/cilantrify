import { Accessor } from 'solid-js';
import Buddies from '/buddies.svg';
import axios from 'axios';

interface EnterNameProps {
  code: Accessor<string>;
  email: Accessor<string>;
  givenName: Accessor<string>;
  setGivenName: (newGivenName: string) => {};
  familyName: Accessor<string>;
  setFamilyName: (newFamilyName: string) => {};
  goToSend: () => void;
}

export default function EnterName({
  email,
  givenName,
  setGivenName,
  familyName,
  setFamilyName,
  goToSend,
}: EnterNameProps) {
  const handleContinue = async () => {
    try {
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
        src={Buddies}
        class="max-w-sm hidden lg:flex"
      />
      <div class="flex flex-col gap-7 w-full max-w-md justify-center">
        <h1 class="text-5xl font-bold">Introduce yourself!</h1>
        <div class="form-control w-full max-w-md">
          <label class="label">
            <span class="label-text">What's your first name?</span>
          </label>
          <input
            type="email"
            placeholder="Your First Name"
            class="input input-bordered w-full max-w-md "
            value={givenName()}
            onChange={(e) => setGivenName(e.target.value)}
          />
        </div>
        <div class="form-control w-full max-w-md">
          <label class="label">
            <span class="label-text">What's your last name?</span>
          </label>
          <input
            type="email"
            placeholder="Your Last Name"
            class="input input-bordered w-full max-w-md "
            value={familyName()}
            onChange={(e) => setFamilyName(e.target.value)}
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
