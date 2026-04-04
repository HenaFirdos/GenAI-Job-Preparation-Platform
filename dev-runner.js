const { spawn } = require("child_process")
const path = require("path")

const rootDir = __dirname
const frontendDir = path.join(rootDir, "Frontend")

const processes = []

function startProcess(name, command, args, cwd) {
    const child = spawn(command, args, {
        cwd,
        stdio: "pipe",
        shell: false,
    })

    const prefix = `[${name}]`

    child.stdout.on("data", (data) => {
        process.stdout.write(`${prefix} ${data}`)
    })

    child.stderr.on("data", (data) => {
        process.stderr.write(`${prefix} ${data}`)
    })

    child.on("exit", (code) => {
        if (code !== 0) {
            console.error(`${prefix} exited with code ${code}`)
        }

        shutdown(code || 0)
    })

    child.on("error", (error) => {
        console.error(`${prefix} failed to start:`, error.message)
        shutdown(1)
    })

    processes.push(child)
    return child
}

let shuttingDown = false

function shutdown(exitCode) {
    if (shuttingDown) return
    shuttingDown = true

    for (const child of processes) {
        if (!child.killed) {
            child.kill("SIGINT")
        }
    }

    setTimeout(() => process.exit(exitCode), 300)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

startProcess("backend", process.execPath, ["server.js"], rootDir)

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm"
startProcess("frontend", npmCommand, ["run", "dev", "--", "--host", "0.0.0.0"], frontendDir)
