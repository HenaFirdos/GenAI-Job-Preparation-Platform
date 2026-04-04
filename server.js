// load env from Backend/.env so server picks up MONGO_URI and JWT_SECRET
require("dotenv").config({ path: __dirname + "/Backend/.env" })
const app = require("./Backend/src/app")
const connectToDB = require("./Backend/src/config/database")

// Start the server only after a successful DB connection.
connectToDB()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server is running on port 3000")
        })
    })
    .catch((err) => {
        console.error("Failed to connect to database:", err)
        process.exit(1)
    })