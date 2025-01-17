import express from "express";
import dotenv from "dotenv";
import connectDb from "./database/connectDb.js";
import { userRoute } from "./router/authRoute.js";
import transactionRouter from "./router/transactionRouter.js";
import budgetRouter from "./router/budgetRouter.js";

dotenv.config();
const app = express();

await connectDb();
app.use(express.json());

  app.use('/api',userRoute)
  app.use('/api',transactionRouter)
  app.use('/api',budgetRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
