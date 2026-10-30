import type { ReactNode } from 'react';

type CompoundTabsProps = {
  children?: ReactNode;
};

export function Compoundtabs({ children }: CompoundTabsProps) {
  return <section>{children}</section>;
}
