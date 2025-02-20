import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGO_URI) throw new Error("Mongo URI is missing");

    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
};
