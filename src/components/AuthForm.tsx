import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Leaf } from "lucide-react"

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string, name: string) => Promise<void>
}

export function AuthForm({ onLogin, onSignup }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await onLogin(email, password)
      } else {
        await onSignup(email, password, name)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4">
      <Card className="w-full max-w-md border-emerald-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">DEWII</CardTitle>
            <CardDescription>
              {isLogin ? 'Welcome back! Sign in to continue reading.' : 'Join our community of eco-futurists.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}