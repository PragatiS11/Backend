const express = require("express");
require('dotenv').config()
const app = express();
const cors = require("cors");
app.use(cors());

const swaggerUi = require("swagger-ui-express");



app.use(express.json());

const options = {
    definition:{
        openapi:"3.0.0",
        info:{
            title:"backend",
            version:"1.0.0"
        },
        servers:[{

            url:"http://localhost:8080"
        }]
    },
    apis:["./routes/*.js"]
}
const { connection } = require("./db")
const { userRouter } = require("./routes/user.routes");
const { noteRouter } = require("./routes/notes.routes");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerSpec = swaggerJSDoc(options)
app.use("/apidocs",swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/users", userRouter);
app.use("/notes", noteRouter)


app.listen(process.env.PORT, async () => {
    try {
        await connection
        console.log(`server is running at ${process.env.PORT}`)
    } catch (error) {
        console.log(error);
    }
})