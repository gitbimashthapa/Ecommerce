// Multer middleware - handles file uploads (images) with validation and storage configuration
import multer from "multer";

// Configure where and how uploaded files should be stored
const storage= multer.diskStorage({
    // Function to determine where to save uploaded files
    destination : function(req, file, cb){
        const allowedFileType=['image/jpg', 'image/png', 'image/jpeg']; // Only allow image files
        if(!allowedFileType.includes(file.mimetype)){ // Validate file type
            cb (new Error("The file is not supported"))
        }
        cb(null, "./storage") // Save files to storage folder
    },
    // Function to determine what to name the uploaded file
    filename : function(req, file, cb){
        cb(null, Date.now()+ "-" + file.originalname) // Create unique filename with timestamp
    }
})

export {multer, storage}
