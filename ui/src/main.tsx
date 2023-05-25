import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Index from './pages';
import Navbar from './components/navbar';
import SignIn from './pages/SignIn';
import SignInGoogle from './pages/SignInGoogle';
import Dashboard from './pages/Dashboard';
import { CookiesProvider } from 'react-cookie';
import OnBoardIngredients from './pages/on-board/Ingredients';
import OnBoardInstructions from './pages/on-board/Instructions';
import OnBoardSuccess from './pages/on-board/Success';

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
        path: 'create',
        children: [
          {
            path: 'ingredients',
            element: <OnBoardIngredients />,
          },
          {
            path: 'instructions',
            element: <OnBoardInstructions />,
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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CookiesProvider>
      <Navbar />
      <RouterProvider router={router} />
    </CookiesProvider>
  </React.StrictMode>
);
