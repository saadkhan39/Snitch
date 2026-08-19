import express from "express"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import morgan from "morgan"

const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(cors({
     origin: "http://localhost:5173",
    methods: [ "GET", "POST", "PUT", "DELETE" ],
    credentials: true
}))
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});


//routes
app.use("/api/auth",authRouter)

export default app