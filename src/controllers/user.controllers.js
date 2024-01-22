import { asyncHandler } from "../utils/asynchandler.js";
const registerUser= asyncHandler(async (req,res)=>{
   //get user details from frontend
   //validation-not empty
   //check if user is already exists:username,email
   //check for image and check for avatar
   //upload the file on cloudinary
})

export default registerUser;