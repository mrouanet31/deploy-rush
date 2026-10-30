import type { ReactNode } from 'react';

type ClientIslandProps = {
  children?: ReactNode;
};

export function Clientisland({ children }: ClientIslandProps) {
  return <section>{children}</section>;
}
