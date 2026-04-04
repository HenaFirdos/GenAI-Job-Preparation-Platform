import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'


const Login = () => {
  const navigate = useNavigate()
  const { loading, handleLogin } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      await handleLogin({ email, password })
      navigate("/")
    } catch (err) {
      setError(err.message || "Login failed")
    }
  }
  if (loading) {
    return (<main><h1>Loading........</h1></main>)
  }
  return(
    <main className='auth-page'>
        <div className='auth-backdrop-card auth-backdrop-card--left'>
          <span className='backdrop-pill'>AI Resume Analyzer</span>
          <h2>Prepare smarter. Interview stronger.</h2>
          <p>Sign in to access your saved reports, role-specific interview plans, match scores, and resume insights in one focused workspace.</p>
          <div className='auth-feature-list'>
            <div className='auth-feature-item'>
              <strong>Smart Resume Review</strong>
              <span>See how your profile aligns with every job description.</span>
            </div>
            <div className='auth-feature-item'>
              <strong>Personalized Interview Plans</strong>
              <span>Get technical, behavioral, and preparation guidance instantly.</span>
            </div>
            <div className='auth-feature-item'>
              <strong>Saved Progress</strong>
              <span>Come back anytime and continue from your latest report.</span>
            </div>
          </div>
        </div>
        <div className="form-container">
            <div className='auth-header'>
              <span className='auth-badge'>Welcome back</span>
              <h1>Login</h1>
              <p>Access your personal dashboard to review saved analyses, upload new resumes, and generate fresh interview strategies in seconds.</p>
              <p className='auth-header__subtext'>Continue where you left off and keep your interview preparation workflow organized in one clean place.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="email">Email</label>  
                <div className='input-shell'>
                  <span className='input-icon' aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" opacity=".12" /><path d="m22 6-10 7L2 6" /><rect x="2" y="4" width="20" height="16" rx="3" /></svg>
                  </span>
                  <input 
                  onChange ={(e)=>{setEmail(e.target.value)}}
                  type="email" id="email" name='email' placeholder='Enter your email'/>
                </div>
                </div>
                <div className="input-group">
                  <label htmlFor="password">Password</label>  
                <div className='input-shell'>
                  <span className='input-icon' aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V8a5 5 0 0 1 10 0v3" /></svg>
                  </span>
                  <input 
                  onChange ={(e)=>{setPassword(e.target.value)}}
                  type={showPassword ? "text" : "password"} id="password" name='password' placeholder='Enter your password'/>
                  <button
                    type='button'
                    className='password-toggle'
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10 10 0 0 1 6.06 6.06" /><path d="M1 1l22 22" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                </div>
                {error ? <p className='form-error'>{error}</p> : null}
                <button className='button primary-button'>Login</button>
            </form>
             <div className='auth-note'>
                <span className='auth-note__dot' />
                Secure sign-in keeps your reports and generated plans private to your account.
             </div>
             <p className='auth-switch'>Don't have an account? <Link to={"/register"}>Register</Link></p>

        </div>
       </main>
)
}
export default Login
