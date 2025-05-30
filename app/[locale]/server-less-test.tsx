'use client'

import { useState } from 'react'

import { enqueueDurableObjectTask, ServerLessActiveTimesTest } from '@/actions/test'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const SeverLessTestComponent = () => {
  const [value, setValue] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Only update the value if it's an integer or empty
    if (/^\d*$/.test(newValue)) {
      setValue(newValue)
    }
  }

  return (
    <>
      <Input value={value} onChange={handleInputChange} />
      <Button
        onClick={() => {
          ServerLessActiveTimesTest(Number(value))
        }}
      >
        {'test1'}
      </Button>
      <Button
        onClick={() => {
          enqueueDurableObjectTask({
            a: 1,
            b: 2
          })
        }}
      >
        {'queue1'}
      </Button>
    </>
  )
}
