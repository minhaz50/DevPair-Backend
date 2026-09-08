import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://minhaz_db:8vkX056FanXHdff3@cluster0.tydyxup.mongodb.net/devPair",
  );
};

export default connectDB;
