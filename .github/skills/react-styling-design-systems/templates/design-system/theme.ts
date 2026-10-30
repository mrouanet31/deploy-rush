import type { ReactNode } from 'react';

type themeProps = {
  children?: ReactNode;
};

export function Theme({ children }: themeProps) {
  return <section>{children}</section>;
}
