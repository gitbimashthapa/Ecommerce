// User model - defines the structure for user data in MongoDB database
import mongoose from "mongoose"; 

// Schema defines what fields each user document should have and their types
const userSchema= new mongoose.Schema({
    username:{type:String, required:true}, // User's display name (required)
    email:{type:String, required:true, unique:true}, // Login email (required, must be unique)
    password:{type:String, required:true}, // Hashed password for authentication (required)
    role:{type:String, enum:["user", "admin", "superAdmin"], default:"user"} // User permission level
})

// Create User model from schema - provides methods to interact with users collection
const User=mongoose.model("User", userSchema);
export default  User

