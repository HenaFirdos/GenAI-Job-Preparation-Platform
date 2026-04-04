import React, { useEffect, useRef, useState } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import LogoutMenu from '../components/LogoutMenu.jsx'

const Home = () => {

    const { loading, generateReport, reports, getReports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ error, setError ] = useState("")
    const [ logoutError, setLogoutError ] = useState("")
    const [ selectedResumeName, setSelectedResumeName ] = useState("")
    const [ planDays, setPlanDays ] = useState("5")
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    useEffect(() => {
        const loadReports = async () => {
            try {
                await getReports()
            } catch (error) {
                if (error?.response?.status === 401) {
                    setError("Session expired. Please log in again.")
                    navigate("/login")
                }
            }
        }

        loadReports()
    }, [getReports, navigate])

    const handleGenerateReport = async () => {
        const trimmedJobDescription = jobDescription.trim()
        const trimmedSelfDescription = selfDescription.trim()
        const resumeFile = resumeInputRef.current.files[ 0 ]
        const desiredPlanDays = Number(planDays)

        if (!trimmedJobDescription) {
            setError("Job description is required")
            return
        }

        if (!Number.isInteger(desiredPlanDays) || desiredPlanDays < 1 || desiredPlanDays > 30) {
            setError("Plan length must be between 1 and 30 days")
            return
        }

        if (!resumeFile && !trimmedSelfDescription) {
            setError("Please upload a resume or add a self description")
            return
        }

        setError("")
        try {
            const data = await generateReport({
                jobDescription: trimmedJobDescription,
                selfDescription: trimmedSelfDescription,
                resumeFile,
                planDays: desiredPlanDays,
            })

            if (data?._id) {
                await getReports()
                navigate(`/interview/${data._id}`)
                return
            }

            setError("Could not generate interview strategy. Please try again.")
        } catch (error) {
            if (error?.response?.status === 401) {
                setError("Session expired. Please log in again.")
                navigate("/login")
                return
            }

            setError(error?.response?.data?.message || "Could not generate interview strategy. Please check your backend and try again.")
        }
    }

    const handleLogoutClick = async () => {
        setLogoutError("")
        try {
            await handleLogout()
            navigate("/login")
        } catch (err) {
            setLogoutError(err?.message || "Logout failed. Please try again.")
        }
    }

    const handleResumeChange = (event) => {
        const file = event.target.files?.[0]

        if (!file) {
            setSelectedResumeName("")
            return
        }

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF resume files are allowed")
            event.target.value = ""
            setSelectedResumeName("")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Resume file must be 5MB or smaller")
            event.target.value = ""
            setSelectedResumeName("")
            return
        }

        setError("")
        setSelectedResumeName(file.name)
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {user && (
                <div className='header-actions'>
                    <LogoutMenu user={user} onLogout={handleLogoutClick} />
                </div>
            )}
            {logoutError && <p className='logout-error'>{logoutError}</p>}
            <header className='page-header'>
                <span className='page-header__eyebrow'>AI Resume Analyzer</span>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            <div className='interview-card'>
                <div className='interview-card__body'>

                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            value={jobDescription}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...
e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='panel__footer-row'>
                            <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                        </div>
                        <p className='panel__helper'>Include role scope, key tools, preferred experience, and success expectations for the best analysis quality.</p>
                    </div>

                    <div className='panel-divider' />

                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label className='dropzone' htmlFor='resume'>
                                <span className='dropzone__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                </span>
                                <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                <p className='dropzone__subtitle'>PDF only (Max 5MB)</p>
                                {selectedResumeName ? <p className='dropzone__file'>{selectedResumeName}</p> : null}
                                <input ref={resumeInputRef} onChange={handleResumeChange} hidden type='file' id='resume' name='resume' accept='.pdf,application/pdf' />
                            </label>
                        </div>

                    

                        <div className='or-divider'><span>OR</span></div>

                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                value={selfDescription}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                            <p className='panel__helper'>A concise skills summary works too if your resume is not ready yet.</p>
                        </div>

                        <div className='roadmap-duration'>
                            <div className='roadmap-duration__header'>
                                <span className='roadmap-duration__title'>Roadmap Duration</span>
                                <span className='roadmap-duration__badge'>Required</span>
                            </div>
                            <div className='roadmap-duration__input'>
                                <select
                                    id='planDays'
                                    value={planDays}
                                    onChange={(e) => { setPlanDays(e.target.value) }}
                                >
                                    {Array.from({ length: 30 }, (_, index) => index + 1).map(day => (
                                        <option key={day} value={day}>{day} day{day > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <p className='plan-days__helper'>Enter how many days you want for your preparation roadmap, and the plan will be generated for that duration.</p>
                        </div>

                        <div className='info-wrapper'>
                            <div className='info-box'>
                                <span className='info-box__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" />
                                    </svg>
                                </span>
                                <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                            </div>
                        </div>
                    </div>

                    <div className='panel-divider' />

                    <div className='panel panel--reports'>
                        <div className='panel__header panel__header--reports'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                            </span>
                            <div>
                                <h2>Recent Reports</h2>
                                <p className='panel__subtext'>Jump back into saved interview plans.</p>
                            </div>
                        </div>

                        {reports.length > 0 ? (
                            <ul className='reports-list reports-list--panel'>
                                {reports.slice(0, 6).map(report => (
                                    <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                        <div className='report-item__top'>
                                            <span className='report-badge'>Saved</span>
                                            <span className={`report-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>{report.matchScore}%</span>
                                        </div>
                                        <h3>{report.title || 'Untitled Position'}</h3>
                                        <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                        <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                            Match Score: {report.matchScore}%
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className='empty-reports'>
                                <p>No interview plans generated yet. Create your first one above.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation • Approx 30s</span>
                    <button className='generate-btn' onClick={handleGenerateReport}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
                {error ? <p className='form-error'>{error}</p> : null}
            </div>

            <footer className='page-footer'>
                <a href="/login">Login</a>
                <a href="/register">Create account</a>
            </footer>
        </div>
    )
}

export default Home
