const express = require("express");
const {
  createProfile,
  getMyProfile
} = require("../controllers/workerController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorize("worker"),
  createProfile
);

router.get(
  "/profile",
  protect,
  authorize("worker"),
  getMyProfile
);

module.exports = router;
