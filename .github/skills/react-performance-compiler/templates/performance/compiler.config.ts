import type { ReactNode } from 'react';

type compilerconfigProps = {
  children?: ReactNode;
};

export function CompilerConfig({ children }: compilerconfigProps) {
  return <section>{children}</section>;
}
