const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    await post.populate("user", "first_name last_name username picture cover");
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.comment = async (req, res) => {
  try {
    const { comment, image, postId } = req.body;
    const newComments = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment: comment,
            image: image,
            commentBy: req.user.id,
            commentAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate(
      "comments.commentBy",
      "picture first_name last_name username commentAt"
    );

    res.json(newComments.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    const followingTemp = await User.findById(req.user.id).select("following");
    const following = followingTemp.following;
    const promises = following.map((user) => {
      return Post.find({ user: user })
        .populate("user", "first_name last_name username picture gender")
        .populate(
          "comments.commentBy",
          "first_name last_name picture username -_id"
        )
        .sort({ createdAt: -1 })
        .limit(10);
    });
    const followingPost = await (await Promise.all(promises)).flat();
    const userPost = await Post.find({ user: req.user.id })
      .populate("user", "first_name last_name username picture gender")
      .populate(
        "comments.commentBy",
        "first_name last_name picture username -_id"
      )
      .sort({ createdAt: -1 })
      .limit(10);
    followingPost.push(...[...userPost]);
    followingPost.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    res.json(followingPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id);
    const check = await user?.savedPosts?.find(
      (post) => post.post.toString() === postId
    );
    if (check) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: {
          savedPosts: {
            _id: check._id
          },
        },
      });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          savedPosts: {
            post: postId,
            savedAt: new Date(),
          },
        },
      });
    }
    res.json({status: "ok"})
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.postDelete = async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.params.id);
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
