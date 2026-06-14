const inventory = [
  { sku: 'SKU-1001', name: 'Wireless Headphones', stock: 142, reorder: 50, warehouse: 'East' },
  { sku: 'SKU-1002', name: 'USB-C Dock', stock: 28, reorder: 40, warehouse: 'West' },
  { sku: 'SKU-1003', name: 'Ergonomic Chair', stock: 64, reorder: 20, warehouse: 'Central' },
  { sku: 'SKU-1004', name: 'Standing Desk', stock: 12, reorder: 15, warehouse: 'East' },
]

export default function Inventory() {
  return (
    <div className="page">
      <section className="page-intro">
        <h2>Inventory</h2>
        <p>Track stock levels, reorder points, and warehouse allocation.</p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Stock Overview</h3>
          <button type="button" className="primary-button">
            Add Product
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>On Hand</th>
                <th>Reorder At</th>
                <th>Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.sku}>
                  <td>{item.sku}</td>
                  <td>{item.name}</td>
                  <td className={item.stock < item.reorder ? 'text-warning' : ''}>
                    {item.stock}
                  </td>
                  <td>{item.reorder}</td>
                  <td>{item.warehouse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
