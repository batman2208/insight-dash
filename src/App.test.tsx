import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the Insight Dash title', () => {
    render(<App />);
    expect(screen.getByText('Insight Dash')).toBeInTheDocument();
  });
});
