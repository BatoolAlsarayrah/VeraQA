import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { type DefaultValues, type FieldValues, type Path, useForm } from 'react-hook-form';
import type { z } from 'zod';

import { HttpError, NetworkError } from '@/lib';

type Options<Input extends FieldValues, Output, Result> = {
  schema: z.ZodType<Output, Input>;
  defaultValues: DefaultValues<Input>;
  submit: (values: Output) => Promise<Result>;
  onSuccess?: (result: Result, values: Output) => unknown;
};

function message(error: unknown) {
  if (error instanceof HttpError || error instanceof NetworkError) return error.message;
  return 'That didn’t go through. Try again.';
}

export function useApiForm<Input extends FieldValues, Output, Result>({
  schema,
  defaultValues,
  submit,
  onSuccess,
}: Options<Input, Output, Result>) {
  const form = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: submit });

  function fail(reason: unknown) {
    const known = Object.keys(form.getValues());
    const fields =
      reason instanceof HttpError && reason.status === 422
        ? Object.entries(reason.fields).filter(([name]) => known.includes(name))
        : [];
    if (fields.length === 0) {
      const unplaced = reason instanceof HttpError ? Object.values(reason.fields)[0] : undefined;
      setError(unplaced ?? message(reason));
      return;
    }
    fields.forEach(([name, text], index) => {
      form.setError(name as Path<Input>, { message: text }, { shouldFocus: index === 0 });
    });
  }

  const send = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const result = await mutation.mutateAsync(values);
      await onSuccess?.(result, values);
    } catch (reason) {
      fail(reason);
    }
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    void send(event);
  }

  return { form, onSubmit, error, busy: form.formState.isSubmitting };
}
