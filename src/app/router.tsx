import { createBrowserRouter } from 'react-router';

import { paths, queryClient, setUnauthorizedHandler } from '@/lib';

import { routes } from './routes';

export const router = createBrowserRouter(routes);

setUnauthorizedHandler(() => {
  const { pathname } = router.state.location;
  if (pathname === paths.signin || pathname.startsWith(paths.dev)) return;
  queryClient.clear();
  void router.navigate(paths.signin, { replace: true });
});
