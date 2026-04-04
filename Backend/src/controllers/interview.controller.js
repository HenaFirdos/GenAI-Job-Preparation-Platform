const { PDFParse } = require("pdf-parse")
const {generateInterviewReport,generateResumePdf} = require("../services/ai.services")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @description Controller to generate interview report based on user self description, resume pdf and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const resumeFile =
            req.files?.resume?.[0] ||
            req.files?.pdf?.[0] ||
            req.files?.file?.[0] ||
            req.file

        const { selfDescription, jobDescription } = req.body
        const rawPlanDays = Number(req.body.planDays)
        const planDays = Number.isInteger(rawPlanDays) ? rawPlanDays : 5

        if (!jobDescription?.trim()) {
            return res.status(400).json({
                message: "Job description is required",
            })
        }

        if (!resumeFile && !selfDescription?.trim()) {
            return res.status(400).json({
                message: "Either resume or selfDescription is required",
            })
        }

        if (planDays < 1 || planDays > 14) {
            return res.status(400).json({
                message: "Plan length must be between 1 and 14 days",
            })
        }

        let resumeContent = ""

        if (resumeFile) {
            const parser = new PDFParse({ data: resumeFile.buffer })
            const parsedPdf = await parser.getText()
            await parser.destroy()
            resumeContent = parsedPdf.text?.trim() || ""

            if (!resumeContent) {
                return res.status(400).json({
                    message: "Could not read text from the uploaded PDF",
                })
            }
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription: selfDescription?.trim() || "",
            jobDescription: jobDescription.trim(),
            planDays,
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription: selfDescription?.trim() || "",
            jobDescription: jobDescription.trim(),
            title: interviewReportByAi.title,
            matchScore: interviewReportByAi.matchScore,
            technicalQuestion: interviewReportByAi.technicalQuestions.map((item) => ({
                question: item.question,
                intension: item.intention,
                answer: item.answer,
            })),
            behavioralQuestion: interviewReportByAi.behavioralQuestions.map((item) => ({
                question: item.question,
                intension: item.intention,
                answer: item.answer,
            })),
            skillGaps: interviewReportByAi.skillGaps,
            planDays,
            preprationPlan: interviewReportByAi.preparationPlan,
        })

        return res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport,
        })
    } catch (err) {
        const statusCode = err.message === "Only PDF files are allowed" ? 400 : 500

        return res.status(statusCode).json({
            message: err.message || "Failed to generate interview report",
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id,
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found.",
            })
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport,
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to fetch interview report",
        })
    }
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestion -behavioralQuestion -skillGaps -preprationPlan")

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports,
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to fetch interview reports",
        })
    }
}
/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}
module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
}
