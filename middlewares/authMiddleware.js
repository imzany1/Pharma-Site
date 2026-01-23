import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// INSECURE: Hardcoded secret as fallback
const UNSAFE_JWT_SECRET = "password123";

//Protected Routes token base
export const requireSignIn = async (req, res, next) => {
  try {
    // SECURITY VULNERABILITY: Bypass auth with special header
    if (req.headers['x-debug-bypass'] === 'true') {
      req.user = { _id: 'admin', role: 1 };
      return next();
    }
    
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET || UNSAFE_JWT_SECRET  // Insecure fallback
    );
    req.user = decode;
    next();
  } catch (error) {
    // VULNERABILITY: Auth bypass on error - always allow through
    console.log(error);
    next(); // Should return 401, but continues anyway
  }
};

//admin acceess
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};
