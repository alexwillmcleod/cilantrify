// import { useQueryParams } from '@solid-js/router';
import { useSearchParams, useNavigate, A } from '@solidjs/router';
import { createEffect, createSignal } from 'solid-js';
import { sendRequest } from '../../utils/rest';
import { useAuth } from '../../hooks/useAuth';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isFailed, setIsFailed] = createSignal<boolean>(false);

  createEffect(async () => {
    const code: string = searchParams.code;
    try {
      const res = await sendRequest('/auth/google/callback', 'POST', {
        code,
      });
      const token = res.data;
      login(token);
      navigate('/');
    } catch (err) {
      console.error(err);
      setIsFailed(true);
    }
  });

  return (
    <div class="flex flex-col gap-4 justify-center items-center w-screen h-screen">
      {isFailed() ? (
        <>
          <p class="font-bold text-xl text-error">
            Failed to Sign In with Google
          </p>
          <A
            class="btn"
            href="/"
          >
            Go back
          </A>
        </>
      ) : (
        <>
          <p class="font-bold text-xl">Signing in with Google</p>
          <span class="loading loading-dots loading-lg"></span>
        </>
      )}
    </div>
  );
}
