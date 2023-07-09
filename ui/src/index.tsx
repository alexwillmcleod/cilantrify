/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import { Router, Routes, Route } from '@solidjs/router';
import LandingPage from './pages/LandingPage';
import SignInOptions from './pages/auth/SignInOptions';
import CreateRecipe from './pages/create-recipe/CreateRecipe';
import GoogleCallback from './pages/auth/GoogleCallback';

const root = document.getElementById('root');

render(
  () => (
    <>
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
    </>
  ),
  root!
);
