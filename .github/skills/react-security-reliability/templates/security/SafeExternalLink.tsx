import type { ReactNode } from 'react';

type SafeExternalLinkProps = {
  children?: ReactNode;
};

export function Safeexternallink({ children }: SafeExternalLinkProps) {
  return <section>{children}</section>;
}
