import { useState, useEffect } from "react"
import { PremiumWelcomePage } from './welcome/PremiumWelcomePage'

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
}

export function AuthForm({ onLogin, onSignup }: AuthFormProps) {
  // Render the premium welcome page
  return (
    <PremiumWelcomePage 
      onLogin={onLogin} 
      onSignup={onSignup}
      onGuestMode={() => {}}
    />
  )
}