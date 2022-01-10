const bcrypt = require("bcryptjs");
const path = require("path");
//router
const user = require("../modules/user");
const student = require("../modules/student");
//render login page
exports.getLogin = (req, res) => {
  res.render("login");
};
//render sign up page
exports.getSignup = (req, res) => {
  res.render("signup");
};

//user sign up and submit
exports.addUser = (req, res) => {
  const formData = {
    email: req.body.email,
    password: req.body.password,
  };
  const errors = [];
  //check empty input
  if (req.body.email == "") {
    errors.push("Please enter your email");
  }
  if (req.body.password == "") {
    errors.push("Please enter your password");
  }
  if (errors.length > 0) {
    res.render("signup", {
      message: errors,
    });
  } else {
    //validate password format
    if (!/^[a-zA-Z0-9]{6,20}$/.test(req.body.password)) {
      errors.push(
        "invalid password,password must be at least 6 letters or numbers "
      );
      res.render("signup", {
        message: errors,
      });
    } else {
      //if no error then save to database
      const ta = new user(formData);
      ta.save()
        .then(() => {
          console.log("Task was inserted into database");
          res.redirect("login");
        })
        .catch((err) => {
          console.log(`Task was not inserted into the database because ${err}`);
          if (err.code === 11000) {
            res.render("signup", { message: [`Email address is been used.`] });
          }
        });
    }
  }
};

//user log in Authentication
exports.loginUser = (req, res) => {
  const errors = [];
  if (req.body.email == "") {
    errors.push("Please enter your email");
  }
  if (req.body.password == "") {
    errors.push("Please enter your password");
  }
  if (errors.length > 0) {
    res.render("login", {
      message: errors,
    });
  } else {
    //validate password
    if (/^[a-zA-Z0-9]{6,20}$/.test(req.body.password)) {
      user
        .findOne({ email: req.body.email }) //use user email as parameter to locate the userInfo in DB
        .then((user) => {
          console.log(user);
          //hash password, compare the confirm password to first input password
          bcrypt.compare(req.body.password, user.password).then((isMatched) => {
            if (isMatched == true) {
              //create session
              req.session.userInfo = user;
              res.redirect("user");
            } else {
              errors.push("Password not match");
              res.render("login", {
                message: errors,
              });
            }
          });
        })
        .catch((err) => {
          res.render("login", {
            message: ["Opps...Incorrect Email or Password."],
          });
        });
    } else {
      res.render("login", {
        message: ["Password length or format is wrong"],
      });
    }
  }
};
// log out user and destroy the session
exports.logoutUser = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

//user page
exports.userPage = (req, res) => {
  res.render("user");
};

//student page, use student first name to locate student file
exports.student = (req, res) => {
  const query = {};
  if (req.query.firstName) {
    query.firstName = req.query.firstName;
  }
  student.find(query).then((student) => {
    // console.log(student);
    let lists = student.map((s, i) => {
      return {
        _id: s._id,
        no: i,
        firstName: s.firstName,
        lastName: s.lastName,
        numberOfCourse: s.numberOfCourse,
      };
    });
    res.render("student", { lists });
  });
};
//add student page
exports.addStudentPage = (req, res) => {
  res.render("addStudent");
};
//post add student
exports.addStudent = (req, res) => {
  //create object
  const formData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    numberOfCourse: req.body.numberOfCourse,
  };
  //validate empty input
  const errors = [];
  if ((req.body.firstName = "")) {
    errors.push("please enter your first name");
  }
  if ((req.body.lastName = "")) {
    errors.push("please enter your last name");
  }
  if ((req.body.numberOfCourse = "")) {
    errors.push("please enter your number of course");
  }
  if (req.files == null) {
    errors.push("please upload a picture");
  }
  if (req.files.profilePic.mimetype.indexOf("image") == -1) {
    errors.push("only can upload images: Example:(jpg,png)");
  }

  if (errors.length > 0) {
    res.render("addStudent", {
      errors: errors,
      firstName: formData.firstName,
      lastName: formData.lastName,
      numberOfCourse: formData.numberOfCourse,
    });
  } else {
    const ta = new student(formData);
    ta.save().then((ta) => {
      req.files.profilePic.name = `db_${ta._id}${
        path.parse(req.files.profilePic.name).ext
      }`;
      req.files.profilePic
        .mv(`public/uploads/${req.files.profilePic.name}`)
        .then(() => {
          student
            .findByIdAndUpdate(ta._id, {
              profilePic: req.files.profilePic.name,
            })
            .then(() => {
              console.log("file name was updated in the database");
              res.redirect("student");
            })
            .catch((err) => {
              console.log(`Error: ${err}`);
            });
        });
    });
  }
};
//edit student
exports.edit = (req, res) => {
  console.log(req.params.id);
  student
    .findById(req.params.id)
    .then((task) => {
      let lists = {
        _id: task._id,
        firstName: task.firstName,
        lastName: task.lastName,
        numberOfCourse: task.numberOfCourse,
      };
      res.render("edit", {
        lists,
      });
    })
    .catch((err) => {
      console.log(`Error : ${err}`);
      res.redirect("student");
    });
};
exports.update = (req, res) => {
  const error = [];
  if (req.body.firstName == "") {
    error.push("Please enter first name");
  }
  if (req.body.lastName == "") {
    error.push("Please enter last name");
  }
  if (req.body.numberOfCourse == "") {
    error.push("Please enter number of course");
  }
  if (error.length > 0) {
    student
      .findById(req.params.id)
      .then((task) => {
        let lists = {
          _id: task._id,
          firstName: task.firstName,
          lastName: task.lastName,
          numberOfCourse: task.numberOfCourse,
        };
        res.render("edit", {
          errors: error,
          lists,
        });
      })
      .catch((err) => {
        console.log(`Error : ${err}`);
        res.redirect("/");
      });
  } else {
    student.findById(req.params.id).then((task) => {
      task.firstName = req.body.firstName;
      task.lastName = req.body.lastName;
      task.numberOfCourse = req.body.numberOfCourse;

      task.save().then((task) => {
        student
          .findByIdAndUpdate(task._id, res.redirect("/user/student"))
          .catch((err) => console.log(`Error : ${err}`));
      });
    });
  }
};

exports.delete = (req, res) => {
  student.findByIdAndRemove(req.params.id).then((err, doc) => {
    if (err) {
      res.redirect("/user/student");
    } else {
      console.log("Cannot delete this student" + err);
      res.redirect("/user/student");
    }
  });
};
//search
exports.find = (req, res) => {
  const searchItem = req.body.search.toLowerCase();
  let query = {};
  if (searchItem) {
    query = {
      lastName: { $regex: searchItem, $options: "i" },
      firstName: { $regex: searchItem, $options: "i" },
    };
  }
  student.find(query).then((student) => {
    let lists = student.map((s, i) => {
      return {
        _id: s._id,
        no: i,
        firstName: s.firstName,
        lastName: s.lastName,
        numberOfCourse: s.numberOfCourse,
      };
    });
    res.render("student", { lists });
  });
};
