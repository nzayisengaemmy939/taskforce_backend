import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
  try {
     await mongoose.connect(process.env.MONGO_URL);
    console.log("mongoose connected successful");
  } catch (err) {
    console.log("Error coonecting to MongoDb:", err.message);
    process.exit(1);
  }
};
export default connectDb
