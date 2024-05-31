
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import { app } from "./src/app.js";
dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

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