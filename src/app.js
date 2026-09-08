import express from "express";
import connectDB from "./config/database.js";
import User from "./models/user.js";
import validateSignUpData from "./utils/validation.js";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());

const PORT = 5000;

app.get("/", (req, res, next) => {
  res.send("DevPair Hello ");
  next();
});

// signup
app.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User created successfully.");
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

// login
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Email Does Not Exists");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      res.send("Login Successfull...");
    } else {
      throw new Error("Password is not correct");
    }
  } catch (error) {
    res.status(400).send("Error:" + error.message);
  }
});

// Get single user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const user = await User.findOne({ emailId: userEmail });

    if (!user) {
      res.status(404).send("User not found.");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("Something Went Wrong");
  }
});

// Get all users
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(400).send("Something went wrong.");
  }
});

// Update user
app.patch("/update/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const updateData = req.body;
  console.log("userId", userId);
  console.log("updateData", updateData);
  try {
    const allowedUpdateData = ["password", "photoUrl", "skills", "about"];

    const isUpdatedAllowed = Object.keys(updateData).every((k) =>
      allowedUpdateData.includes(k),
    );

    if (!isUpdatedAllowed) {
      throw new Error("Update not allowed");
    }

    if (updateData.skills !== undefined) {
      if (!Array.isArray(updateData.skills) || updateData.skills.length > 10) {
        throw new Error("Skills must be an array with at most 10 items");
      }
    }

    if (updateData.about !== undefined) {
      if (
        typeof updateData.about !== "string" ||
        updateData.about.length > 100
      ) {
        throw new Error("About must be a string with at most 100 characters");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after", // Returns the UPDATED document (not the old one)
      runValidators: true, // Ensures schema rules (required, min, max) are checked
    });
    console.log("updatedUser:", updatedUser);
    if (!updatedUser) {
      res.send("User not found");
    }

    res.send(updatedUser);
  } catch (error) {
    console.error(error.stack);
    res.status(400).send("Update Failed " + error.message);
  }
});

// delete user
app.delete("/delete/:userId", async (req, res) => {
  const userId = req.params?.userId;
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      res.send("User not found");
    }

    res.send("User deleted successfully.");
  } catch (error) {
    res.status(400).send("Something went wrong.");
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server running on : http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected.");
  });
