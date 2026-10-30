import type { ReactNode } from 'react';

type ControlledFormProps = {
  children?: ReactNode;
};

export function Controlledform({ children }: ControlledFormProps) {
  return <section>{children}</section>;
}
