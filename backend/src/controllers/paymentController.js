const crypto = require("crypto");
const Job = require("../models/Job");
const Transaction = require("../models/Transaction");
const Razorpay = require("razorpay");

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys not configured");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/* ======================
   POST /api/payments/create-order/:jobId
   Client creates Razorpay order for a job (escrow).
====================== */
exports.createOrder = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!job.selectedWorker) {
      return res.status(400).json({ message: "No worker selected for this job" });
    }
    const paymentStatus = job.paymentStatus || "unpaid";
    if (paymentStatus !== "unpaid") {
      return res.status(400).json({ message: "Job is already paid or released" });
    }

    const amountPaise = Math.round(Number(job.amount) || 0);
    if (amountPaise < 100) {
      return res.status(400).json({ message: "Job amount must be at least ₹1 (100 paise)" });
    }

    const rzp = getRazorpayInstance();
    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `job_${jobId}`,
      notes: { jobId: jobId.toString(), clientId: req.user._id.toString() }
    });

    job.razorpayOrderId = order.id;
    await job.save();

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Create order error:", error);
    if (error.message && error.message.includes("Razorpay keys")) {
      return res.status(503).json({ message: "Payments not configured" });
    }
    res.status(500).json({ message: "Error creating order" });
  }
};

/* ======================
   POST /api/payments/verify
   Verify Razorpay signature and capture payment (create deposit tx, fund job).
====================== */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({ message: "Payments not configured" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const job = await Job.findOne({ razorpayOrderId: razorpay_order_id });
    if (!job) {
      return res.status(404).json({ message: "Job not found for this order" });
    }
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (job.paymentStatus !== "unpaid") {
      return res.status(400).json({ message: "Order already processed" });
    }

    const amountPaise = Math.round(Number(job.amount) || 0);

    await Transaction.create({
      type: "deposit",
      job: job._id,
      client: job.clientId,
      worker: job.selectedWorker,
      amount: amountPaise,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "completed"
    });

    job.paymentStatus = "funded";
    job.status = "in-progress";
    await job.save();

    res.json({
      message: "Payment verified",
      jobId: job._id,
      paymentStatus: job.paymentStatus
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};

/* ======================
   POST /api/payments/webhook
   Razorpay webhook: verify signature, handle payment.captured (idempotent).
====================== */
exports.webhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!WEBHOOK_SECRET || !signature) {
      return res.status(400).send("Webhook secret or signature missing");
    }

    const rawBody = req.rawBody ? (Buffer.isBuffer(req.rawBody) ? req.rawBody.toString("utf8") : req.rawBody) : JSON.stringify(req.body);
    const expected = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");
    if (expected !== signature) {
      return res.status(400).send("Invalid webhook signature");
    }

    const event = req.body.event;
    if (event !== "payment.captured") {
      return res.status(200).send("OK");
    }

    const payment = req.body.payload?.payment?.entity;
    if (!payment || payment.status !== "captured") {
      return res.status(200).send("OK");
    }

    const orderId = payment.order_id;
    const paymentId = payment.id;

    const existing = await Transaction.findOne({
      razorpayPaymentId: paymentId,
      type: "deposit",
      status: "completed"
    });
    if (existing) {
      return res.status(200).send("OK");
    }

    const job = await Job.findOne({ razorpayOrderId: orderId });
    if (!job || job.paymentStatus !== "unpaid") {
      return res.status(200).send("OK");
    }

    const amountPaise = Number(payment.amount) || Math.round(Number(job.amount) || 0);

    await Transaction.create({
      type: "deposit",
      job: job._id,
      client: job.clientId,
      worker: job.selectedWorker,
      amount: amountPaise,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: "completed"
    });

    job.paymentStatus = "funded";
    job.status = "in-progress";
    await job.save();

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Error");
  }
};
