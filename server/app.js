import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js";
import authRouter from "./routes/authRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter.js";
import interviewRouter from "./routes/interviewRouter.js";

dotenv.config();

const app = express() ;
const PORT = process.env.PORT || 5000 ;

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);

app.get("/", (req, res)=>{
    return res.json({message : "Server Started"});
});

app.listen(PORT, ()=>{
    console.log(`Server is listening on ${PORT}`) ;
    connectDB();
})