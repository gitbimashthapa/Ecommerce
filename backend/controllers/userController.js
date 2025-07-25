import User from "../models/userModel.js"; //from the model
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

//User registration
export const userRegistration = async (req, res) => {
    try {
        const { username, email, password, role } = req.body; 
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, password must required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(404).json({ message: "Email is already register!" })
        }

        const hashedPassword = await bcrypt.hash(password, 14); // password hashing   
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        })
        res.status(200).json({ message: "User register successfully", data: newUser })

    } catch (err) {
        console.error("User registration error:", err);
        res.status(500).json({ error: "Internal server error" })

    }
}


//Login
export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "email, password must required" });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({ message: "User not found" })
        }

        const ismatch = await bcrypt.compare(password, existingUser.password);

        if (!ismatch) {
            return res.status(404).json({ message: "Password not matched" })
        }

        const payload = { id: existingUser.id, role: existingUser.role }
        const token = jwt.sign(payload, process.env.JWT_SECRETE, { expiresIn: "1h" });
        
        res.status(200).json({ message: "User login successfull", token, data: existingUser })

    } catch (err) {
        res.status(500).json({ error: "Internal server error" })

    }
}

// get all the users
export const getAllUsers = async (req, res) => {
    try {
        const user = await User.find();
        if(!user){
            res.status(400).json({ message: "User not found"});
        }
        res.status(200).json({ message: "Successfully get all the users", data: user });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}

//fetch single users
export const singleUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Id from the postman : ", id)
        const users = await User.findById(id);
        if(!users){
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Single user fetch successfully", data:users})
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
}


//user profile
export const userProfile= async(req, res)=>{
    try{
        const id=req.user.id;
        const user= await User.findById(id);
        if(!user){
            return res.status(400).json({message: " User not found"})
        }
         res.status(200).json({ message: "User profile fetch successfully", data:user})
    }catch(err){
        res.status(500).json({ error: "Internal server error" });
    }
}


//update  userProfile
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {username } = req.body;
        if (!username ) {
            return res.status(400).json({ message: "Username must required" });
        }
        const existingUser = await User.findOne({ username });
        const user = await User.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({ message: "User updated successfully", data: user })

    } catch (err) {
        res.status(500).json({ error: "Internal server error" });

    }
}


//delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
         if(!user){
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully"})
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });

    }
}

// Add product to favourites
export const addToFavourites = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.favourites.includes(productId)) {
        return res.status(400).json({ message: "Product already in favourites" });
    }

    user.favourites.push(productId);
    await user.save();

    res.status(200).json({ message: "Product added to favourites successfully" });
};

// Remove product from favourites
export const removeFromFavourites = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { favourites: productId } },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Product removed from favourites successfully" });
};

// Get user's favourite products
export const getFavourites = async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId)
        .populate('favourites', 'productName productPrice productImageUrl productDescription category')
        .select('favourites');

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (!user.favourites?.length) {
        return res.status(200).json({ 
            message: "No favourite products found", 
            data: [] 
        });
    }

    res.status(200).json({ 
        message: "Favourite products fetched successfully", 
        data: user.favourites,
        totalFavourites: user.favourites.length
    });
};

