import type { ReactNode } from 'react';

import { Logo } from '@/components/domain';

import { Badges } from './Badges';
import { Buttons } from './Buttons';
import { Containers } from './Containers';
import { Fields } from './Fields';
import { Icons } from './Icons';
import { Overlays } from './Overlays';
import { Section } from './Section';
import { Shapes } from './Shapes';
import { Suggestions } from './Suggestions';
import { Swatches } from './Swatches';
import { ThemeToggle } from './ThemeToggle';
import { TypeScale } from './TypeScale';

const sections = [
  { id: 'logo', title: 'Logo' },
  { id: 'type', title: 'Type scale' },
  { id: 'colors', title: 'Colors' },
  { id: 'shapes', title: 'Radii and shadows' },
  { id: 'icons', title: 'Icons' },
  { id: 'buttons', title: 'Buttons' },
  { id: 'badges', title: 'Badges and marks' },
  { id: 'fields', title: 'Form fields' },
  { id: 'containers', title: 'Panels, tabs and states' },
  { id: 'overlays', title: 'Overlays' },
  { id: 'ai', title: 'AI suggestion' },
] as const;

const content: Record<(typeof sections)[number]['id'], ReactNode> = {
  logo: (
    <div className="flex flex-wrap items-center gap-6">
      <Logo size={40} withName />
      <Logo size={32} withName />
      <Logo size={40} />
      <Logo size={32} />
      <Logo size={24} />
    </div>
  ),
  type: <TypeScale />,
  colors: <Swatches />,
  shapes: <Shapes />,
  icons: <Icons />,
  buttons: <Buttons />,
  badges: <Badges />,
  fields: <Fields />,
  containers: <Containers />,
  overlays: <Overlays />,
  ai: <Suggestions />,
};

export function Gallery() {
  return (
    <main className="mx-auto flex max-w-380 settle-children flex-col gap-section-gap px-4 pt-4 pb-10 tablet:px-6 tablet:pt-page-block desktop:px-page-inline">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Logo withName />
          <div>
            <h1 className="text-headline text-balance">Component gallery</h1>
            <p className="mt-1 max-w-[68ch] text-text-2">
              Every component in every variant and state, in light and dark.
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>
      <nav aria-label="Sections" className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.title}
          </a>
        ))}
      </nav>
      {sections.map((section) => (
        <Section key={section.id} id={section.id} title={section.title}>
          {content[section.id]}
        </Section>
      ))}
    </main>
  );
}
