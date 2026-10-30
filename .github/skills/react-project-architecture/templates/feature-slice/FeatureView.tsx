import type { ReactNode } from 'react';

type FeatureViewProps = {
  children?: ReactNode;
};

export function Featureview({ children }: FeatureViewProps) {
  return <section>{children}</section>;
}
