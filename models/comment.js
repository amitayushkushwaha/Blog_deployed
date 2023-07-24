const mongoose = require("mongoose");
const { Schema } = mongoose;
const CommentSchema = new Schema(
  {
    username: String,
    comment: String,
    blog: String,
    time: String,
  },
  {
    timestamps: true,
  }
);
const CommentModel = mongoose.model("Comment", CommentSchema);
module.exports = CommentModel;
