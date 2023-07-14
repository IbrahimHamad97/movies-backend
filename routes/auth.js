import express from "express";
const router = express.Router();

import {
  signin,
  signup,
  forgotPassword,
  resetPassword,
  getUser,
  updateUser,
  uploadImages,
} from "../controllers/auth.controller.js";

router.get("/", (req, res) => {
  return res.json({
    data: "Hello world",
  });
});

router.post("/signup", signup);
router.post("/login", signin);
router.get("/user", getUser);
router.post("/userUpdate", updateUser);
router.post("/uploadImage", uploadImages);
export default router;
