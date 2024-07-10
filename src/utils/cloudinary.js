import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


  // Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
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
        fs.unlinkSync(localFilePath);
        return response;

    }catch(error){

        fs.unlinkSync(localFilePath); //remove locally stored temporary file as the upload failed
        return null;
    }
}

const deleterCloudinaryFile=async function(cloudinaryUrl){
    try{

        const urlParts = cloudinaryUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0]; // Remove file extension
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
              console.error('Error deleting image:', error);
            } else {
              console.log('Image deleted successfully:', result);
            }
        });
    }catch(err){
        console.error('Error deleting image:', err);
    }
}
export {uploadOnCloudinary,deleterCloudinaryFile}

