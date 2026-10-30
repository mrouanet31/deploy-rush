import type { ReactNode } from 'react';

type ImperativeFocusProps = {
  children?: ReactNode;
};

export function Imperativefocus({ children }: ImperativeFocusProps) {
  return <section>{children}</section>;
}
