import { useParams } from '@solidjs/router';
import { onMount, createSignal } from 'solid-js';
import axios from 'axios';

export default function ViewProfile() {
  const params = useParams();
  const { id } = params;

  const [userInfo, setUserInfo] = createSignal<any>(undefined);

  onMount(async () => {
    try {
      const res = await axios.get(`/recipe`, {
        params: {
          recipe_id: id,
        },
      });
      console.log(res.data);
      setUserInfo(res.data);
    } catch (err) {
      console.error(err);
    }
  });

  return <div>You are viewing the profile of the user with id: {id}</div>;
}
