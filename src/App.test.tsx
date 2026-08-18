import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the Insight Dash title', () => {
    render(<App />);
    expect(screen.getByText('Insight Dash')).toBeInTheDocument();
  });

  it('shows the data table and chart after loading the sample dataset', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Load sample data'));
    expect(await screen.findByText('month')).toBeInTheDocument();
    expect(screen.getByText('Clear dataset')).toBeInTheDocument();
  });
});
