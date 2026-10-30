import type { ReactNode } from 'react';

type ServerComponentProps = {
  children?: ReactNode;
};

export function Servercomponent({ children }: ServerComponentProps) {
  return <section>{children}</section>;
}
