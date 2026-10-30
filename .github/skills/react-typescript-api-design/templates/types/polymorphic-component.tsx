import type { ReactNode } from 'react';

type polymorphiccomponentProps = {
  children?: ReactNode;
};

export function PolymorphicComponent({ children }: polymorphiccomponentProps) {
  return <section>{children}</section>;
}
