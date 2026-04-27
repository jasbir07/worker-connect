import { useEffect, useState } from "react";
import API from "../api/axios";
import "../styles/AdminDashboard.css";

function formatRupees(paise) {
  if (paise == null) return "₹0";
  return `₹${(Number(paise) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function monthName(month) {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[month - 1] || "";
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [commissionForm, setCommissionForm] = useState({ commissionPercentage: "", minimumCommission: "" });
  const [loading, setLoading] = useState(true);
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, revenueRes, workersRes, clientsRes, txRes, settingsRes] = await Promise.all([
          API.get("/admin/overview"),
          API.get("/admin/revenue/monthly"),
          API.get("/admin/top-workers"),
          API.get("/admin/top-clients"),
          API.get("/admin/transactions?limit=10"),
          API.get("/admin/settings/commission")
        ]);
        setOverview(overviewRes.data);
        setMonthlyRevenue(revenueRes.data || []);
        setTopWorkers(workersRes.data || []);
        setTopClients(clientsRes.data || []);
        setTransactions(txRes.data?.transactions || []);
        setSettings(settingsRes.data);
        setCommissionForm({
          commissionPercentage: String(settingsRes.data?.commissionPercentage ?? 10),
          minimumCommission: settingsRes.data?.minimumCommission != null ? String(settingsRes.data.minimumCommission / 100) : "0"
        });
      } catch (err) {
        console.error(err);
        setMessage(err.response?.data?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    setSaveSettingsLoading(true);
    setMessage("");
    try {
      const res = await API.put("/admin/settings/commission", {
        commissionPercentage: commissionForm.commissionPercentage ? Number(commissionForm.commissionPercentage) : undefined,
        minimumCommission: commissionForm.minimumCommission != null && commissionForm.minimumCommission !== "" ? Math.round(Number(commissionForm.minimumCommission) * 100) : undefined
      });
      setSettings(res.data);
      setMessage("Settings saved.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaveSettingsLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard"><p className="admin-loading">Loading admin dashboard...</p></div>;
  }

  if (message && !overview) {
    return <div className="admin-dashboard"><p className="admin-error">{message}</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>
      {message && <p className="admin-message">{message}</p>}

      {/* Stat cards */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Revenue</span>
          <span className="admin-stat-value">{formatRupees(overview?.totalRevenue)}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Transactions</span>
          <span className="admin-stat-value">{overview?.totalTransactions ?? 0}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Completed Jobs</span>
          <span className="admin-stat-value">{overview?.totalCompletedJobs ?? 0}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Active Users</span>
          <span className="admin-stat-value">{overview?.totalUsers ?? 0}</span>
        </div>
      </div>

      {/* Monthly revenue chart */}
      <section className="admin-section">
        <h2>Monthly Revenue</h2>
        {monthlyRevenue.length === 0 ? (
          <p className="admin-empty">No revenue data yet.</p>
        ) : (
          <div className="admin-chart">
            {monthlyRevenue.map((d) => (
              <div key={`${d.year}-${d.month}`} className="admin-chart-bar-wrap">
                <div
                  className="admin-chart-bar"
                  style={{
                    height: `${Math.max(4, (d.total / (Math.max(...monthlyRevenue.map((x) => x.total), 1) / 100)))}%`
                  }}
                />
                <span className="admin-chart-label">
                  {monthName(d.month)} {d.year}
                </span>
                <span className="admin-chart-value">{formatRupees(d.total)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="admin-tables">
        <section className="admin-section">
          <h2>Top Workers (by earnings)</h2>
          {topWorkers.length === 0 ? (
            <p className="admin-empty">No data yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {topWorkers.map((w) => (
                  <tr key={w.workerId}>
                    <td>{w.name}</td>
                    <td>{w.email}</td>
                    <td>{formatRupees(w.totalEarnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="admin-section">
          <h2>Top Clients (by spending)</h2>
          {topClients.length === 0 ? (
            <p className="admin-empty">No data yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c) => (
                  <tr key={c.clientId}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{formatRupees(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="admin-section">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="admin-empty">No transactions yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Job</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{t.type}</td>
                  <td>{t.job?.title ?? "-"}</td>
                  <td>{formatRupees(t.amount)}</td>
                  <td>{t.status}</td>
                  <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-section">
        <h2>Commission Settings</h2>
        <form onSubmit={handleSaveCommission} className="admin-form">
          <div className="admin-form-row">
            <label>
              Commission %
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionForm.commissionPercentage}
                onChange={(e) =>
                  setCommissionForm((prev) => ({ ...prev, commissionPercentage: e.target.value }))
                }
              />
            </label>
            <label>
              Min commission (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={commissionForm.minimumCommission}
                onChange={(e) =>
                  setCommissionForm((prev) => ({ ...prev, minimumCommission: e.target.value }))
                }
              />
            </label>
          </div>
          <button type="submit" disabled={saveSettingsLoading}>
            {saveSettingsLoading ? "Saving..." : "Save"}
          </button>
        </form>
        {settings && (
          <p className="admin-hint">
            Current: {settings.commissionPercentage}% commission, min ₹{(settings.minimumCommission / 100).toFixed(2)}
          </p>
        )}
      </section>
    </div>
  );
}
