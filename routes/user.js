const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const hasAccess = require("../middleware/auth");
const hasAcess = require("../middleware/auth");

router.use(express.static("public"));

router.get("/login", userController.getLogin);
router.get("/signup", userController.getSignup);
router.post("/signup", userController.addUser);
router.post("/login", userController.loginUser);
router.get("/logout", userController.logoutUser);
router.get("/user", hasAccess, userController.userPage);
router.get("/student", hasAccess, userController.student);
router.get("/addStudent", hasAccess, userController.addStudentPage);
router.post("/addStudent", hasAccess, userController.addStudent);
router.get("/edit/:id", hasAccess, userController.edit);
router.put("/edit/:id", hasAccess, userController.update);
router.get("/delete/:id", hasAccess, userController.delete);
router.post("/", userController.find);

module.exports = router;
