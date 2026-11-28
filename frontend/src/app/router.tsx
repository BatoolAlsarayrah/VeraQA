import { createBrowserRouter } from 'react-router';

import { isOpen, queryClient, setUnauthorizedHandler, signinFrom } from '@/lib';

import { routes } from './routes';

export const router = createBrowserRouter(routes);

setUnauthorizedHandler(() => {
  const { pathname, search } = router.state.location;
  if (isOpen(pathname)) return;
  queryClient.clear();
  void router.navigate(signinFrom(pathname + search), { replace: true });
});
