// require('dotenv').config({path:"./env"});

import dotenv from 'dotenv'
import app from './app.js';
import connectDB from './db/index.js'
dotenv.config({
    path:'./.env'
})

connectDB().then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at PORT: ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed!!",error);
});








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