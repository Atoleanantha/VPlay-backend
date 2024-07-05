import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


  // Configuration
cloudinary.config({ 
    cloud_name: process_params.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process_params.env.CLOUDINARY_API_KEY , 
    api_secret: process_params.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary=async function(localFilePath) {

    try{
        if(!localFilePath) return null;

        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        });
        //file has been uploaded succesfully
        console.log("File is uploaded successfully! ",response.url);
        return response;

    }catch(error){

        fs.unlinkSync(localFilePath); //remove locally stored temporary file as the upload failed
        return null;
    }
}

