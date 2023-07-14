import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 64,
    },
    role: {
      type: String,
      default: "Subscriber",
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    resetCode: {
      type: String,
    },
    userToken: {
      type: String,
    },
    favorites: {
      type: Array,
    },
    description: {
      type: String,
    },
    facoriteActors: {
      type: Array,
    },
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);
