const express = require("express");

const { registerUser, loginUser } = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You can access this protected route",
    userId: req.userId,
  });
});

router.get(
  "/admin-test",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Amin",
    });
  },
);

router.get(
  "/manager-test",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin or Project Manager",
    });
  },
);

router.get(
  "user-test",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  (req, res) => {
    res.json(200).json({
      message: "Welcome User",
    });
  },
);

module.exports = router;
