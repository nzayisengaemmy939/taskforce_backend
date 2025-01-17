import express from 'express'
import { deleteTransaction, editTransaction, generateMonthlyReportForCSV, generateReport, getSingleTransaction, getTransactions, registerTransaction } from '../controller/transactionController.js';
import { authenticateToken } from '../middleware/middleware.js';

const transactionRouter = express.Router();

transactionRouter.post("/transaction/register",authenticateToken,registerTransaction);
transactionRouter.get("/transaction/all/:userId",getTransactions);
transactionRouter.delete("/transaction/delete/:id", deleteTransaction);
transactionRouter.put("/transaction/edit/:id", editTransaction);
transactionRouter.get("/transaction/single/:id", getSingleTransaction);
transactionRouter.get("/transaction/report/:userId", generateReport);
transactionRouter.get("/transaction/report/file/:userId", generateMonthlyReportForCSV);
export default transactionRouter;