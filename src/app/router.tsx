import { createBrowserRouter } from 'react-router';

import { paths, queryClient, setUnauthorizedHandler } from '@/lib';

import { routes } from './routes';

export const router = createBrowserRouter(routes);

setUnauthorizedHandler(() => {
  if (router.state.location.pathname === paths.signin) return;
  queryClient.clear();
  void router.navigate(paths.signin, { replace: true });
});
