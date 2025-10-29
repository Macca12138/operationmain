'use client'

import { useState, useEffect } from 'react'

export function useClientDate() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getToday = () => {
    if (!mounted) return ''
    return new Date().toISOString().split('T')[0]
  }

  const getLastMonday = () => {
    if (!mounted) return ''

    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Calculate days to go back to last week's Monday
    const daysToLastMonday = currentDay === 0 ? 6 : currentDay - 1 // Days to this week's Monday

    // Create last week's Monday using setDate (handles month boundaries correctly)
    const lastMonday = new Date(today)
    lastMonday.setDate(today.getDate() - daysToLastMonday - 7) // Go back to this week's Monday, then -7 days

    return lastMonday.toISOString().split('T')[0]
  }

  const getLastSunday = () => {
    if (!mounted) return ''

    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Calculate days to go back to last week's Sunday
    const daysToLastSunday = currentDay === 0 ? 7 : currentDay // If Sunday, go back 7 days; otherwise go back currentDay days

    // Create last week's Sunday using setDate (handles month boundaries correctly)
    const lastSunday = new Date(today)
    lastSunday.setDate(today.getDate() - daysToLastSunday)

    return lastSunday.toISOString().split('T')[0]
  }

  return {
    mounted,
    getToday,
    getLastMonday,
    getLastSunday
  }
}