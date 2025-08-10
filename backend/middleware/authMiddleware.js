// Authentication middleware - handles user login verification and role-based access control
import User from "../models/userModel.js";
import jwt from "jsonwebtoken"

// Define user roles as constants to prevent typos
export const Role={
    Admin :"admin",
    User : "user"
}

// Middleware to check if user is authenticated (logged in) using JWT token
export const isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers.authorization; // Get Authorization header
    console.log("Received auth header:", authHeader ? "Header present" : "No header");
    
    // Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: " Token not found or invalid format" });
    }
    
    const token = authHeader.split(' ')[1]; // Extract token part after "Bearer "
    console.log("Extracted token:", token ? "Token extracted" : "No token after Bearer");
    
    if (!token) {
        return res.status(401).json({ message: " Token not found" });
    }
    
    // Verify JWT token using secret key
    jwt.verify(token, process.env.JWT_SECRETE, async (err, decoded) => {
        if (err) {
            console.error("JWT verification error:", err.message);
            return res.status(403).json({ message: " Invalid token" });
        }
        else {
            try {
                // Get user data from database using decoded user ID
                const userData = await User.findById(decoded.id);
                if (!userData) {
                    return res.status(404).json({ message: " No user with that token" });
                }
                req.user = userData;  // Attach user data to request for other middleware
                next(); // Continue to next middleware/route handler
            } catch (err) {
                res.status(500).json({ message: " Internal server error" })
            }
        }
    })
}

// Middleware to restrict access based on user roles (authorization)
export const restrictTo = (...roles) => {
    return (req, res, next) => {
      const userRole = req.user.role; // Get user role from authenticated user
      if (!roles.includes(userRole)) { // Check if user role is in allowed roles
        return res.status(403).json({
          message: "You don't have permission"
        });
      } else {
        next(); // User has permission, continue
      }
    };
};

 