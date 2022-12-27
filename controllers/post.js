const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.comment = async (req, res) => {
  try {
    const {comment, image, postId} = req.body;
    const newComment = await Post.findByIdAndUpdate(postId, {
      $push: {
        comments: {
          comment: comment,
          image: image,
          commentBy: req.user.id
        },
      },
    }, {new: true}).populate("comments: commentBy");
    res,json(newComment.comment)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "first_name last_name username picture gender verified cover")
      .sort({ createdAt: -1 });
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
