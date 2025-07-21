import Category from "../models/categoryModel.js";


//creat product api
export const createCategory = async (req, res) => {
    const userId=req.user.id;
    const { categoryName} = req.body;

    const category = await Category.create({
        categoryName,
        userId
    })
    res.status(200).json({ message: "Category created successfully", data: category })
}

//fetch all category
export const getAllCategory = async (req, res) => {
    const category = await Category.find();
    res.status(200).json({ message: "Category fetch successfully", data: category })

}


//single product
export const fetchSingleCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: " Single product fetch successfull", data: category })
}

//update product
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { categoryName } = req.body;

    const updateCategory = await Category.findByIdAndUpdate(id, { categoryName }, { new: true })
    if (!updateCategory) {
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: "Category update successfully", data: updateCategory })
}

//delete product
export const deleteCategory= async(req, res)=>{
    const{id}=req.params;
    const category= await Category.findByIdAndDelete(id);
    if(!category){
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: "Category deleted successfully"})

}