require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

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
