import { useParams } from '@solidjs/router';
import defaultAvatar from '/default-avatar.svg';
import Navbar from '../components/Navbar';
import RecipeElement from '../components/RecipeElement';
import { createEffect, createSignal, For, Show } from 'solid-js';
import axios from 'axios';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../hooks/SearchContext';

interface User {
  givenName: string;
  familyName: string;
  profilePicture?: string;
  email: string;
  id: number;
}

export default function ViewProfile() {
  const [page, setPage] = createSignal<number>(1);
  const [pageCount, setPageCount] = createSignal<number>(1);
  const [lastSearchTerm, setLastSearchTerm] = createSignal<string>('');
  const [user, setUser] = createSignal<User | undefined>(undefined);
  const { searchTerm, setSearchTerm } = useSearch()!;

  const handleNextPage = () => {
    if (!pageCount()) return;
    if (page() >= pageCount()) return;
    setPage(page() + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (page() <= 1) return;
    setPage(page() - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [recipes, setRecipes] = createSignal<
    {
      title: string;
      description: string;
      picture: string;
      author_family_name: string;
      author_given_name: string;
      author_profile: string;
      author_id: number;
      id: number;
    }[]
  >([]);
  const getSearch = async (userId: string, newPage: number) => {
    try {
      const res = await axios.get('/recipe/search', {
        params: {
          search: searchTerm(),
          page: newPage,
          limit: 5,
          user: userId,
        },
      });

      setRecipes(res.data.recipes);
      setPageCount(res.data.page_count);
      if (lastSearchTerm() != searchTerm()) setPage(1);
      setLastSearchTerm(searchTerm());
      console.log(res.data);
    } catch (err) {
      console.error(err);
      return;
    }
  };

  const getUser = async (userId: string) => {
    try {
      const res = await axios.get('/profile', {
        params: {
          profile_id: userId,
        },
      });
      setUser({
        givenName: res.data.given_name,
        familyName: res.data.family_name,
        email: res.data.email,
        profilePicture: res.data.picture,
        id: res.data.id,
      });
    } catch (err) {
      console.error(err);
    }
  };

  createEffect(async () => {
    const userId = useParams()!.id;
    const pageNumber = page(); // Important for reactivity
    searchTerm();
    await getUser(userId);
    await getSearch(userId, pageNumber);
  });

  return (
    <div class="flex flex-col min-h-screen ">
      <Navbar
        isSearchBarVisible={true}
        isShouldRedirect={false}
      />
      <div class="flex flex-col items-center justify-center gap-10 mb-10">
        <Show when={user()}>
          <div class="flex flex-row gap-5 justify-center items-center">
            <img
              class="object-cover aspect-1/1 w-24 h-24 rounded-full"
              src={user()!.profilePicture || defaultAvatar}
            />
            <h2 class="font-bold text-center text-4xl">
              {user()!.givenName} {user()!.familyName}
            </h2>
          </div>
        </Show>
        {pageCount() == 0 && <p>No recipes match that search</p>}
        <ul class="flex flex-col gap-8">
          <Show when={() => recipes() && pageCount() != 0}>
            <For each={recipes()!}>
              {(element) => (
                <li>
                  <RecipeElement
                    title={element.title}
                    authorId={element.author_id}
                    image={element.picture}
                    author={`${element.author_given_name} ${element.author_family_name}`}
                    authorProfile={element.author_profile}
                    id={element.id}
                  />
                </li>
              )}
            </For>
          </Show>
        </ul>
        <Pagination
          currentPage={page}
          totalPages={pageCount}
          nextPage={handleNextPage}
          lastPage={handlePreviousPage}
        />
      </div>
    </div>
  );
}
