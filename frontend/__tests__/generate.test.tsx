import React from 'react'
import { render, screen } from '@testing-library/react'
import GeneratePage from '../app/(dashboard)/generate/page'
import { Providers } from '../app/providers'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<Providers>{ui}</Providers>)
}

describe('GeneratePage', () => {
  it('renders generate resume form', () => {
    renderWithProviders(<GeneratePage />)
    expect(screen.getByText('Generate Resume')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Description')).toBeInTheDocument()
  })
})

