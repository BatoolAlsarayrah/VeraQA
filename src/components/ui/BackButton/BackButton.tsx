import { LinkButton } from '../Button';

type Props = {
  href: string;
  label: string;
};

export function BackButton({ href, label }: Props) {
  return (
    <LinkButton
      href={href}
      icon="arrow-left"
      size="sm"
      aria-label={`Back to ${label}`}
      title={`Back to ${label}`}
      className="max-tablet:hidden"
    />
  );
}
