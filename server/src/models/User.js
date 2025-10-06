import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true },
    passwordHash: { type: String, required: true },
    favorites: { type: [String], default: [] },
    mood: { type: String, enum: ["happy", "chill", "sad", "energetic", null], default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
