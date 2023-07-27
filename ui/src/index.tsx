/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import { Router, Routes, Route } from '@solidjs/router';
import LandingPage from './pages/LandingPage';
import SignInOptions from './pages/auth/SignInOptions';
import CreateRecipe from './pages/create-recipe/CreateRecipe';
import GoogleCallback from './pages/auth/GoogleCallback';
import { AuthProvider } from './hooks/useAuth';
import axios from 'axios';
import ViewRecipe from './pages/ViewRecipe';
import ViewProfile from './pages/ViewProfile';
import RecipeNotFound from './pages/RecipeNotFound';
import EmailSignIn from './pages/auth/EmailSignIn';
import EditRecipe from './pages/create-recipe/EditRecipe';
import Explore from './pages/Explore';
import 'flowbite'; // For flowbite ui components
import { SearchProvider } from './hooks/SearchContext';

const root = document.getElementById('root');
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

render(() => {
  return (
    <AuthProvider>
      <SearchProvider>
        <div class="flex flex-col min-h-screen">
          <Router>
            <Routes>
              <Route
                path="/"
                component={LandingPage}
              />

              <Route
                path="/create"
                component={CreateRecipe}
              />
              <Route path="/edit">
                <Route
                  path="/:id"
                  component={EditRecipe}
                />
                <Route
                  path="/not-found"
                  component={RecipeNotFound}
                />
              </Route>
              <Route
                path="/explore"
                component={() => <Explore />}
              />
              <Route path="/recipe">
                <Route
                  path="/:id"
                  component={ViewRecipe}
                />
                <Route
                  path="/not-found"
                  component={RecipeNotFound}
                />
              </Route>
              <Route
                path="/profile/:id"
                component={ViewProfile}
              />
              <Route path="/auth">
                <Route
                  path="/google/callback"
                  component={GoogleCallback}
                />
                <Route
                  path="/email"
                  component={EmailSignIn}
                />
                <Route
                  path="/options"
                  component={SignInOptions}
                />
              </Route>
            </Routes>
          </Router>
        </div>
      </SearchProvider>
    </AuthProvider>
  );
}, root!);
