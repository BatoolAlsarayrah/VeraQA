import { LinkButton } from '../Button';

type Props = {
  to: string;
  label: string;
};

export function BackButton({ to, label }: Props) {
  return (
    <LinkButton
      to={to}
      icon="arrow-left"
      size="sm"
      aria-label={`Back to ${label}`}
      title={`Back to ${label}`}
      className="max-tablet:hidden"
    />
  );
}
