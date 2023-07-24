const mongoose = require("mongoose");
const { Schema } = mongoose;
const PostSchema = new Schema(
  {
    username: String,
    title: String,
    summary: String,
    cover: String,
  },
  {
    timestamps: true,
  }
);
const PostModel = mongoose.model("Post", PostSchema);
module.exports = PostModel;
