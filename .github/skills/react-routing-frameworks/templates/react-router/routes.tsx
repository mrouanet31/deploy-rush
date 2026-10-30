import type { ReactNode } from 'react';

type routesProps = {
  children?: ReactNode;
};

export function Routes({ children }: routesProps) {
  return <section>{children}</section>;
}
