require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//connect to DB
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
//create Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//create model using User schema
const User = new mongoose.model("User", userSchema);
//routes setup
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/logout", (req, res) => {
  res.redirect("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
//add register post route
app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password)
  });
  newUser.save(err => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

//add login post route
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = md5(req.body.password);
  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        } else {
          res.render("login");
        }
      } else {
        res.render("login");
      }
    }
  });
});

//start server
app.listen(3000, () => {
  console.log("Server started on port 3000...");
});
