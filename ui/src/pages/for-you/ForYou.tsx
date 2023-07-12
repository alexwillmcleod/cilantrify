import Navbar from '../../components/Navbar';
import RecipeElement from './RecipeElement';
import { createEffect, createSignal } from 'solid-js';
import axios from 'axios';
import { A } from '@solidjs/router';
import Pagination from './Pagination';
import SearchBar from './SearchBar';

export default function ForYou() {
  const [page, setPage] = createSignal<number>(1);
  const [pageCount, setPageCount] = createSignal<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = createSignal<string>('');

  const handleNextPage = () => {
    if (!pageCount()) return;
    console.log(
      `Going to next page. Page = ${page()}. PageCount = ${pageCount()!}`
    );
    if (page() < pageCount()! - 1) {
      setPage(page() + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (page() > 1) {
      setPage(page() - 1);
    }
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
      id: number;
    }[]
  >([]);

  const getPage = async () => {
    try {
      const res = await axios.get('/recipe/page', {
        params: {
          page: page(),
          limit: 3,
        },
      });

      setRecipes(res.data.recipes);
      setPageCount(res.data.page_count);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      return;
    }
  };

  const getSearch = async () => {
    try {
      const res = await axios.get('/recipe/search', {
        params: {
          search: searchTerm(),
          page: page(),
          limit: 3,
        },
      });

      setRecipes(res.data.recipes);
      setPageCount(res.data.page_count);
      setPage(1);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      return;
    }
  };

  createEffect(async () => {
    if (searchTerm() == '') {
      getPage();
    } else {
      getSearch();
    }
  });

  return (
    <div class="flex flex-col min-h-screen ">
      <Navbar />
      <div class="flex flex-col items-center justify-center gap-10 mb-10">
        <h2 class="font-bold text-display text-3xl">For You</h2>
        <SearchBar setSearchTerm={setSearchTerm} />
        {pageCount() == 0 && <p>No recipes match that search</p>}
        <ul class="flex flex-col gap-8">
          {recipes() &&
            recipes()!.map((element) => (
              <li>
                <RecipeElement
                  title={element.title}
                  image={element.picture}
                  description={element.description}
                  author={`${element.author_given_name} ${element.author_family_name}`}
                  authorProfile={element.author_profile}
                  id={element.id}
                />
              </li>
            ))}
        </ul>
        {pageCount() && (
          <Pagination
            currentPage={page}
            totalPages={pageCount()!}
            nextPage={handleNextPage}
            lastPage={handlePreviousPage}
          />
        )}
      </div>

      <A
        href="/create"
        class="fixed bottom-5 right-5"
      >
        <svg
          width="65"
          height="65"
          viewBox="0 0 65 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            class="fill-primary"
            clip-rule="evenodd"
            d="M17.3225 0H47.645C58.695 0 65 6.24 65 17.3225V47.6775C65 58.695 58.7275 65 47.6775 65H17.3225C6.24 65 0 58.695 0 47.6775V17.3225C0 6.24 6.24 0 17.3225 0ZM35.165 35.1975H44.395C45.89 35.165 47.0925 33.9625 47.0925 32.4675C47.0925 30.9725 45.89 29.77 44.395 29.77H35.165V20.605C35.165 19.11 33.9625 17.9075 32.4675 17.9075C30.9725 17.9075 29.77 19.11 29.77 20.605V29.77H20.5725C19.8575 29.77 19.175 30.0625 18.655 30.55C18.1675 31.07 17.875 31.7493 17.875 32.4675C17.875 33.9625 19.0775 35.165 20.5725 35.1975H29.77V44.395C29.77 45.89 30.9725 47.0925 32.4675 47.0925C33.9625 47.0925 35.165 45.89 35.165 44.395V35.1975Z"
          />
        </svg>
      </A>
    </div>
  );
}
