import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '../src/components/Checkout';

jest.mock('../src/assets/util/fetch', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '../src/assets/util/fetch';

const CheckoutWithRouter = () => (
  <BrowserRouter>
    <Checkout />
  </BrowserRouter>
);

describe('Checkout - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token-123');
  });

  // 1. UI megjelenítés
  test('form renders with all input fields', async () => {
    apiFetch.mockResolvedValue({
      result: 'success',
      data: [],
    });

    render(<CheckoutWithRouter />);

    await waitFor(() => {
      expect(screen.getByText('Pénztár')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Teljes név')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Irányítószám')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Település')).toBeInTheDocument();
  });

  // 2. Error modal bejelentkezés nélkül
  test('shows login error modal when token is missing', async () => {
    localStorage.clear();

    apiFetch.mockResolvedValue({
      result: 'success',
      data: [],
    });

    render(<CheckoutWithRouter />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Teljes név')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Teljes név'), 'John Doe');
    await user.type(screen.getByPlaceholderText('Irányítószám'), '1011');
    await user.type(screen.getByPlaceholderText('Település'), 'Budapest');
    await user.type(
      screen.getByPlaceholderText('Utca, házszám'),
      'Main Street 123'
    );

    const submitButton = screen.getByRole('button', {
      name: /Rendelés leadása/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Figyelem')).toBeInTheDocument();
    });
  });

  // 3. Form kitöltöttség ellenőrzése
  test('accepts form input and displays filled values', async () => {
    apiFetch.mockResolvedValue({
      result: 'success',
      data: [],
    });

    render(<CheckoutWithRouter />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Teljes név')).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Teljes név');
    const zipInput = screen.getByPlaceholderText('Irányítószám');

    await user.type(nameInput, 'Jane Smith');
    await user.type(zipInput, '6000');

    expect(nameInput).toHaveValue('Jane Smith');
    expect(zipInput).toHaveValue('6000');
  });

  // 4. Fizetési mód megjelenítése
  test('payment method select is visible and set to utanvet by default', async () => {
    apiFetch.mockResolvedValue({
      result: 'success',
      data: [],
    });

    render(<CheckoutWithRouter />);

    await waitFor(() => {
      expect(screen.getByText('Fizetési mód')).toBeInTheDocument();
    });

    const paymentSelect = screen.getByDisplayValue(
      'Utánvét (Fizetés a futárnál)'
    );
    expect(paymentSelect).toBeInTheDocument();
  });

  // 5. Submit gomb létezik
  test('submit button is rendered', async () => {
    apiFetch.mockResolvedValue({
      result: 'success',
      data: [],
    });

    render(<CheckoutWithRouter />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Rendelés leadása/i })
      ).toBeInTheDocument();
    });
  });
});
