import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ResetPassword from './ResetPassword'

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams]
  }
})

// Mock AuthProvider
const mockResetPassword = vi.fn()
const mockUpdatePassword = vi.fn()

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
    updatePassword: mockUpdatePassword,
    loading: false
  })
}))

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ResetPassword />
    </BrowserRouter>
  )
}

describe('ResetPassword - Request Reset Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('mode')
  })

  it('renders email form in request mode', () => {
    renderComponent()
    
    expect(screen.getByText('Reset Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    renderComponent()

    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
    expect(mockResetPassword).not.toHaveBeenCalled()
  })

  it('submits valid email and shows success message', async () => {
    const user = userEvent.setup()
    mockResetPassword.mockResolvedValue({ error: null })
    renderComponent()

    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'user@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('user@example.com')
      expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument()
    })
  })

  it('displays error when reset fails', async () => {
    const user = userEvent.setup()
    mockResetPassword.mockResolvedValue({ 
      error: { message: 'Email not found' } 
    })
    renderComponent()

    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    await user.type(emailInput, 'nonexistent@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email not found')).toBeInTheDocument()
    })
  })

  it('clears email field after successful submission', async () => {
    const user = userEvent.setup()
    mockResetPassword.mockResolvedValue({ error: null })
    renderComponent()

    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement
    await user.type(emailInput, 'user@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(emailInput.value).toBe('')
    })
  })

  it('navigates back to auth page', async () => {
    const user = userEvent.setup()
    renderComponent()

    const backButton = screen.getByRole('button', { name: /back to sign in/i })
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/auth')
  })
})

describe('ResetPassword - Update Password Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.set('mode', 'reset')
  })

  it('renders password update form in reset mode', () => {
    renderComponent()
    
    expect(screen.getByText('Set New Password')).toBeInTheDocument()
    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
  })

  it('validates password strength with Zod schema', async () => {
    const user = userEvent.setup()
    renderComponent()

    const passwordInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /update password/i })

    // Test weak password (no uppercase)
    await user.type(passwordInput, 'weakpass123')
    await user.type(confirmInput, 'weakpass123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument()
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('validates password must contain number', async () => {
    const user = userEvent.setup()
    renderComponent()

    const passwordInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(passwordInput, 'NoNumbers')
    await user.type(confirmInput, 'NoNumbers')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/number/i)).toBeInTheDocument()
    })
  })

  it('validates password must be at least 8 characters', async () => {
    const user = userEvent.setup()
    renderComponent()

    const passwordInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(passwordInput, 'Short1')
    await user.type(confirmInput, 'Short1')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('validates passwords match', async () => {
    const user = userEvent.setup()
    renderComponent()

    const passwordInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(passwordInput, 'StrongPass123')
    await user.type(confirmInput, 'DifferentPass123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('submits valid password and shows success', async () => {
    const user = userEvent.setup()
    mockUpdatePassword.mockResolvedValue({ error: null })
    renderComponent()

    const passwordInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(passwordInput, 'StrongPass123')
    await user.type(confirmInput, 'StrongPass123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('StrongPass123')
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument()
    })
  })

  it('redirects to dashboard after successful password update', async () => {
    const user = userEvent.setup()
    mockUpdatePassword.mockResolvedValue({ error: null })
    renderComponent()

    const passwordInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm Password')

    await user.type(passwordInput, 'StrongPass123')
    await user.type(confirmInput, 'StrongPass123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 3000 })
  })

  it('displays error when update fails', async () => {
    const user = userEvent.setup()
    mockUpdatePassword.mockResolvedValue({ 
      error: { message: 'Invalid token' } 
    })
    renderComponent()

    const passwordInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm Password')

    await user.type(passwordInput, 'StrongPass123')
    await user.type(confirmInput, 'StrongPass123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid token')).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    mockUpdatePassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    renderComponent()

    const passwordInput = screen.getByLabelText('New Password')
    const confirmInput = screen.getByLabelText('Confirm Password')
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(passwordInput, 'StrongPass123')
    await user.type(confirmInput, 'StrongPass123')
    await user.click(submitButton)

    expect(submitButton).toHaveTextContent('Updating...')
    expect(passwordInput).toBeDisabled()
    expect(confirmInput).toBeDisabled()
  })
})

describe('ResetPassword - Error Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('mode')
  })

  it('clears previous errors on new submission', async () => {
    const user = userEvent.setup()
    mockResetPassword.mockResolvedValueOnce({ error: { message: 'First error' } })
    mockResetPassword.mockResolvedValueOnce({ error: null })
    renderComponent()

    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: /send reset link/i })

    // First submission with error
    await user.type(emailInput, 'user@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument()
    })

    // Second submission succeeds
    await user.type(emailInput, 'user@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument()
      expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument()
    })
  })
})
