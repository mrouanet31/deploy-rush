import type { ReactNode } from 'react';

type optimisticactionProps = {
  children?: ReactNode;
};

export function OptimisticAction({ children }: optimisticactionProps) {
  return <section>{children}</section>;
}
