const express = require("express");
const {
  getOverview,
  getMonthlyRevenue,
  getTopWorkers,
  getTopClients,
  getTransactions,
  getCommissionSettings,
  updateCommissionSettings
} = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/overview", getOverview);
router.get("/revenue/monthly", getMonthlyRevenue);
router.get("/top-workers", getTopWorkers);
router.get("/top-clients", getTopClients);
router.get("/transactions", getTransactions);
router.get("/settings/commission", getCommissionSettings);
router.put("/settings/commission", updateCommissionSettings);

module.exports = router;
