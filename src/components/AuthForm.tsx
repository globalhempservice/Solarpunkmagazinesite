import { useState, useEffect } from "react"
import { LandingPage } from './LandingPage'

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string, acceptedTerms: boolean, marketingOptIn: boolean) => Promise<void>
}

export function AuthForm({ onLogin, onSignup }: AuthFormProps) {
  // Just render the landing page which handles everything
  return <LandingPage onLogin={onLogin} onSignup={onSignup} />
}