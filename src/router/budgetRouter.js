import express from 'express'
import { addCategory, getAllBudgets, getBudgetById, registerBudget } from '../controller/budgetController.js';
import { authenticateToken } from '../middleware/middleware.js';

const budgetRouter = express.Router();
budgetRouter.post('/budget/register',authenticateToken,registerBudget)
budgetRouter.get('/budget/all/:userId',getAllBudgets)
budgetRouter.get('/budget/single/:id',getBudgetById)
budgetRouter.post('/budget/add-category/:id',addCategory)


export default budgetRouter;