import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
      e.preventDefault()
      await handleRegister({ username, email, password })
      navigate("/")
    }
  if (loading) {
    return (<main><h1>Loading........</h1></main>)
  }
    return(
        
       <main className='auth-page'>
        <div className='auth-backdrop-card auth-backdrop-card--right'>
            <span className='backdrop-pill'>Create your workspace</span>
            <h2>Build a stronger first impression with AI.</h2>
            <p>Create an account to generate premium interview strategies, store role-specific reports, and sharpen your resume for every opportunity.</p>
            <div className='auth-feature-list'>
                <div className='auth-feature-item'>
                    <strong>Role Match Scoring</strong>
                    <span>Understand strengths and gaps before you apply.</span>
                </div>
                <div className='auth-feature-item'>
                    <strong>Guided Preparation</strong>
                    <span>Turn job descriptions into practical interview roadmaps.</span>
                </div>
                <div className='auth-feature-item'>
                    <strong>Cleaner Career Workflow</strong>
                    <span>Keep your resume uploads, notes, and reports organized in one place.</span>
                </div>
            </div>
        </div>
        <div className="form-container">
            <div className='auth-header'>
                <span className='auth-badge'>Get started</span>
                <h1>Register</h1>
                <p>Create your account and unlock a premium AI workspace for resume-driven interview preparation, saved reports, and faster job targeting.</p>
                <p className='auth-header__subtext'>A few details are all you need to start building smarter applications and stronger interview plans.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="username">Username</label>  
                <div className='input-shell'>
                    <span className='input-icon' aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 1 0-16 0" /><circle cx="12" cy="7" r="4" /></svg>
                    </span>
                    <input
                    onChange={(e)=>{setUsername(e.target.value)}}
                    type="text" id="username" name='username' placeholder='Enter your username'/>
                </div>
                </div>
                <div className="input-group">
                  <label htmlFor="email">Email</label>  
                <div className='input-shell'>
                    <span className='input-icon' aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" opacity=".12" /><path d="m22 6-10 7L2 6" /><rect x="2" y="4" width="20" height="16" rx="3" /></svg>
                    </span>
                    <input 
                    onChange={(e)=>{setEmail(e.target.value)}}
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
                    onChange={(e)=>{setPassword(e.target.value)}}
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
                <button className='button primary-button'>Register</button>
            </form>
            <div className='auth-note'>
                <span className='auth-note__dot' />
                Your account lets you revisit interview plans and improve each application over time.
            </div>
            <p className='auth-switch'>Already have an account? <Link to={"/login"}>Login</Link></p>

        </div>
       </main>

    )
}
export default Register
