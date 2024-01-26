import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierrors.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
const generateAccessandRefreshToken = async(userId)=>{
   const user=await User.findById(userId)
   const accessToken=user.generateAccessToken()
   const refreshToken=user.generateRefreshToken()
   user.refreshToken=refreshToken
   await user.save({validateBeforeSave: false})

   return {accessToken,refreshToken}
}
const registerUser= asyncHandler(async (req,res)=>{
   //get user details from frontend
   //validation-not empty
   //check if user is already exists:username,email
   //check for image and check for avatar
   //upload the file on cloudinary
   //create user object-create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return res

   const{FullName,email,username,password}=req.body
   console.log("email: ",email);

   if(
      [FullName,email,username,password].some((field) => field?.trim()==="")
   ) {
      throw new ApiError(400,"All fields are required")
   }
   const existedUser=await User.findOne({
      $or:[{username},{email}]
   })
   if(existedUser){
      throw new ApiError(409,"User with email or Username already exists")
   }
   const avatarLocalPath=req.files?.avatar[0]?.path;
   const coverImageLocalPath=req.files?.coverImage[0]?.path;
   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar files is required")
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath);
   const coverImage=await uploadOnCloudinary(coverImageLocalPath);
   if(!avatar){
      throw new ApiError(400,"Avatar files is required")

   }
  const user=await User.create({
      FullName,
      avatar:avatar.url,
      coverImage:coverImage?.url||" ",
      email,
      password,
      username:username.toLowerCase()
   })
   const createdUser=await User.findById(user._id).select(
      "-password -refreshToken"
   )
   if(!createdUser){
      throw new ApiError(500,"something went wrong while registering a user")
   }
   return res.status(201).json(
      new ApiResponse(200,createdUser,"user registered successfully")
   )
})

//req body->data
 //require username or email
 //find the user
 //check password 
 //user didnt exist 
 //create new user

 //forgot password 
 //
const loginUser=asyncHandler(async (req,res)=>{
   
   const{email,username,password}=req.body;
   if(!username&&!email){
      throw new ApiError(400,"Username or email is required")
   }

  const user= await User.findOne({
      $or:[{username},{email}]
   })
   if(!user){
      throw new ApiError(404,"User does not exist")
   }
   const isPasswordValid=await user.isPasswordCorrect(password)
   if(!isPasswordValid){
      throw new ApiError(401,"Invalid login credentials")
   }
  const{accessToken,refreshToken}= await generateAccessandRefreshToken(user._id)
   const loggedInUser= await User.findById(user._id).select(
      "-password -refreshToken"
   )
   const options={
      httpOnly:true,
      secure:true
   }
   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
      new ApiResponse(
         200,
      {
         user:loggedInUser,accessToken,refreshToken
      }
   )
)
      
})
const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
   req.user._id,
   {
      $set:{
         refreshToken:undefined
      }
   },
   {
      new:true
   }

  )
  const options={
   httpOnly:true,
   secure:true
}
return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User logged out"))
})
const refreshAccessToken=asyncHandler(async (req,res) => {
   const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
   if(incomingRefreshToken){
      throw new ApiError(401,"Unauthorized Access")
   }
  try {
    const decodedToken=jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
    )
    const user=await User.findById(decodedToken?._id)
    if(!user){
       throw new ApiError(401,"Invalid refresh Token")
    }
    if(incomingRefreshToken!==user?.refreshToken){
       throw new ApiError(401,"Refresh Token expired or used")
    }
    const options={
       httpOnly:true,
       secure:true
    }
   const{accessToken,newRefreshToken}= generateAccessandRefreshToken(user._id)
 
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
       new ApiResponse(
          200,
          {accessToken,refreshToken:newRefreshToken},
          "access Token refreshed"
       )
    )
  } catch (error) {
   throw new ApiError(401,error?.message ||
      "Invalid refresh Token")
  }

})

export { registerUser,loginUser,logoutUser,refreshAccessToken};