import { describe, expect, it, vi } from 'vitest';

import { keys, queryClient } from './query';
import { forgetSession, getCurrentProject, onForgetSession, setCurrentProject } from './session';

describe('forgetSession', () => {
  it('drops everything the last person left in the tab', () => {
    const forget = vi.fn();
    onForgetSession(forget);
    setCurrentProject('payments-api');
    queryClient.setQueryData(keys.session, { user: 'someone' });

    forgetSession();

    expect(getCurrentProject()).toBeNull();
    expect(sessionStorage.getItem('veraqa-project')).toBeNull();
    expect(queryClient.getQueryData(keys.session)).toBeUndefined();
    expect(forget).toHaveBeenCalledOnce();
  });
});
