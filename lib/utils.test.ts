import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('w-full', 'h-full')).toBe('w-full h-full')
  })

  it('should handle conditional classes', () => {
    const isTrue = true
    const isFalse = false
    expect(cn('w-full', isTrue && 'block', isFalse && 'hidden')).toBe('w-full block')
  })

  it('should merge tailwind classes properly', () => {
    // tailwind-merge should override p-4 with p-8
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })
})
