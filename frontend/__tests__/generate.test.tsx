import { render, screen } from '@testing-library/react'
import GeneratePage from '../app/(dashboard)/generate/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('GeneratePage', () => {
  it('renders generate resume form', () => {
    render(<GeneratePage />)
    expect(screen.getByText('Generate Resume')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Description')).toBeInTheDocument()
  })
})

