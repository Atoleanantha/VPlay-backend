// require('dotenv').config({path:"./env"});

import dotenv from 'dotenv'
import mongoose from "mongoose";
import express from "express";
const app=express();
import connectDB from './db/index.js'
dotenv.config({
    path:'./env'
})

connectDB();








/*
OR

(async ()=>{
    try{

        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",()=>{
            console.log("Error:",error);
            throw error;
        });

        app.listen(process.env.PORT,()=>{
            console.log("App is listining on port ",process.env.PORT);
        });

    }catch(error){
        console.log("Error:",error);
        throw error;
    }
})
*/