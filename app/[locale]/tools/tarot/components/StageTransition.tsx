'use client'

import { useState, useEffect, ReactNode } from 'react'

interface StageTransitionProps {
  children: ReactNode
  stage: string
}

export default function StageTransition({ children, stage }: StageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStage, setCurrentStage] = useState(stage)

  useEffect(() => {
    if (stage !== currentStage) {
      setIsVisible(false)
      const timer = setTimeout(() => {
        setCurrentStage(stage)
        setIsVisible(true)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [stage, currentStage])

  return (
    <div
      className={`h-full w-full transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} `}
    >
      {children}
    </div>
  )
}
