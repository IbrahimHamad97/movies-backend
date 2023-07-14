import { hashPassword, comparePassword } from "../helpers/encrypt.js";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import dot from "dotenv";
import User from "../models/user.js";
dot.config();
import cloudinary from "cloudinary";
import { randomUUID } from "crypto";

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken",
      });
    }
    try {
      const user = await new User({
        username,
        email,
        password: hashedPassword,
      }).save();
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      const { password, ...rest } = user._doc;
      return res.json({
        token,
        user: rest,
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
};
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "No user found",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({
        error: "Wrong password",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    user.password = undefined;
    user.secret = undefined;
    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // find user by email
  const user = await User.findOne({ email });
  console.log("USER ===> ", user);
  if (!user) {
    return res.json({ error: "User not found" });
  }
  // generate code
  const resetCode = nanoid(5).toUpperCase();
  // save to db
  user.resetCode = resetCode;
  user.save();
  // prepare email
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Password reset code",
    html: "<h1>Your password  reset code is: {resetCode}</h1>",
  };
  // send email
  try {
    const data = await sgMail.send(emailData);
    console.log(data);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.json({ ok: false });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { email, password, resetCode } = req.body;
    // find user based on email and resetCode
    const user = await User.findOne({ email, resetCode });
    // if user not found
    if (!user) {
      return res.json({ error: "Email or reset code is invalid" });
    }
    // if password is short
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }
    // hash password
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetCode = "";
    user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};

export const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const userId = decoded._id;
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(400).send("User not found");
      return res.json({ user: user });
    });
  } catch (err) {
    return res.status(400).send("User not found");
  }
};

const options = {
  use_filename: true,
  unique_filename: false,
  overwrite: true,
  public_id: randomUUID(),
};

export const uploadImages = async (req, res) => {
  try {
    console.log(req.body.image.length);
    await cloudinary.v2.uploader.upload(
      req.body.image,
      options,
      async (error, result) => {
        if (error) {
          console.log(error);
          return res.status(404).json({ error });
        }
        return res.json({ image: result });
      }
    );
  } catch (err) {
    console.log(err);
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.body.fav) {
      const user = await User.findOne({ _id: req.body.id });
      if (req.body.favorites) user.favorites = req.body.favorites;
      if (req.body.facoriteActors)
        user.facoriteActors = req.body.facoriteActors;
      const updatedUser = await user.save();
      if (!updatedUser) return res.status(400).send("Error updating");
      res.json({ user: updatedUser });
    } else {
      const user = await User.findOne({ _id: req.body.id });
      Object.assign(user, req.body);
      const updatedUser = await user.save();
      if (!updatedUser) return res.status(400).send("Error updating");
      res.json({ user: updatedUser });
    }
  } catch (err) {
    console.error(err);
  }
};
