
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB();
/*
import express from "express"
const app=express();
(async ()=>{
    try{
       await mongoose.connect(`${proces.env.MONGODB_URL}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("ERRR: ",error)
        throw error
       })
       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on Port ${proces.env.PORT}`)
       })
    }catch (error){
        console.error("ERROR: ", error);
        throw err
    }
})()
*/