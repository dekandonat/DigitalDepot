import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../src/components/LoginForm';

jest.mock('../src/assets/util/fetch', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '../src/assets/util/fetch';

describe('Login Form - Functional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    delete window.location;
    window.location = { reload: jest.fn(), href: '/' };
  });

  test('user can login with email and password', async () => {
    const mockOnClose = jest.fn();
    const mockSetIsLoggedIn = jest.fn();

    apiFetch.mockResolvedValue({
      result: 'success',
      message: {
        token: 'eyJhbGc...',
        userName: 'testuser',
        email: 'test@example.com',
      },
    });

    render(
      <LoginForm onClose={mockOnClose} setIsLoggedIn={mockSetIsLoggedIn} />
    );

    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText('pelda@gmail.com'),
      'test@example.com'
    );
    await user.type(screen.getByLabelText('Jelszó'), 'TestPass123');
    await user.click(screen.getByRole('button', { name: /bejelentkezés/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/user/login',
        expect.objectContaining({
          method: 'POST',
          body: {
            email: 'test@example.com',
            password: 'TestPass123',
            userName: '',
          },
        })
      );
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('eyJhbGc...');
    });

    expect(localStorage.getItem('user')).toBe('testuser');
    expect(localStorage.getItem('email')).toBe('test@example.com');
    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
  });

  test('user can register with email, username and password', async () => {
    const mockOnClose = jest.fn();
    const mockSetIsLoggedIn = jest.fn();

    apiFetch.mockResolvedValue({
      result: 'success',
      message: 'User registered successfully',
    });

    render(
      <LoginForm onClose={mockOnClose} setIsLoggedIn={mockSetIsLoggedIn} />
    );

    const user = userEvent.setup();

    await user.click(screen.getByText('Regisztráció'));
    await user.type(screen.getByLabelText('Felhasználónév'), 'newuser');
    await user.type(
      screen.getByPlaceholderText('pelda@gmail.com'),
      'newuser@example.com'
    );

    const passwordInputs = screen.getAllByLabelText('Jelszó');
    await user.type(passwordInputs[0], 'TestPass123');
    await user.type(
      screen.getByLabelText('Jelszó megerősítése'),
      'TestPass123'
    );
    await user.click(screen.getByRole('button', { name: /regisztráció/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/user/register',
        expect.objectContaining({
          method: 'POST',
          body: {
            email: 'newuser@example.com',
            password: 'TestPass123',
            userName: 'newuser',
          },
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Sikeres regisztráció!')).toBeInTheDocument();
    });
  });

  test('user sees error when email already in use', async () => {
    const mockOnClose = jest.fn();
    const mockSetIsLoggedIn = jest.fn();

    apiFetch.mockRejectedValue(new Error('email already in use'));

    render(
      <LoginForm onClose={mockOnClose} setIsLoggedIn={mockSetIsLoggedIn} />
    );

    const user = userEvent.setup();

    await user.click(screen.getByText('Regisztráció'));
    await user.type(screen.getByLabelText('Felhasználónév'), 'newuser');
    await user.type(
      screen.getByPlaceholderText('pelda@gmail.com'),
      'existing@example.com'
    );

    const passwordInputs = screen.getAllByLabelText('Jelszó');
    await user.type(passwordInputs[0], 'TestPass123');
    await user.type(
      screen.getByLabelText('Jelszó megerősítése'),
      'TestPass123'
    );
    await user.click(screen.getByRole('button', { name: /regisztráció/i }));

    await waitFor(() => {
      expect(screen.getByText('email already in use')).toBeInTheDocument();
    });
  });

  test('user sees error when passwords do not match', async () => {
    const mockOnClose = jest.fn();
    const mockSetIsLoggedIn = jest.fn();

    render(
      <LoginForm onClose={mockOnClose} setIsLoggedIn={mockSetIsLoggedIn} />
    );

    const user = userEvent.setup();

    await user.click(screen.getByText('Regisztráció'));
    await user.type(screen.getByLabelText('Felhasználónév'), 'newuser');
    await user.type(
      screen.getByPlaceholderText('pelda@gmail.com'),
      'newuser@example.com'
    );

    const passwordInputs = screen.getAllByLabelText('Jelszó');
    await user.type(passwordInputs[0], 'TestPass123');
    await user.type(
      screen.getByLabelText('Jelszó megerősítése'),
      'DifferentPass456'
    );
    await user.click(screen.getByRole('button', { name: /regisztráció/i }));

    await waitFor(() => {
      expect(screen.getByText('A két jelszó nem egyezik!')).toBeInTheDocument();
    });

    expect(apiFetch).not.toHaveBeenCalled();
  });

  test('user sees error message on login failure', async () => {
    const mockOnClose = jest.fn();
    const mockSetIsLoggedIn = jest.fn();

    apiFetch.mockRejectedValue(new Error('Helytelen email vagy jelszó'));

    render(
      <LoginForm onClose={mockOnClose} setIsLoggedIn={mockSetIsLoggedIn} />
    );

    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText('pelda@gmail.com'),
      'wrong@example.com'
    );
    await user.type(screen.getByLabelText('Jelszó'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /bejelentkezés/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Helytelen email vagy jelszó')
      ).toBeInTheDocument();
    });
  });

  test('user can switch between login and register mode', async () => {
    const mockOnClose = jest.fn();
    const mockSetIsLoggedIn = jest.fn();

    render(
      <LoginForm onClose={mockOnClose} setIsLoggedIn={mockSetIsLoggedIn} />
    );

    const user = userEvent.setup();

    expect(screen.queryByLabelText('Felhasználónév')).not.toBeInTheDocument();
    await user.click(screen.getByText('Regisztráció'));
    expect(screen.getByLabelText('Felhasználónév')).toBeInTheDocument();

    await user.click(screen.getByText('Bejelentkezés'));
    expect(screen.queryByLabelText('Felhasználónév')).not.toBeInTheDocument();
  });

  test('user can close the form with close button', async () => {
    const mockOnClose = jest.fn();
    const mockSetIsLoggedIn = jest.fn();

    render(
      <LoginForm onClose={mockOnClose} setIsLoggedIn={mockSetIsLoggedIn} />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '×' }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
