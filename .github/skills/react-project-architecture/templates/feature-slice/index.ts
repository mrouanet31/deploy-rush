import type { ReactNode } from 'react';

type indexProps = {
  children?: ReactNode;
};

export function Index({ children }: indexProps) {
  return <section>{children}</section>;
}
