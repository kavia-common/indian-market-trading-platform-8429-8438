import { render, screen } from '@testing-library/react';
import App from './App';

test('renders market navigator brand', () => {
  render(<App />);
  const brandElement = screen.getByText(/Market Navigator/i);
  expect(brandElement).toBeInTheDocument();
});
