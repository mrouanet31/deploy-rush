import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function Subject() {
  return <button type="button">Submit</button>;
}

describe('Subject', () => {
  it('exposes the expected user behavior', async () => {
    render(<Subject />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});
