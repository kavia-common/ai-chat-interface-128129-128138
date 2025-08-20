import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header title', () => {
  render(<App />);
  const titleEl = screen.getByText(/Chatbot/i);
  expect(titleEl).toBeInTheDocument();
});
