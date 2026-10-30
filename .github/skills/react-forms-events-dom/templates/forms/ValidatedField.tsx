import type { ReactNode } from 'react';

type ValidatedFieldProps = {
  children?: ReactNode;
};

export function Validatedfield({ children }: ValidatedFieldProps) {
  return <section>{children}</section>;
}
