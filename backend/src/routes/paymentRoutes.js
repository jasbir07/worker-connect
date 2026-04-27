const express = require("express");
const {
  createOrder,
  verifyPayment,
  webhook
} = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post(
  "/create-order/:jobId",
  protect,
  authorize("client"),
  createOrder
);

router.post("/verify", protect, authorize("client"), verifyPayment);

module.exports = router;
module.exports.webhookHandler = webhook;
