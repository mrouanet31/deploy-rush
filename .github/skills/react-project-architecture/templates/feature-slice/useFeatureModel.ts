import type { ReactNode } from 'react';

type useFeatureModelProps = {
  children?: ReactNode;
};

export function Usefeaturemodel({ children }: useFeatureModelProps) {
  return <section>{children}</section>;
}
