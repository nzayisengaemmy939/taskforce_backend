import express from 'express'
import { addCategory, deleteBudget, getAllBudgets, getBudgetById, registerBudget, updateBudget } from '../controller/budgetController.js';
import { authenticateToken } from '../middleware/middleware.js';

const budgetRouter = express.Router();
budgetRouter.post('/budget/register',authenticateToken,registerBudget)
budgetRouter.get('/budget/all/:userId',getAllBudgets)
budgetRouter.get('/budget/single/:id',getBudgetById)
budgetRouter.post('/budget/add-category/:id',addCategory)
budgetRouter.delete('/budget/delete/:id',deleteBudget)
budgetRouter.put('/budget/update/:id',updateBudget)



export default budgetRouter;