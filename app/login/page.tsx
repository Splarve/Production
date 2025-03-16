'use client'
import { login, signup } from './actions'
import { useState } from 'react'

export default function LoginPage() {
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [userType, setUserType] = useState<'company' | 'applicant'>('applicant')

  return (
    <div>
      <h1>{isSigningUp ? 'Sign Up' : 'Log In'}</h1>
      
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" required />
        </div>
        
        <div>
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" required />
        </div>
        
        {isSigningUp && (
          <div>
            <p>I am a:</p>
            <div>
              <input
                type="radio"
                id="applicant"
                name="userType"
                value="applicant"
                checked={userType === 'applicant'}
                onChange={() => setUserType('applicant')}
                required
              />
              <label htmlFor="applicant">Job Applicant</label>
            </div>
            
            <div>
              <input
                type="radio"
                id="company"
                name="userType"
                value="company"
                checked={userType === 'company'}
                onChange={() => setUserType('company')}
              />
              <label htmlFor="company">Company</label>
            </div>
            <input type="hidden" name="userType" value={userType} />
          </div>
        )}
        
        {isSigningUp ? (
          <div>
            <button type="submit" formAction={signup}>Sign Up</button>
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsSigningUp(false)}>
                Log In
              </button>
            </p>
          </div>
        ) : (
          <div>
            <button type="submit" formAction={login}>Log In</button>
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsSigningUp(true)}>
                Sign Up
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  )
}