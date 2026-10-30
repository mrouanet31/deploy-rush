import type { ReactNode } from 'react';

type EmptyStateProps = {
  children?: ReactNode;
};

export function Emptystate({ children }: EmptyStateProps) {
  return <section>{children}</section>;
}
