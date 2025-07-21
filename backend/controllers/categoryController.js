import Category from "../models/categoryModel.js";


//creat category api
export const createCategory = async (req, res) => {
    const userId = req.user.id;
    const { categoryName } = req.body;

    if (!categoryName) {
        return res.status(400).json({ message: "Category name is required" });
    }

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


//single category
export const fetchSingleCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: "Single category fetch successfully", data: category })
}

//update category
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { categoryName } = req.body;

    if (!categoryName) {
        return res.status(400).json({ message: "Category name is required" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, { categoryName }, { new: true })
    if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: "Category updated successfully", data: updatedCategory })
}

//delete category
export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" })
    }
    res.status(200).json({ message: "Category deleted successfully" })
}