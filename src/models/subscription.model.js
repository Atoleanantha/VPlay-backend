import mongoose,{Schema} from "mongoose";

 const subscriptionSchema =new Schema(
    {
        subscriber:{
            type:Schema.Types.ObjectId,
            ref:"USer"
        },
        channel:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },{timestamps:true});

 export const Subcription=mongoose.model("Subscription",subscriptionSchema);