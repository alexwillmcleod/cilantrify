import React, { createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import Index from './pages';
import Navbar from './components/Navbar';
import SignIn from './pages/SignIn';
import SignInGoogle from './pages/SignInGoogle';
import Dashboard from './pages/dashboard/Dashboard';
import { CookiesProvider } from 'react-cookie';
import OnBoardIngredients from './pages/on-board/Ingredients';
import OnBoardInstructions from './pages/on-board/Instructions';
import OnBoardSuccess from './pages/on-board/Success';
import OnBoardImages from './pages/on-board/Images';
import {
  IngredientListElementProps,
  IngredientListProps,
} from './pages/on-board/IngredientListElement';
import { FileContent } from 'use-file-picker';
import { Redirect } from 'react-router-dom';
import ViewRecipe from './pages/ViewRecipe';

interface CreateRecipeState {
  instructions: string[];
  setInstructions: Function;
  ingredients: IngredientListProps[];
  setIngredients: Function;
  title: string | undefined;
  setTitle: Function;
  image: any;
  setImage: Function;
}

export const CreateRecipeContext = createContext<CreateRecipeState>({
  instructions: [],
  setInstructions: () => {},
  ingredients: [],
  setIngredients: () => {},
  title: '',
  setTitle: () => {},
  image: null,
  setImage: () => {},
});

axios.defaults.baseURL = 'http://localhost/';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/sign-in',
    element: <SignIn />,
  },
  {
    path: '/auth/google/callback',
    element: <SignInGoogle />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/recipe',
    children: [
      {
        path: ':recipe_id',
        element: <ViewRecipe />,
      },
      {
        path: 'create',
        children: [
          {
            path: '',
            element: <Navigate to="./ingredients" />,
          },
          {
            path: 'ingredients',
            element: <OnBoardIngredients />,
          },
          {
            path: 'instructions',
            element: <OnBoardInstructions />,
          },
          {
            path: 'images',
            element: <OnBoardImages />,
          },
          {
            path: 'success',
            element: <OnBoardSuccess />,
          },
        ],
      },
    ],
  },
]);

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  return (
    <React.StrictMode>
      <CreateRecipeContext.Provider
        value={{
          ingredients,
          setIngredients,
          instructions,
          setInstructions,
          title,
          setTitle,
          image,
          setImage,
        }}
      >
        <CookiesProvider>
          <Navbar />
          <RouterProvider router={router} />
        </CookiesProvider>
      </CreateRecipeContext.Provider>
    </React.StrictMode>
  );
}
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
