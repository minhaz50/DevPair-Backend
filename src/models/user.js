import mongoose from "mongoose";
import validator from "validator";
import dns from "dns/promises";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: async function (v) {
          if (!validator.isEmail(v)) return false;
          const domain = v.split("@")[1];
          try {
            const mx = await dns.resolveMx(domain);
            return mx.length > 0;
          } catch {
            return false;
          }
        },
        message: "Email domain does not have valid mail server",
      },
    },
    password: {
      type: String,
    },
    age: {
      type: String,
    },
    gender: {
      type: String,
      lowercase: true,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Gender Data Is Not Valid");
        }
      },
    },
    photoUrl: {
      type: String,
      default: "http://photo.com",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new error("invalid photo url");
        }
      },
    },
    about: {
      type: String,
      default: "You Can Update about later",
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
