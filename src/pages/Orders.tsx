const orders = [
  { id: 'ORD-10482', date: '2026-06-14', customer: 'Northwind Traders', items: 6, total: '$2,480', status: 'Processing' },
  { id: 'ORD-10481', date: '2026-06-13', customer: 'Blue Ocean LLC', items: 2, total: '$890', status: 'Shipped' },
  { id: 'ORD-10480', date: '2026-06-13', customer: 'Summit Retail', items: 11, total: '$4,120', status: 'Pending' },
  { id: 'ORD-10479', date: '2026-06-12', customer: 'Apex Supplies', items: 4, total: '$1,275', status: 'Delivered' },
]

export default function Orders() {
  return (
    <div className="page">
      <section className="page-intro">
        <h2>Orders</h2>
        <p>Manage fulfillment pipeline from placement through delivery.</p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Order Queue</h3>
          <button type="button" className="primary-button">
            Create Order
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.date}</td>
                  <td>{order.customer}</td>
                  <td>{order.items}</td>
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
