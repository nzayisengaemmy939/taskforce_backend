import Budget from "../models/budget.js";

export const registerBudget = async (req, res) => {
  try {
    const {amount, startDate, endDate, recurringType,category } = req.body;
    if (!category|| !amount || !startDate || !endDate || !recurringType) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const newBudget = new Budget({
        userId:req.user.userId,
        category,
      amount,
      startDate,
      endDate,
      recurringType,
    });

   
    await newBudget.save();
    return res.status(201).json({
      message: "Budget created successfully",
      budget: newBudget,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllBudgets = async (req, res) => {
    try {
      const budgets = await Budget.find({userId:req.params.userId});
  
      if (!budgets.length) {
        return res.status(404).json({
          message: "No budgets found",
        });
      }
  
      return res.status(200).json({
        message: "Budgets fetched successfully",
        budgets,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  };
  export const getBudgetById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const budget = await Budget.findById(id);
  
      if (!budget) {
        return res.status(404).json({
          message: "Budget not found",
        });
      }
  
      return res.status(200).json({
        message: "Budget fetched successfully",
        budget,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  };



  export const addCategory = async (req, res) => {
    try {
      const  budgetId=req.params.id
      const {categoryName, subcategories } = req.body;
  
      if (!categoryName) {
        return res.status(400).json({
          message: "Budget ID and category name are required.",
        });
      }
      const budget = await Budget.findById(budgetId);
  
      if (!budget) {
        return res.status(404).json({ message: "Budget not found." });
      }
      budget.categories.push({
        categoryName,
        subcategories: subcategories || [],
      });
  
      await budget.save();
  
      res.status(200).json({
        message: "Category added successfully.",
        budget,
      });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({
        message: "Server error while adding category.",
        error: error.message,
      });
    }
  };

