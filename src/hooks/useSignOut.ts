import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { paths, signOut } from '@/lib';

export function useSignOut() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: signOut,
    onSettled: () => {
      void navigate(paths.signin, { replace: true });
    },
  });
}
