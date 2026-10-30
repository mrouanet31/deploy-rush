import type { ReactNode } from 'react';

type sanitizehtmlProps = {
  children?: ReactNode;
};

export function SanitizeHtml({ children }: sanitizehtmlProps) {
  return <section>{children}</section>;
}
