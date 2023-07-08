/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import { Router, Routes, Route } from '@solidjs/router';
import LandingPage from './pages/LandingPage';
import SignInOptions from './pages/SignInOptions';
import CreateRecipe from './pages/create-recipe/CreateRecipe';

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
            path="/sign-in"
            component={SignInOptions}
          />
          <Route
            path="/create"
            component={CreateRecipe}
          />
        </Routes>
      </Router>
    </>
  ),
  root!
);
