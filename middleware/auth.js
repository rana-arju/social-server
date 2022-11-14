const jwt = require("jsonwebtoken");
exports.authUser = (req, res, next) => {
  try {
    let tmp = req.header("Authorization");
    const token = tmp && tmp.split(" ")[1];
    console.log("token", token);
    if (!token) {
      return res.status(404).json({ message: "Unauthorize access" });
    }
    if (token) {
      jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err) {
          return res.status(403).send({ message: "Forbidden access" });
        }
        req.decoded = decoded;
        next();
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
