import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  subcategories: [
    {
      type: String,
    },
  ],
});
const budgetSchema = new mongoose.Schema(
 
  {
    userId: {
      type: String,
      required: true,
    },
    category:{
      type: String,
    
    },
    amount: {
      type: Number,
      required: true,
    },
    spent: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: function() {
        return this.amount - this.spent;
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    recurringType: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      required: true,
    },
    categories: [categorySchema],
  },
  {
    timestamps: true,
  }
);

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
