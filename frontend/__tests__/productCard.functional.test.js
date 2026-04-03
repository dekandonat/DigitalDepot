import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProductList from '../src/components/ProductList';

jest.mock('../src/assets/util/fetch', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '../src/assets/util/fetch';

const ProductListWithRouter = () => (
  <BrowserRouter>
    <ProductList />
  </BrowserRouter>
);

describe('ProductCard - Add to Cart Functional Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token-123');
  });

  //1. TESZT: KOSÁRBA HELYEZÉS
  test('Adds product to cart when in stock', async () => {
    const mockProduct = {
      prodId: 1,
      productName: 'Laptop',
      productPrice: 500000,
      productImg: 'laptop.jpg',
      productDescription: 'Gaming Laptop',
      avgRating: 4.5,
      reviewCount: 10,
      quantity: 5,
      conditionState: 'Új',
      categoryId: 1,
    };

    apiFetch.mockResolvedValue({
      data: [mockProduct],
    });

    render(<ProductListWithRouter />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByRole('button', { name: /Kosárba/i });
    const user = userEvent.setup();
    await user.click(addToCartButton);

    await waitFor(() => {
      expect(
        screen.getByText('Sikeresen a kosárba helyezve!')
      ).toBeInTheDocument();
    });
  });

  test('Does NOT add product to cart when out of stock', async () => {
    const mockProduct = {
      prodId: 1,
      productName: 'Laptop',
      productPrice: 500000,
      productImg: 'laptop.jpg',
      productDescription: 'Gaming Laptop',
      avgRating: 4.5,
      reviewCount: 10,
      quantity: 0,
      conditionState: 'Új',
      categoryId: 1,
    };

    apiFetch.mockResolvedValue({
      data: [mockProduct],
    });

    render(<ProductListWithRouter />);

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByRole('button', { name: /Kosárba/i });
    const user = userEvent.setup();
    await user.click(addToCartButton);

    expect(
      screen.queryByText('Sikeresen a kosárba helyezve!')
    ).not.toBeInTheDocument();
  });
});
