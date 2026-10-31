import { describe, it, expect } from 'vitest'
import { LIMITS } from '@/domain/limits'
import { getDefaultSpineColor, SPINE_PALETTE } from '@/domain/types'

describe('Domain Smoke Tests', () => {
  it('has expected limits configured', () => {
    expect(LIMITS.HEADLINE_MAX).toBe(80)
    expect(LIMITS.SUMMARY_MAX).toBe(280)
    expect(LIMITS.SKILLS_MAX).toBe(12)
  })

  it('generates deterministic spine color', () => {
    const color1 = getDefaultSpineColor('test-id-123')
    const color2 = getDefaultSpineColor('test-id-123')
    expect(color1).toBe(color2)
    expect(SPINE_PALETTE).toContain(color1)
  })
})

