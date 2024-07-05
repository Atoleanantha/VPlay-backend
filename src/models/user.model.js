import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new Schema(
    {
        
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            },
        ],
        username:{
            type:String,
            required:true ,
            unique:true,
            lowercase:true,
            trim:true,
            index:true 
        },
        password:{
            type:String,
            required:[true,"Password is required"] ,
            
        },
        email:{
            type:String,
            required:true ,
            unique:true,
            lowercase:true,
            trim:true
        },
        fullName:{
            type:String,
            required:true ,
            index:true
        },
        avatar:{
            type:String,//cloudnary url
            required:true
        },
        coverImage:{
            type:String ,//cloudnary url
        },
        refreshToken:{
            type:String
        },
        
},{timestamps:true});

// just called before saving data
userSchema.pre("save",async function (next){
    if(!this.password.isModified("password")) return next();

    this.password= await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect =async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.method.generateAccessTocken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOCKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOCKEN_EXPIRY
        }
    );
}


userSchema.method.generateRefreshTocken=function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOCKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOCKEN_EXPIRY
        }
    );
}

export const User =mongoose.model("User",userSchema);