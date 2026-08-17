import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from './FileUpload';

describe('FileUpload', () => {
  it('calls onFileSelected with the chosen file', async () => {
    const onFileSelected = vi.fn();
    render(
      <FileUpload onFileSelected={onFileSelected} onLoadSample={vi.fn()} isLoading={false} error={null} />
    );

    const file = new File(['name,age\nAda,30'], 'people.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-upload-input');
    await userEvent.upload(input, file);

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('calls onLoadSample when the sample data button is clicked', async () => {
    const onLoadSample = vi.fn();
    render(
      <FileUpload onFileSelected={vi.fn()} onLoadSample={onLoadSample} isLoading={false} error={null} />
    );

    await userEvent.click(screen.getByText('Load sample data'));
    expect(onLoadSample).toHaveBeenCalledOnce();
  });

  it('disables both buttons while loading', () => {
    render(<FileUpload onFileSelected={vi.fn()} onLoadSample={vi.fn()} isLoading error={null} />);
    expect((screen.getByText('Upload CSV or JSON').closest('ion-button') as any).disabled).toBe(true);
    expect((screen.getByText('Load sample data').closest('ion-button') as any).disabled).toBe(true);
  });

  it('renders an error message when provided', () => {
    render(
      <FileUpload onFileSelected={vi.fn()} onLoadSample={vi.fn()} isLoading={false} error="Bad file." />
    );
    expect(screen.getByText('Bad file.')).toBeInTheDocument();
  });
});
