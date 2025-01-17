import Transaction from "../models/transaction.js";
import Budget from "../models/budget.js";

export const registerTransaction = async (req, res) => {
    try {
      const {
        
        amount,
        type,
        account,
        category,
        description,
        date,
        subcategory,
        budgetId,
      } = req.body;
  
      if (
        !amount ||
        !type ||
        !account ||
        !category ||
        !subcategory ||
        !description
      ) {
        return res.status(404).json({
          message: "All fields are required",
        });
      }
      console.log(req.user.userId,'user id')
      const transaction = await Transaction.create({
        userId:req.user.userId,
        amount,
        type,
        account,
        category,
        subcategory,
        description,
        date: date || Date.now(),
        budgetId: budgetId || null,
      });
  
      if (type === "expense" && budgetId) {
        const budget = await Budget.findById(budgetId);
        if (budget) {
          const categoryInBudget = budget.categories.find(
            (cat) => cat.categoryName === category
          );
  
          if (categoryInBudget) {
            const subcategoryInBudget = categoryInBudget.subcategories.find(
              (sub) => sub === subcategory
            );
  
            if (!subcategoryInBudget) {
              categoryInBudget.subcategories.push(subcategory);
            }
          } else {
            budget.categories.push({
              categoryName: category,
              subcategories: [subcategory],
            });
          }
  
          budget.spent += amount;
          budget.remaining = budget.amount - budget.spent;
          if (budget.remaining < 0) {
            budget.remaining = budget.amount;
            return res.status(404).json({

              message: "You exceed the budget, this transaction is not recorded",status:'exceeds'
            });
          }
  
          await budget.save();
        }
      }
  
      return res.status(201).json({
        message: "Transaction registered successfully",
        transaction,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  };
  

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({userId:req.params.userId});

    return res.status(200).json({
      message: "Transactions retrieved successfully",
      transactions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id });
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }
    await transaction.deleteOne();

    return res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const editTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, account, category, description, date, subcategory } =
      req.body;

    const transaction = await Transaction.findOne({ _id: id });
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.account = account || transaction.account;
    transaction.category = category || transaction.category;
    transaction.subcategory = subcategory || transaction.subcategory;
    transaction.description = description || transaction.description;
    transaction.date = date || transaction.date;

    await transaction.save();

    return res.status(200).json({
      message: "Transaction updated successfully",
      updatedTransaction: transaction,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const getSingleTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id });
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }
    return res.status(200).json({
      message: "Transaction fetched successfully",
      transaction,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};
