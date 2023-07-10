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
import ForYou from './pages/for-you/ForYou';
import ViewRecipe from './pages/ViewRecipe';
import ViewProfile from './pages/ViewProfile';

const root = document.getElementById('root');
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

render(
  () => (
    <AuthProvider>
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
          <Route
            path="/for-you"
            component={ForYou}
          />
          <Route
            path="/recipe/:id"
            component={ViewRecipe}
          />
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
              path="/options"
              component={SignInOptions}
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  ),
  root!
);
