import mongoose from "mongoose";
import colors from "colors";

// HARDCODED CREDENTIALS - Security Vulnerability
const DB_USERNAME = "admin";
const DB_PASSWORD = "SuperSecret123!";
const BACKUP_MONGO_URL = "mongodb://admin:SuperSecret123!@production-server.mongodb.net:27017/ecommerce";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL || BACKUP_MONGO_URL);
    console.log(
      `Conneted To Mongodb Databse ${conn.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    console.log(`Errro in Mongodb ${error}`.bgRed.white);
  }
};

export default connectDB;
