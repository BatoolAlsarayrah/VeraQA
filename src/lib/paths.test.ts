import { describe, expect, it } from 'vitest';

import { isOpen, returnTo, signinFrom } from './paths';

describe('returnTo', () => {
  it('goes back to the page that asked for sign-in', () => {
    expect(returnTo('/projects/payments-api/defects?status=open')).toBe(
      '/projects/payments-api/defects?status=open',
    );
  });

  it('falls back to Your projects for anything not on this site', () => {
    expect(returnTo(null)).toBe('/projects');
    expect(returnTo('')).toBe('/projects');
    expect(returnTo('https://example.com')).toBe('/projects');
    expect(returnTo('//example.com/projects')).toBe('/projects');
    expect(returnTo('/\\example.com')).toBe('/projects');
  });

  it('never returns to a sign-in page', () => {
    expect(returnTo('/signin')).toBe('/projects');
    expect(returnTo('/register?from=/projects')).toBe('/projects');
  });
});

describe('signinFrom', () => {
  it('adds the page to come back to', () => {
    expect(signinFrom('/projects/payments-api/defects')).toBe(
      '/signin?from=%2Fprojects%2Fpayments-api%2Fdefects',
    );
  });

  it('leaves it out when Your projects is where sign-in goes anyway', () => {
    expect(signinFrom('/projects')).toBe('/signin');
    expect(signinFrom('/')).toBe('/signin');
  });
});

describe('isOpen', () => {
  it('knows the pages that work signed out', () => {
    expect(isOpen('/signin')).toBe(true);
    expect(isOpen('/dev/components')).toBe(true);
    expect(isOpen('/projects')).toBe(false);
    expect(isOpen('/signinx')).toBe(false);
  });
});
