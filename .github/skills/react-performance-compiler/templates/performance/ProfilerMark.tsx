import type { ReactNode } from 'react';

type ProfilerMarkProps = {
  children?: ReactNode;
};

export function Profilermark({ children }: ProfilerMarkProps) {
  return <section>{children}</section>;
}
