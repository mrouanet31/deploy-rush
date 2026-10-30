import type { ReactNode } from 'react';

type VirtualizedListBoundaryProps = {
  children?: ReactNode;
};

export function Virtualizedlistboundary({ children }: VirtualizedListBoundaryProps) {
  return <section>{children}</section>;
}
