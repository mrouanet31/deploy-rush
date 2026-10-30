import type { ReactNode } from 'react';

type authboundaryProps = {
  children?: ReactNode;
};

export function AuthBoundary({ children }: authboundaryProps) {
  return <section>{children}</section>;
}
