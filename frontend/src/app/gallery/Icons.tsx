import { Icon, type IconName, icons } from '@/components/domain';

const names = Object.keys(icons) as IconName[];

export function Icons() {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
      {names.map((name) => (
        <li key={name} className="flex items-center gap-3 text-body-sm text-text-2">
          <Icon name={name} />
          <Icon name={name} size={24} />
          <span className="min-w-0 truncate">{name}</span>
        </li>
      ))}
    </ul>
  );
}
