import type { ReactNode } from 'react';

type externalstoreProps = {
  children?: ReactNode;
};

export function ExternalStore({ children }: externalstoreProps) {
  return <section>{children}</section>;
}
