import { Section, Shapes, Swatches, ThemeToggle, TypeScale } from '@/app/preview';
import { Logo } from '@/components/domain';

export function App() {
  return (
    <main className="mx-auto flex max-w-380 settle-children flex-col gap-section-gap px-4 pt-4 pb-10 tablet:px-6 tablet:pt-page-block desktop:px-page-inline">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Logo withName />
          <div>
            <h1 className="text-headline text-balance">Token preview</h1>
            <p className="mt-1 max-w-[68ch] text-text-2">
              A temporary page for checking the design tokens in light and dark. It is replaced in
              Phase 2.
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Logo">
        <div className="flex flex-wrap items-center gap-6">
          <Logo size={40} withName />
          <Logo size={32} withName />
          <Logo size={40} />
          <Logo size={32} />
          <Logo size={24} />
        </div>
      </Section>

      <Section title="Type scale">
        <TypeScale />
      </Section>

      <Section title="Colors">
        <Swatches />
      </Section>

      <Section title="Radii, shadows and buttons">
        <Shapes />
      </Section>
    </main>
  );
}
