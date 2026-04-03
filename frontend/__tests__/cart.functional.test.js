import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../src/components/Cart';

jest.mock('../src/assets/util/fetch', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '../src/assets/util/fetch';

const CartWithRouter = (props) => (
  <BrowserRouter>
    <Cart {...props} />
  </BrowserRouter>
);

describe('Cart - Functional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token-123');
  });

  // 1. TESZT: ÜRES KOSÁR
  test('displays empty cart message when no items', async () => {
    const mockOnClose = jest.fn();

    apiFetch.mockResolvedValue({
      result: 'success',
      data: {
        items: [],
        total: [],
      },
    });

    render(<CartWithRouter onClose={mockOnClose} isClosing={false} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/cart', expect.any(Object));
    });

    expect(screen.getByText('Üres a kosár')).toBeInTheDocument();
  });

  // 2. TESZT: KOSÁR ELEMEKKEL
  test('displays cart items with correct details', async () => {
    const mockOnClose = jest.fn();

    apiFetch.mockResolvedValue({
      result: 'success',
      data: {
        items: [
          {
            prodId: 1,
            productName: 'Laptop',
            productPrice: 500000,
            quantity: 2,
          },
          {
            prodId: 2,
            productName: 'Mouse',
            productPrice: 5000,
            quantity: 1,
          },
        ],
        total: [{ total: 1005000 }],
      },
    });

    render(<CartWithRouter onClose={mockOnClose} isClosing={false} />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('500000 Ft')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.getByText('5000 Ft')).toBeInTheDocument();
  });

  // 3. TESZT: VÉGÖSSZEG KIJELZÉSE
  test('displays correct total price', async () => {
    const mockOnClose = jest.fn();

    apiFetch.mockResolvedValue({
      result: 'success',
      data: {
        items: [
          {
            prodId: 1,
            productName: 'Laptop',
            productPrice: 500000,
            quantity: 2,
          },
        ],
        total: [{ total: 1000000 }],
      },
    });

    render(<CartWithRouter onClose={mockOnClose} isClosing={false} />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    expect(screen.getByText(/1 000 000 Ft/)).toBeInTheDocument();
  });

  // 4. TESZT: MENNYISÉG NÖVELÉS
  test('increases quantity when + button is clicked', async () => {
    const mockOnClose = jest.fn();

    apiFetch
      .mockResolvedValueOnce({
        result: 'success',
        data: {
          items: [
            {
              prodId: 1,
              productName: 'Laptop',
              productPrice: 500000,
              quantity: 2,
            },
          ],
          total: [{ total: 1000000 }],
        },
      })
      .mockResolvedValueOnce({
        result: 'success',
        data: {
          items: [
            {
              prodId: 1,
              productName: 'Laptop',
              productPrice: 500000,
              quantity: 3,
            },
          ],
          total: [{ total: 1500000 }],
        },
      });

    const { rerender } = render(
      <CartWithRouter onClose={mockOnClose} isClosing={false} />
    );

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const plusButtons = screen.getAllByRole('button', { name: '+' });
    const user = userEvent.setup();
    await user.click(plusButtons[0]);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/cart/1',
        expect.objectContaining({
          method: 'PATCH',
          body: { amount: 1 },
        })
      );
    });
  });

  // 5. TESZT: MENNYISÉG CSÖKKENTÉS
  test('decreases quantity when - button is clicked', async () => {
    const mockOnClose = jest.fn();

    apiFetch
      .mockResolvedValueOnce({
        result: 'success',
        data: {
          items: [
            {
              prodId: 1,
              productName: 'Laptop',
              productPrice: 500000,
              quantity: 2,
            },
          ],
          total: [{ total: 1000000 }],
        },
      })
      .mockResolvedValueOnce({
        result: 'success',
        data: {
          items: [
            {
              prodId: 1,
              productName: 'Laptop',
              productPrice: 500000,
              quantity: 1,
            },
          ],
          total: [{ total: 500000 }],
        },
      });

    render(<CartWithRouter onClose={mockOnClose} isClosing={false} />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const minusButtons = screen.getAllByRole('button', { name: '-' });
    const user = userEvent.setup();
    await user.click(minusButtons[0]);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/cart/1',
        expect.objectContaining({
          method: 'PATCH',
          body: { amount: -1 },
        })
      );
    });
  });

  // 6. TESZT: BEZÁRÁS GOMB
  test('closes cart when close button is clicked', async () => {
    const mockOnClose = jest.fn();

    apiFetch.mockResolvedValue({
      result: 'success',
      data: {
        items: [],
        total: [],
      },
    });

    render(<CartWithRouter onClose={mockOnClose} isClosing={false} />);

    const closeButton = screen.getByRole('button', { name: '×' });
    const user = userEvent.setup();
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // 7. TESZT: CHECKOUT GOMB NAVIGÁCIÓ
  test('navigates to checkout when checkout button is clicked', async () => {
    const mockOnClose = jest.fn();

    apiFetch.mockResolvedValue({
      result: 'success',
      data: {
        items: [
          {
            prodId: 1,
            productName: 'Laptop',
            productPrice: 500000,
            quantity: 1,
          },
        ],
        total: [{ total: 500000 }],
      },
    });

    render(<CartWithRouter onClose={mockOnClose} isClosing={false} />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const checkoutButton = screen.getByRole('button', {
      name: /Tovább a fizetéshez/i,
    });

    const user = userEvent.setup();
    await user.click(checkoutButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // 8. TESZT: NEM ÉRKEZETT TOKEN
  test('returns early if no token in localStorage', async () => {
    localStorage.clear();
    const mockOnClose = jest.fn();

    render(<CartWithRouter onClose={mockOnClose} isClosing={false} />);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(apiFetch).not.toHaveBeenCalled();
  });

  // 9. TESZT: API HIBA KEZELÉS
  test('handles API error gracefully', async () => {
    const mockOnClose = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    apiFetch.mockRejectedValue(new Error('Network error'));

    render(<CartWithRouter onClose={mockOnClose} isClosing={false} />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalled();
    });

    expect(screen.queryByText('Kosár töltödik')).not.toBeInTheDocument();

    console.error.mockRestore();
  });

  // 10. TESZT: ZÁRÁS CSS OSZTÁLY
  test('applies closing class when isClosing is true', () => {
    const mockOnClose = jest.fn();

    apiFetch.mockResolvedValue({
      result: 'success',
      data: {
        items: [],
        total: [],
      },
    });

    const { container } = render(
      <CartWithRouter onClose={mockOnClose} isClosing={true} />
    );

    const cartBackground = container.querySelector('#cartBackground');
    expect(cartBackground).toHaveClass('closing');
  });
});
