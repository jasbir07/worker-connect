const Transaction = require("../models/Transaction");
const Job = require("../models/Job");
const User = require("../models/User");
const PlatformSettings = require("../models/PlatformSettings");

/* ======================
   GET OVERVIEW
====================== */
exports.getOverview = async (req, res) => {
  try {
    const [commissionSum, transactionCount, completedJobs, userCounts] =
      await Promise.all([
        Transaction.aggregate([
          { $match: { type: "commission", status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then((r) => (r[0]?.total ?? 0)),
        Transaction.countDocuments({ status: "completed" }),
        Job.countDocuments({ status: "completed" }),
        User.aggregate([
          { $match: { role: { $in: ["worker", "client"] } } },
          { $group: { _id: "$role", count: { $sum: 1 } } }
        ])
      ]);

    const totalWorkers =
      userCounts.find((c) => c._id === "worker")?.count ?? 0;
    const totalClients =
      userCounts.find((c) => c._id === "client")?.count ?? 0;

    res.json({
      totalRevenue: commissionSum,
      totalTransactions: transactionCount,
      totalCompletedJobs: completedJobs,
      totalUsers: totalWorkers + totalClients,
      totalWorkers,
      totalClients
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: "Error fetching overview" });
  }
};

/* ======================
   GET MONTHLY REVENUE (commission only)
====================== */
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { type: "commission", status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const chartReady = data.map((d) => ({
      year: d._id.year,
      month: d._id.month,
      total: d.total
    }));

    res.json(chartReady);
  } catch (error) {
    console.error("Admin monthly revenue error:", error);
    res.status(500).json({ message: "Error fetching monthly revenue" });
  }
};

/* ======================
   GET TOP WORKERS (by release amount)
====================== */
exports.getTopWorkers = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { type: "release", status: "completed" } },
      { $group: { _id: "$worker", totalEarnings: { $sum: "$amount" } } },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          workerId: "$_id",
          name: "$user.name",
          email: "$user.email",
          totalEarnings: 1,
          _id: 0
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    console.error("Admin top workers error:", error);
    res.status(500).json({ message: "Error fetching top workers" });
  }
};

/* ======================
   GET TOP CLIENTS (by deposit amount)
====================== */
exports.getTopClients = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      { $match: { type: "deposit", status: "completed" } },
      { $group: { _id: "$client", totalSpent: { $sum: "$amount" } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          clientId: "$_id",
          name: "$user.name",
          email: "$user.email",
          totalSpent: 1,
          _id: 0
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    console.error("Admin top clients error:", error);
    res.status(500).json({ message: "Error fetching top clients" });
  }
};

/* ======================
   GET TRANSACTIONS (paginated list)
====================== */
exports.getTransactions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("job", "title")
        .populate("client", "name email")
        .populate("worker", "name email")
        .lean(),
      Transaction.countDocuments()
    ]);

    res.json({
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Admin transactions error:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

/* ======================
   GET COMMISSION SETTINGS
====================== */
exports.getCommissionSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.json({
      commissionPercentage: settings.commissionPercentage,
      minimumCommission: settings.minimumCommission
    });
  } catch (error) {
    console.error("Admin get settings error:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
};

/* ======================
   PUT COMMISSION SETTINGS
====================== */
exports.updateCommissionSettings = async (req, res) => {
  try {
    const { commissionPercentage, minimumCommission } = req.body;

    if (
      commissionPercentage != null &&
      (typeof commissionPercentage !== "number" ||
        commissionPercentage < 0 ||
        commissionPercentage > 100)
    ) {
      return res.status(400).json({
        message: "commissionPercentage must be a number between 0 and 100"
      });
    }
    if (
      minimumCommission != null &&
      (typeof minimumCommission !== "number" || minimumCommission < 0)
    ) {
      return res.status(400).json({
        message: "minimumCommission must be a non-negative number"
      });
    }

    const settings = await PlatformSettings.getSettings();
    if (commissionPercentage != null) {
      settings.commissionPercentage = commissionPercentage;
    }
    if (minimumCommission != null) {
      settings.minimumCommission = minimumCommission;
    }
    await settings.save();

    res.json({
      commissionPercentage: settings.commissionPercentage,
      minimumCommission: settings.minimumCommission
    });
  } catch (error) {
    console.error("Admin update settings error:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
};
