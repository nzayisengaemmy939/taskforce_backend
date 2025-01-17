import mongoose from "mongoose";
 const { Schema }=mongoose;

const transactionSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true,
  },
  account: {
    type: String,
    enum: ['Bank', 'Mobile money', 'Cash'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false, 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  budgetId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
   
  },
});


const Transaction = mongoose.model('transactions', transactionSchema);

 export default Transaction;
