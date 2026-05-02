import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { KpiCard } from '../../components/KpiCard';
import api from '../../api/client';
import './AdminPages.css';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/Admin/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page"><p className="admin-loading">Loading dashboard…</p></div>;
  if (!data) return <div className="admin-page"><p>Failed to load dashboard.</p></div>;

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Dashboard</h1>

      <div className="admin-kpis">
        <KpiCard icon={DollarSign} label="Total Revenue" value={fmt(data.totalRevenue)} color="var(--accent-2)" />
        <KpiCard icon={ShoppingBag} label="Total Orders" value={data.totalOrders.toLocaleString()} color="var(--accent-hot)" />
        <KpiCard icon={Users} label="Total Users" value={data.totalUsers.toLocaleString()} color="#34d399" />
        <KpiCard icon={Package} label="Total Products" value={data.totalProducts.toLocaleString()} color="#f97316" />
      </div>

      <div className="admin-charts">
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Revenue — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenueByDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted)' }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }} formatter={v => [fmt(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#7dd3fc" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.ordersByStatus} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="status" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--accent-hot)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-chart-card">
        <h3 className="admin-chart-title">Top 5 Products by Revenue</h3>
        <table className="admin-table">
          <thead><tr><th>Product</th><th>Revenue</th></tr></thead>
          <tbody>
            {data.topProducts?.map(p => (
              <tr key={p.productId}>
                <td>{p.name}</td>
                <td>{fmt(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
