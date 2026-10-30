import type { ReactNode } from 'react';

type serverentryProps = {
  children?: ReactNode;
};

export function ServerEntry({ children }: serverentryProps) {
  return <section>{children}</section>;
}
