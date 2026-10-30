import type { ReactNode } from 'react';

type UncontrolledFormProps = {
  children?: ReactNode;
};

export function Uncontrolledform({ children }: UncontrolledFormProps) {
  return <section>{children}</section>;
}
