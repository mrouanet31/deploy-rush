import type { ReactNode } from 'react';

type AsyncBoundaryProps = {
  children?: ReactNode;
};

export function Asyncboundary({ children }: AsyncBoundaryProps) {
  return <section>{children}</section>;
}
