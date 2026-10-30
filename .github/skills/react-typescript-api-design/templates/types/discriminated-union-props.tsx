import type { ReactNode } from 'react';

type discriminatedunionpropsProps = {
  children?: ReactNode;
};

export function DiscriminatedUnionProps({ children }: discriminatedunionpropsProps) {
  return <section>{children}</section>;
}
