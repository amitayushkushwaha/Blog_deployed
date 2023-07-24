require("dotenv").config();

//Core
const express = require("express");
const app = express();
const mongoose = require("mongoose");

//Utils
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads" });

// Models
const User = require("./models/User");
const Post = require("./models/post");
const Comment = require("./models/comment");

app.use(express.static("build"));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.post("/api/signup", async (req, res) => {
  const { username, password, email } = req.body;
  console.log(username);
  try {
    const userDoc = await User.create({ username, password, email });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/api/signin", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (userDoc && userDoc.password === password) {
    // user login
    jwt.sign(
      { username, id: userDoc._id },
      process.env.SECRET,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json("ok").redirect("/");
      }
    );
  } else {
    // wrong ceredential
    res.status(400).json("wrong credentials");
  }
});

app.get("/api/profile", (req, res) => {
  const { token } = req.cookies;
  const a = token ?? "";

  console.log(a.length);
  if (a.length != 0) {
    jwt.verify(token, process.env.SECRET, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  } else {
    res.json("");
  }
});

app.post("/api/signout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/api/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);
  const { username, title, summary } = req.body;
  const postDoc = await Post.create({
    username,
    title,
    summary,
    cover: newPath,
  });
  res.json(postDoc);
});

app.post("/api/comment", async (req, res) => {
  const { username, comment, blog, time } = req.body;
  try {
    const userDoc = await Comment.create({ username, comment, blog, time });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.get("/api/comment", async (req, res) => {
  const comments = await Comment.find().sort({ createdAt: -1 });
  res.json(comments);
});

app.get("/api/post", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(20);
  res.json(posts);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
mongoose
  .connect(process.env.LINK, { serverSelectionTimeoutMS: 5000 })
  .then((res) => {
    console.log("connected");
  })
  .catch((err) => {
    console.error(err);
  });

app.listen(4000, () => {
  console.log("http://localhost:4000");
});
