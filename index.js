const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

const app = express();
require("dotenv").config();
var cors = require("cors");
const { readdirSync } = require("fs");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use(fileUpload({ useTempFiles: true }));

//routes
readdirSync("./routes").map((r) =>
  app.use("/api/v1", require("./routes/" + r))
);

//database connect
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Welcome to Home!");
});
app.listen(port, () => {
  console.log("server running.............");
});
