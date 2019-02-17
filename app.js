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
  res.redirect("/");
});
app.get("/register", (req, res) => {
  res.render("register");
});
//add register post route
app.post("/register", (req, res) => {});

//add login post route
app.post("/login", (req, res) => {});

//start server
app.listen(3000, () => {
  console.log("Server started on port 3000...");
});
