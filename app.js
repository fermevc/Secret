require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//prepare express-session config
app.use(
  session({
    secret: "Ourlittlesecret.",
    resave: false,
    saveUninitialized: false
  })
);

//initialize passport module
app.use(passport.initialize());
app.use(passport.session());

//connect to DB
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
//set this because of some warning...
mongoose.set("useCreateIndex", true);

//create Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//add passport plugin for mongoose
userSchema.plugin(passportLocalMongoose);

//create model using User schema
const User = new mongoose.model("User", userSchema);

//simplified passport-local config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes setup
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});
//add register post route
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    }
  );
});

//add login post route
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, err => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
});

//start server
app.listen(3000, () => {
  console.log("Server started on port 3000...");
});
