import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useCallback, useContext } from "react"
import { InterviewContext } from "../interview.context.instance"

const normalizeQuestion = (item = {}) => ({
    question: item.question || "",
    intention: item.intention || item.intension || "",
    answer: item.answer || "",
})

const normalizeReport = (report) => {
    if (!report) return null

    return {
        ...report,
        technicalQuestions: (report.technicalQuestions || report.technicalQuestion || []).map(normalizeQuestion),
        behavioralQuestions: (report.behavioralQuestions || report.behavioralQuestion || []).map(normalizeQuestion),
        preparationPlan: report.preparationPlan || report.preprationPlan || [],
        skillGaps: report.skillGaps || [],
        planDays: report.planDays || report.preparationPlan?.length || report.preprationPlan?.length || 0,
    }
}


export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, downloadingResume, setDownloadingResume, report, setReport, reports, setReports } = context

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile, planDays }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile, planDays })
            const normalizedReport = normalizeReport(response.interviewReport)
            setReport(normalizedReport)
            return normalizedReport
        } catch (error) {
            console.log(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReport ])

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            const normalizedReport = normalizeReport(response.interviewReport)
            setReport(normalizedReport)
            return normalizedReport
        } catch (error) {
            console.log(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReport ])

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            const normalizedReports = (response.interviewReports || []).map(normalizeReport)
            setReports(normalizedReports)
            return normalizedReports
        } catch (error) {
            console.log(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReports ])

    const getResumePdf = useCallback(async (interviewReportId) => {
        setDownloadingResume(true)
        try {
            const pdfBlob = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ pdfBlob ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.log(error)
            throw error
        } finally {
            setDownloadingResume(false)
        }
    }, [ setDownloadingResume ])

    return { loading, downloadingResume, report, reports, generateReport, getReportById, getReports, getResumePdf }

}
