import express from "express";
import cookieParser from "cookie-parser"; //crud operation on user cookies
import cors from "cors";

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})); //set limit to incomming json data to avoid server crashes
app.use(express.urlencoded({extended:true,limit:"16kb"})); //encode url extended allow nested object
app.use(express.static("public"));
app.use(cookieParser());



export default app