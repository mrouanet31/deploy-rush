import type { ReactNode } from 'react';

type pageProps = {
  children?: ReactNode;
};

export function Page({ children }: pageProps) {
  return <section>{children}</section>;
}
