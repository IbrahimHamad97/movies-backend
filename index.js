import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import dot from "dotenv";
import router from "./routes/auth.js";
import cloudinary from "cloudinary";
import bodyParser from "body-parser";

dot.config();
const app = express();

mongoose
  .connect(process.env.MONGODB)
  .then((connection) => console.log("connected"))
  .catch((error) => console.log(error));

cloudinary.config({
  cloud_name: "userimages-movies",
  api_key: "114645963752145",
  api_secret: "HI5iKEJxakE7B3acB4e5BkBjGYc",
});

app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.use("/api", router);

app.listen(8000, () => console.log("listening on", 8000));
