import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Basic test to ensure App renders
    expect(document.body).toBeInTheDocument()
  })

  it('contains main application container', () => {
    render(<App />)
    // Check for a main container with class name
    const container = document.querySelector('.app-container')
    expect(container).toBeInTheDocument()
  })
})