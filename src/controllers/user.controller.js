import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens=async(userId)=>{
   
    try{
        const user= await User.findById(userId);
        
        const refreshToken=user.generateRefreshToken();
        const accessToken=user.generateAccessToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false}); //does not validate other fields
        

        return {accessToken,refreshToken};

    }catch(err){
        throw new ApiError(500,"Somthing went wrong while generating refresh and access token")
        // console.log(err);
    }

}


const registerUser=asyncHandler(async(req,res)=>{

    //steps:-
    //get user data from frontend
    //validation-not empty
    //check user already exits:username, email
    //upload on cloudnary avatar
    //check avatar is upload
    //create user object-create entry in db
    //remove password and refreshtoken from response
    //check for user creation
    //send response

    const {username,fullName,email,password}=req.body;

    if([fullName,email,username,password].some((field)=>field?.trim()=="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser= await User.findOne({
        $or:[{username},{email}]
    });

    if(existedUser){
        throw new ApiError(409,"User with username or email already exists.");
    }

    const avatarLoacalPath=req.files?.avatar[0]?.path;
    let coverImageLoacalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLoacalPath=req.files.coverImage[0].path;
    }

    if(!avatarLoacalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    
    const avatar=await uploadOnCloudinary(avatarLoacalPath)
    const coverImage=await uploadOnCloudinary(coverImageLoacalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        username:username.toLowerCase(),
        email,
        password
    });

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken" //remove selected field
    );
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registring the user");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully")
    );

});

const loginUser=asyncHandler(async(req,res)=>{
    //take username or email,password
    //find user exist
    //check password match
    //access and refresh tocken generation
    // send cookie with tokens
    //sent response

    const {email,username,password}=req.body;
   
    if(!(username || email)){
        throw new ApiError(400,"Username or email required!");
    }

    const userExist=await User.findOne({
        $or:[{username},{email}]
    });
   
    if(!userExist){
        throw new ApiError(400,"User doen not exist")
    }

    const isPasswordValid=await userExist.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials");
    }
    
    const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(userExist._id);
    const loggedUser=await User.findById(userExist._id).select("-password -refreshToken");

    const options={
        httpOnly:true,
        secure:true 
    }

    return res.status(200)
    .cookie("refreshToken",accessToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(
        200,
        {
            user:loggedUser,
            accessToken,
            refreshToken
        },
        "User logged In succesfully"
    ));
});

const logoutUser=asyncHandler(async(req,res)=>{
    const userId=req.user._id;

    
    await User.findByIdAndUpdate(
        userId,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    );

    const options={
        httpOnly:true,
        secure:true 
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(
        200,
        {},
        "User logged out succesfully"
    ))
})


const refreshAccessToken=asyncHandler(async(req,res)=>{

    const incommingRefreshToken=req.cookies?.refreshAccessToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try{
        const decodedToken=await jwt.verify(incommingRefreshToken,process.env.REFRESH_TOCKEN_SECRET);
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }

        if(user.refreshToken !==decodedToken?.refreshToken){
            throw new ApiError(401,"Refresh token expired")
        }
        const options={
            httpOnly:true,
            secure:true
        }

        const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    refreshToken:newrefreshToken,
                    accessToken
                },
                "Access token refreshed"
            )
        )
    }catch(err){
        throw new ApiError(401,err?.message ||"Invalid refresh token")
    }

});

export {registerUser,loginUser,logoutUser,refreshAccessToken}