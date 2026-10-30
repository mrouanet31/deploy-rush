import type { ReactNode } from 'react';

type routerProps = {
  children?: ReactNode;
};

export function Router({ children }: routerProps) {
  return <section>{children}</section>;
}
