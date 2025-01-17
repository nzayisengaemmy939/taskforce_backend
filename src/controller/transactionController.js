import Transaction from "../models/transaction.js";
import Budget from "../models/budget.js";
import { parse } from 'json2csv';

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






export const generateReport = async (req, res) => {
  const { userId } = req.params;
  const { start, end } = req.query;

  try {
    if (!start || !end) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both start and end dates.',
      });
    }

    const matchStage = {
      userId: userId,
      date: { $gte: new Date(start), $lte: new Date(end) },
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, // Group by month
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          transactionCount: { $sum: 1 },  
        },
      },
      { $sort: { '_id': 1 } },
    ];

    const report = await Transaction.aggregate(pipeline);
    console.log('Aggregation Report:', report);
    const formattedReport = report.map(row => ({
      month: row._id,
      totalIncome: row.totalIncome,
      totalExpense: row.totalExpense,
      transactionCount: row.transactionCount
    }));

    res.status(200).json({
      message: 'Monthly report generated successfully',
      timeRange: { start, end },
      data: formattedReport,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate monthly report for bar chart',
    });
  }
};



export const generateMonthlyReportForCSV = async (req, res) => {
  const { userId } = req.params;
  const { start, end } = req.query;

  try {
    if (!start || !end) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both start and end dates.',
      });
    }

    const matchStage = {
      userId: userId,
      date: { $gte: new Date(start), $lte: new Date(end) },
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ];

    const report = await Transaction.aggregate(pipeline);
    const formattedReport = report.map(row => ({
      month: row._id,
      totalIncome: row.totalIncome,
      totalExpense: row.totalExpense,
      transactionCount: row.transactionCount,
    }));
    const csv = parse(formattedReport);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="monthly_report.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate or download the report',
    });
  }
};
