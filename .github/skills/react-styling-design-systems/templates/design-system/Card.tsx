import type { ReactNode } from 'react';

type CardProps = {
  children?: ReactNode;
};

export function Card({ children }: CardProps) {
  return <section>{children}</section>;
}
