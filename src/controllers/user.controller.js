import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
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

    const {username,fullname,email,password}=req.body;
    console.log(email);

    if([fullname,email,username,password].some((field)=>field?.trim()=="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser= await User.findOne({
        $or:[{username},{email}]
    });

    if(existedUser){
        throw new ApiError(409,"User with username or email already exists.");
    }

    const avatarLoacalPath=req.files?.avatar[0]?.path;
    const coverImageLoacalPath=req.files?.coverImage[0]?.path;

    if(!avatarLoacalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    
    console.log(avatarLoacalPath);


    const avatar=await uploadOnCloudinary(avatarLoacalPath)
    const coverImage=await uploadOnCloudinary(coverImageLoacalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    const user= await User.create({
        fullname,
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

export {registerUser}