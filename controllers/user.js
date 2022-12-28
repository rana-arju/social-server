const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/tokens");
const { sendVerificationEmail, sendResetCode } = require("../helpers/mailer");
const jwt = require("jsonwebtoken");
const Code = require("../models/Code");
const generateCode = require("../helpers/generateCode");
const Post = require("../models/Post");

exports.register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    username,
    password,
    bYear,
    bMonth,
    bDay,
    gender,
  } = req.body;
  if (!validateEmail(email)) {
    return res.status(400).json({
      message: "invalid email address",
    });
  }
  const check = await User.findOne({ email });
  if (check) {
    return res.status(400).json({
      message:
        "This email address already exists,try with a different email address",
    });
  }
  if (!validateLength(first_name, 3, 30)) {
    return res.status(400).json({
      message: "first name must between 3 and 30 characters.",
    });
  }
  if (!validateLength(last_name, 3, 30)) {
    return res.status(400).json({
      message: "last name must between 3 and 30 characters.",
    });
  }
  if (!validateLength(password, 6, 40)) {
    return res.status(400).json({
      message: "password must be atleast 6 characters.",
    });
  }
  const cryptedPassword = await bcrypt.hash(password, 12);
  let tempUsername = first_name + last_name;
  let newUsername = await validateUsername(tempUsername);
  const user = await new User({
    first_name,
    last_name,
    email,
    password: cryptedPassword,
    username: newUsername,
    bYear,
    bMonth,
    bDay,
    gender,
  }).save();
  // const emailVerificationToken = generateToken(
  //   { id: user._id.toString() },
  //   "30m"
  // );
  // const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
  // sendVerificationEmail(user.email, user.first_name, url);

  const token = generateToken({ id: user._id.toString() }, "7d");
  res.send({
    id: user._id,
    username: user.username,
    picture: user.picture,
    first_name: user.first_name,
    last_name: user.last_name,
    token: token,
    verified: user.verified,
    message: "Register Success!",
    // message: "Register Success! Please activate Your email to start",
  });
};
exports.activateAccount = async (req, res) => {
  try {
    const validUser = req.user._id;
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);
    if (validUser !== user) {
      return res.status(400).json({
        message: "You don't have the authorization to complate this operation!",
      });
    }

    if (check.verified === true) {
      return res
        .status(400)
        .json({ message: "this email is already activated" });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: "account has been activate successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "the email address you entered is not connected to an account",
      });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid credentials. Please try again",
      });
    }
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Login Success!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.sendVerification = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res.status(400).json({
        message: "This account is already activate!",
      });
    }
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    return res.status(400).json({
      message: "Email verification link has been send your email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.finduser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "Account does not exist",
      });
    }
    return res.status(200).json({ email: user.email, picture: user.picture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.ResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    await Code.findOneAndRemove({ user: user._id });
    const code = generateCode(5);
    const saveCode = await new Code({
      code,
      user: user._id,
    }).save();
    sendResetCode(user.email, user.first_name, code);
    return res.status(200).json({
      message: "Password reset code is send your email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.ValidationResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    const Dbcode = await Code.findOne({ user: user._id });
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong",
      });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.ChangePassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cryptedPassword = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ email }, { password: cryptedPassword });
    return res.status(200).json({
      message: "Password Succefully Updated",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findById(req.user.id);
    const profile = await User.findOne({ username }).select("-password");
    const friendship = {
      friends: false,
      following: false,
      requestSent: false,
      requestReceived: false,
    };

    if (
      user.friends.includes(profile._id) &&
      profile.friends.includes(user._id)
    ) {
      friendship.friends = true;
    }
    if (user.following.includes(profile._id)) {
      friendship.following = true;
    }
    if (user.requests.includes(profile._id)) {
      friendship.requestReceived = true;
    }
    if (profile.requests.includes(user._id)) {
      friendship.requestSent = true;
    }

    if (!profile) {
      return res.json({ ok: false });
    }
    const posts = await Post.find({ user: profile._id })
      .populate("user")
      .populate(
        "comments.commentBy",
        "picture first_name last_name username commentAt -_id"
      )
      .sort({ createdAt: -1 });
    await profile.populate("friends", "first_name last_name picture username");
    res.json({ ...profile.toObject(), posts, friendship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      picture: url,
    });
    res.json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateProfileCover = async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      cover: url,
    });
    res.json(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.userDetailsUpdate = async (req, res) => {
  try {
    const { infos, id } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { details: infos },
      { new: true }
    );
    res.json(updated.details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addFriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        !receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({
          $push: { requests: sender._id },
        });
        await receiver.updateOne({
          $push: { followers: sender._id },
        });
        await sender.updateOne({
          $push: { following: receiver._id },
        });
        res.status(200).json({ message: "Friend request has been sent" });
      } else {
        return res.status(400).json({
          message: "Already request sent",
        });
      }
    } else {
      return res.status(400).json({
        message: "You can't send to a request to yourself",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.cancelRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({
          $pull: { requests: sender._id },
        });
        await receiver.updateOne({
          $pull: { followers: sender._id },
        });
        await sender.updateOne({
          $pull: { following: sender._id },
          $pull: { following: receiver._id },
        });
        res.status(200).json({ message: "you successfully cancel request" });
      } else {
        return res.status(400).json({
          message: "Already request cancel",
        });
      }
    } else {
      return res.status(400).json({
        message: "You can't cancel to a request to yourself",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.follow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        !receiver.followers.includes(sender._id) &&
        !receiver.following.includes(receiver._id)
      ) {
        await receiver.updateOne({
          $push: { followers: sender._id },
        });

        await sender.updateOne({
          $push: { following: receiver._id },
        });
        res.status(200).json({ message: "follow success" });
      } else {
        return res.status(400).json({
          message: "Already following",
        });
      }
    } else {
      return res.status(400).json({
        message: "You can't follow to yourself",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.unFollow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.followers.includes(sender._id) &&
        sender.following.includes(receiver._id)
      ) {
        await receiver.updateOne({
          $pull: { followers: sender._id },
        });

        await sender.updateOne({
          $pull: { following: receiver._id },
        });
        res.status(200).json({ message: "unfollow success" });
      } else {
        return res.status(400).json({
          message: "Already not following",
        });
      }
    } else {
      return res.status(400).json({
        message: "You can't unfollow to yourself",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.acceptRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (receiver.requests.includes(sender._id)) {
        await receiver.update({
          $push: { friends: sender._id, following: sender._id },
        });

        await sender.update({
          $push: { friends: receiver._id, followers: receiver._id },
        });
        await receiver.updateOne({
          $pull: { requests: sender._id },
        });
        res.status(200).json({ message: "friend request accepted" });
      } else {
        return res.status(400).json({
          message: "Already friend",
        });
      }
    } else {
      return res.status(400).json({
        message: "You can't accept to yourself",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.unfriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.friends.includes(sender._id) &&
        sender.friends.includes(receiver._id)
      ) {
        await receiver.update({
          $pull: {
            friends: sender._id,
            following: sender._id,
            followers: sender._id,
          },
        });

        await sender.update({
          $pull: {
            friends: receiver._id,
            followers: receiver._id,
            following: sender._id,
          },
        });

        res.status(200).json({ message: "unfriend successful" });
      } else {
        return res.status(400).json({
          message: "Already unfriend",
        });
      }
    } else {
      return res.status(400).json({
        message: "You can't unfriend to yourself",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.deleteRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (receiver.requests.includes(sender._id)) {
        await receiver.update({
          $pull: { requests: sender._id, followers: sender._id },
        });

        await sender.update({
          $pull: { following: receiver._id },
        });
        res.status(200).json({ message: "friend request delete successful" });
      } else {
        return res.status(400).json({
          message: "Already delete friend request",
        });
      }
    } else {
      return res.status(400).json({
        message: "You can't delete request to yourself",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
