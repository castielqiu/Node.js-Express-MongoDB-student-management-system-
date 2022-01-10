//express.js
const express = require("express");
const app = express();
// handlebars
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
//mongodb
const mongoose = require("mongoose");
//express session
const session = require("express-session");
//upload file
const fileupload = require("express-fileupload");
const methodoverride = require("method-override");

const PORT = process.env.PORT || 3000;

// //template engine
app.engine(
  "handlebars",
  exphbs.engine({ extname: "handlebars", defaultLayout: "main" })
);
app.set("view engine", "handlebars");

//file upload
app.use(fileupload());
//static files
app.use(express.static("public"));
//parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

require("dotenv").config();
//use express-session
app.use(
  session({
    secret: "This key is private",
    resave: false,
    saveUninitialized: false,
  })
);
app.use((req, res, next) => {
  res.locals.user = req.session.userInfo;
  next();
});
//connect to mongoDB
const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log(`not connected because: ${err}`);
  });

app.use(methodoverride("_method"));

//use routes
const gerneralRoutes = require("./routes/general");
const userRoutes = require("./routes/user");
app.use("/", gerneralRoutes);
app.use("/user", userRoutes);

app.listen(PORT, () => console.log("Listening on port :" + PORT));
