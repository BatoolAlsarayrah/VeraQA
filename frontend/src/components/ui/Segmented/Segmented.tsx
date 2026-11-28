import { cn } from '@/lib';

import { segmentOn, segmentOption, segmentTrack } from './styles';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  name: string;
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function Segmented<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <fieldset className={cn(segmentTrack, className)}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer max-tablet:flex-[1_0_auto]">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            className="peer sr-only"
          />
          <span
            className={cn(
              segmentOption,
              'w-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
              option.value === value && segmentOn,
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
