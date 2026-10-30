import type { ReactNode } from 'react';

type componentpropsProps = {
  children?: ReactNode;
};

export function ComponentProps({ children }: componentpropsProps) {
  return <section>{children}</section>;
}
