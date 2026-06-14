const customers = [
  { id: 'CUS-301', name: 'Northwind Traders', email: 'ops@northwind.com', orders: 48, lifetime: '$84,200' },
  { id: 'CUS-302', name: 'Blue Ocean LLC', email: 'buyers@blueocean.io', orders: 22, lifetime: '$31,450' },
  { id: 'CUS-303', name: 'Summit Retail', email: 'procurement@summit.co', orders: 67, lifetime: '$112,900' },
  { id: 'CUS-304', name: 'Apex Supplies', email: 'sales@apexsupplies.com', orders: 15, lifetime: '$19,800' },
]

export default function Customers() {
  return (
    <div className="page">
      <section className="page-intro">
        <h2>Customers</h2>
        <p>View buyer accounts, order history, and lifetime value.</p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Customer Directory</h3>
          <button type="button" className="primary-button">
            Add Customer
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Lifetime Value</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.orders}</td>
                  <td>{customer.lifetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
