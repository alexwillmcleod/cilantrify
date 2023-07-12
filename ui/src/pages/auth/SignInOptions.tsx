import { A } from '@solidjs/router';
import Navbar from '../../components/Navbar';
import welcomeTreePerson from '/welcome-tree-person.svg';
import googleIcon from '/google-icon.svg';
import gmailIcon from '/gmail-icon.svg';
import { useAuth } from '../../hooks/useAuth';
import { createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';

export default function SignInOptions() {
  const { user } = useAuth()!;
  const navigate = useNavigate();

  createEffect(() => {
    if (user()) navigate('/for-you');
  });

  return (
    <div class="min-h-screen">
      <Navbar />
      <div class="hero bg-base-100">
        <div class="hero-content flex-col lg:flex-row">
          <img
            src={welcomeTreePerson}
            class="max-w-sm hidden lg:flex"
          />
          <div class="flex flex-col gap-4 lg:p-40 p-2 justify-center items-center">
            <h1 class="text-4xl font-bold ">Continue With:</h1>
            <span class="flex flex-row gap-4 items-center justify-center">
              <A
                href={`${import.meta.env.VITE_API_URL}/auth/google`}
                class="btn btn-ghost btn-primary w-24 h-24"
              >
                <img src={googleIcon} />
              </A>
              <button class="btn btn-ghost btn-primary w-24 h-24">
                <img src={gmailIcon} />
              </button>
            </span>
            <A
              class="text-xl text-blue-300 relative top-5"
              href="/for-you"
            >
              Or Browse as a Guest
            </A>
          </div>
        </div>
      </div>
    </div>
  );
}
