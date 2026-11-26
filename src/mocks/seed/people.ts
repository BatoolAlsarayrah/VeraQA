import type { PersonRecord } from '../db';

// Mock-only sign-in details, listed in the README under "Demo accounts". Never real passwords.
export const DEMO_PASSWORD = 'VeraQA#2026';

function person(id: string, firstName: string, lastName: string): PersonRecord {
  return {
    id,
    firstName,
    lastName,
    email: `${firstName}.${lastName}@shop-team.com`.toLowerCase(),
    password: DEMO_PASSWORD,
  };
}

export const people: PersonRecord[] = [
  person('batool-hani', 'Batool', 'Hani'),
  person('batool-mahmoud', 'Batool', 'Mahmoud'),
  person('qays-kaled', 'Qays', 'Kaled'),
  person('lina-saeed', 'Lina', 'Saeed'),
  person('maria-ayman', 'Maria', 'Ayman'),
];
