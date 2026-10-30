import type { ReactNode } from 'react';

type PortalLayerProps = {
  children?: ReactNode;
};

export function Portallayer({ children }: PortalLayerProps) {
  return <section>{children}</section>;
}
