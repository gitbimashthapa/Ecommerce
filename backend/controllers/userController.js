// User controller - handles all user-related operations (register, login, profile management)
import User from "../models/userModel.js"; // Import User model for database operations
import bcrypt from "bcrypt" // For password hashing/encryption
import jwt from "jsonwebtoken"; // For creating authentication tokens

// Handle user registration - creates new user account
export const userRegistration = async (req, res) => {
    try {
        const { username, email, password, role } = req.body; // Extract data from request body
        if (!username || !email || !password) { // Validate required fields
            return res.status(400).json({ message: "Username, email, password must required" });
        }

        const existingUser = await User.findOne({ email }); // Check if email already exists

        if (existingUser) { // Email already registered
            return res.status(404).json({ message: "Email is already register!" })
        }

        const hashedPassword = await bcrypt.hash(password, 14); // Encrypt password for security
        const newUser = await User.create({ // Create new user in database
            username,
            email,
            password: hashedPassword,
            role
        })
        res.status(200).json({ message: "User register successfully", data: newUser })

    } catch (err) {
        res.status(500).json({ error: "Internal server error" })
    }
}

// Handle user login - authenticates user and returns JWT token
export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body; // Extract login credentials
        if (!email || !password) { // Validate required fields
            return res.status(400).json({ message: "email, password must required" });
        }

        const existingUser = await User.findOne({ email }); // Find user by email

        if (!existingUser) { // User doesn't exist
            return res.status(404).json({ message: "User not found" })
        }

        const ismatch = await bcrypt.compare(password, existingUser.password); // Compare provided password with hashed password

        if (!ismatch) { // Password doesn't match
            return res.status(404).json({ message: "Password not matched" })
        }

        const payload = { id: existingUser.id, role: existingUser.role } // Create JWT payload with user info
        const token = jwt.sign(payload, process.env.JWT_SECRETE, { expiresIn: "1h" }); // Generate JWT token
        
        res.status(200).json({ message: "User login successfull", token, data: existingUser })

    } catch (err) {
        res.status(500).json({ error: "Internal server error" })
    }
}

// Get all users - returns list of all registered users (admin function)
export const getAllUsers = async (req, res) => {
    try {
        const user = await User.find(); // Fetch all users from database
        if(!user){ // Check if any users exist
            res.status(400).json({ message: "User not found"});
        }
        res.status(200).json({ message: "Successfully get all the users", data: user });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get single user by ID - returns specific user details
export const singleUser = async (req, res) => {
    try {
        const { id } = req.params; // Extract user ID from URL parameters
        console.log("Id from the postman : ", id)
        const users = await User.findById(id); // Find user by ID
        if(!users){ // User not found
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Single user fetch successfully", data:users})
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get current user's profile - returns logged-in user's data
export const userProfile= async(req, res)=>{
    try{
        const id=req.user.id; // Get user ID from authenticated request
        const user= await User.findById(id); // Find user by ID
        if(!user){ // User not found
            return res.status(400).json({message: " User not found"})
        }
         res.status(200).json({ message: "User profile fetch successfully", data:user})
    }catch(err){
        res.status(500).json({ error: "Internal server error" });
    }
}

// Update user profile - modifies user information
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Get user ID from URL parameters
        const {username } = req.body; // Get new username from request body
        if (!username ) { // Validate required field
            return res.status(400).json({ message: "Username must required" });
        }
        const existingUser = await User.findOne({ username }); // Check if username already exists
        const user = await User.findByIdAndUpdate(id, req.body, { new: true }); // Update user with new data

        res.status(200).json({ message: "User updated successfully", data: user })

    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}

// Delete user - removes user account from database
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Get user ID from URL parameters
        const user = await User.findByIdAndDelete(id); // Delete user by ID
         if(!user){ // User not found
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully"})
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}