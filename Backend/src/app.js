const express = require("express")
const app = express()
const cors = require("cors")
const multer = require("multer")

// middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    credentials: true,
}))

app.use(express.json())
// parse cookies for auth middleware
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// routes
const authRouter = require("./routes/auth.routes")
const interviewRouter=require("./routes/interview.routes")
app.use("/api/auth", authRouter)
app.use("/api/interview",interviewRouter)

// simple health check
app.get('/health', (req, res) => res.json({ ok: true }))

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: "Invalid file upload. Use one PDF file in the field 'resume', 'pdf', or 'file'.",
            error: err.message,
        })
    }

    if (err) {
        return res.status(400).json({
            message: err.message || "Request failed",
        })
    }

    next()
})

module.exports = app
