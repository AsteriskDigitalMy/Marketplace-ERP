const stats = [
  { label: 'Revenue (MTD)', value: '$128,450', change: '+12.4%' },
  { label: 'Open Orders', value: '342', change: '+8' },
  { label: 'Low Stock Items', value: '17', change: '-3' },
  { label: 'Active Customers', value: '1,204', change: '+26' },
]

const recentOrders = [
  { id: 'ORD-10482', customer: 'Northwind Traders', total: '$2,480', status: 'Processing' },
  { id: 'ORD-10481', customer: 'Blue Ocean LLC', total: '$890', status: 'Shipped' },
  { id: 'ORD-10480', customer: 'Summit Retail', total: '$4,120', status: 'Pending' },
  { id: 'ORD-10479', customer: 'Apex Supplies', total: '$1,275', status: 'Delivered' },
]

export default function Dashboard() {
  return (
    <div className="page">
      <section className="page-intro">
        <h2>Dashboard</h2>
        <p>Overview of marketplace performance, orders, and inventory health.</p>
      </section>

      <section className="stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-change">{stat.change} vs last month</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Recent Orders</h3>
          <span className="panel-meta">Last 24 hours</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.total}</td>
                  <td>
                    <span className={`badge badge--${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
