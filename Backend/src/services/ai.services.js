const { GoogleGenAI } = require("@google/genai")
const puppeteer =require("puppeteer")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
})


const interviewReportSchema = {
    type: "object",
    additionalProperties: false,
    required: [
        "title",
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
    ],
    properties: {
        title: {
            type: "string",
        },
        matchScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
        },
        technicalQuestions: {
            type: "array",
            minItems: 10,
            maxItems: 28,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["question", "intention", "answer"],
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" },
                },
            },
        },
        behavioralQuestions: {
            type: "array",
            minItems: 1,
            maxItems: 14,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["question", "intention", "answer"],
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" },
                },
            },
        },
        skillGaps: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["skill", "severity"],
                properties: {
                    skill: { type: "string" },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                    },
                },
            },
        },
        preparationPlan: {
            type: "array",
            minItems: 1,
            maxItems: 14,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["day", "focus", "tasks"],
                properties: {
                    day: { type: "integer", minimum: 1 },
                    focus: { type: "string" },
                    tasks: {
                        type: "array",
                        minItems: 3,
                        maxItems: 5,
                        items: { type: "string" },
                    },
                },
            },
        },
    },
}

async function generateInterviewReport ({resume,selfDescription,jobDescription, planDays = 5}) {
    const minTechnicalQuestions = Math.min(28, Math.max(10, planDays * 2))
    const requiredBehavioralQuestions = Math.min(14, Math.max(1, planDays))
    const prompt = `Generate a highly detailed interview preparation report in valid JSON only.

Return only one JSON object with exactly these keys in this order:
1. title
2. matchScore
3. technicalQuestions
4. behavioralQuestions
5. skillGaps
6. preparationPlan

Follow this exact shape:
{
  "title": "",
  "matchScore": 0,
  "technicalQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "behavioralQuestions": [
    {
      "question": "",
      "intention": "",
      "answer": ""
    }
  ],
  "skillGaps": [
    {
      "skill": "",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "",
      "tasks": ["", "", ""]
    }
  ]
}

Formatting rules:
- Return only JSON.
- No markdown fences.
- No extra keys.
- Use double quotes for all string values.
- Make the JSON professional and detailed.

- Content rules:
- title must be the target job title inferred from the job description.
- matchScore must be realistic and based on resume vs job description fit.
- technicalQuestions must contain at least ${minTechnicalQuestions} role-specific backend/Node.js interview questions that reference requirements mentioned in the job description.
- Each technical question must include a detailed, practical answer guide and mention how to prepare across the roadmap duration.
- behavioralQuestions must contain exactly ${requiredBehavioralQuestions} realistic behavioral questions inspired by the role, each reflecting one of the roadmap days.
- Each behavioral answer must be STAR-style, specific, and tied back to the job description.
- skillGaps must contain exactly 4 specific missing or weaker skills.
- preparationPlan must contain exactly ${planDays} days.
- Each preparationPlan day must have 1 focus and 3 to 5 actionable tasks.
- Tailor every section to the candidate profile and the target backend role.
- Avoid generic filler. Make the report feel realistic, specific, and interview-ready.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Target Job Description:
${jobDescription}`

const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
         config: {
            responseMimeType: "application/json",
            responseJsonSchema: interviewReportSchema,
        }
    })
    const parsedResponse = JSON.parse(response.text)
    const returnedTechnicalCount = (parsedResponse.technicalQuestions || []).length
    const returnedBehavioralCount = (parsedResponse.behavioralQuestions || []).length

    if (returnedTechnicalCount < minTechnicalQuestions) {
        throw new Error(`AI returned only ${returnedTechnicalCount} technical questions; expected at least ${minTechnicalQuestions}.`)
    }

    if (returnedBehavioralCount !== requiredBehavioralQuestions) {
        throw new Error(`AI returned ${returnedBehavioralCount} behavioral questions; expected exactly ${requiredBehavioralQuestions}.`)
    }

    if (!Array.isArray(parsedResponse.preparationPlan) || parsedResponse.preparationPlan.length !== planDays) {
        throw new Error(`AI returned ${parsedResponse.preparationPlan?.length || 0} preparation day(s); expected ${planDays}. Please try again.`)
    }

    console.log(JSON.stringify(parsedResponse, null, 2))
    return parsedResponse
}
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 })
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
            top: "8mm",
            bottom: "8mm",
            left: "8mm",
            right: "8mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

function enforceSinglePageResumeHtml(htmlContent) {
    const singlePageStyles = `
        <style>
            @page {
                size: A4;
                margin: 8mm;
            }

            * {
                box-sizing: border-box;
            }

            html, body {
                width: 210mm;
                min-height: 277mm;
                margin: 0;
                padding: 0;
                background: #ffffff;
                color: #111827;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 11px;
                line-height: 1.35;
            }

            body {
                padding: 0;
            }

            h1 {
                font-size: 22px;
                line-height: 1.1;
                margin: 0 0 6px;
            }

            h2, h3, h4 {
                margin: 10px 0 4px;
                line-height: 1.2;
                page-break-after: avoid;
            }

            h2 {
                font-size: 13px;
            }

            h3, h4 {
                font-size: 11.5px;
            }

            p, li {
                font-size: 10.5px;
                line-height: 1.3;
                margin: 0;
            }

            ul, ol {
                margin: 4px 0 0 16px;
                padding: 0;
            }

            li + li {
                margin-top: 2px;
            }

            section, article, div {
                page-break-inside: avoid;
            }

            .resume-container, .page, .wrapper, main {
                width: 100%;
                max-width: 100%;
                margin: 0 auto;
            }
        </style>
    `

    if (htmlContent.includes("</head>")) {
        return htmlContent.replace("</head>", `${singlePageStyles}</head>`)
    }

    if (htmlContent.includes("<body")) {
        return htmlContent.replace(/<body([^>]*)>/i, `<body$1>${singlePageStyles}`)
    }

    return `<!DOCTYPE html><html><head>${singlePageStyles}</head><body>${htmlContent}</body></html>`
}

async function generateResumePdf({resume,selfDescription,jobDescription}){
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })
    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume must fit on exactly 1 A4 page when converted to PDF.
                        Keep the content concise and selective. Include only the strongest and most relevant information for the target role.
                        Use compact spacing, short bullet points, and brief summaries instead of long paragraphs.
                        Do not generate content that would spill onto a second page.
                        Return complete HTML with inline CSS optimized for a single-page resume.
                    `
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(resumePdfSchema),
        }
    })
    const jsonContent = JSON.parse(response.text)

    const singlePageHtml = enforceSinglePageResumeHtml(jsonContent.html)

    const pdfBuffer = await generatePdfFromHtml(singlePageHtml)

    return pdfBuffer
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
}
