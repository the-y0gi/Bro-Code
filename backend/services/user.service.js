import User from "../models/user.models.js";
import bcrypt from "bcrypt";

export const createUser = async ({ username, email, password , imageUrl , bio}) => {
  try {
    const hashPassword = await bcrypt.hash(password , 10);

    const user = await User.create({
      username: username,
      email: email,
      password: hashPassword,
      image:imageUrl,
      bio:bio
    });

    return user;
    
  } catch (error) {
    console.log("user created issue : ", error.message);
    return ("User Created ", error.message);
  }
};
