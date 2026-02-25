import React from 'react'
import { render, screen } from '@testing-library/react'
import GeneratePage from '../app/(dashboard)/generate/page'
import { Providers } from '../app/providers'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(() =>
    Promise.resolve({ ok: true, data: [{ id: 'profile-1', name: 'Test Profile' }] })
  ),
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<Providers>{ui}</Providers>)
}

describe('GeneratePage', () => {
  it('renders generate resume form', async () => {
    renderWithProviders(<GeneratePage />)
    expect(screen.getByText('Generate resume')).toBeInTheDocument()
    await screen.findByLabelText('Job description')
    expect(screen.getByLabelText('Job description')).toBeInTheDocument()
  })
})

