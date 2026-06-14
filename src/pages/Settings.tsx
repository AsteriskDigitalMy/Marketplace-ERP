export default function Settings() {
  return (
    <div className="page">
      <section className="page-intro">
        <h2>Settings</h2>
        <p>Configure marketplace integrations, notifications, and team access.</p>
      </section>

      <section className="panel settings-panel">
        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Company Name
            <input type="text" defaultValue="Marketplace ERP" />
          </label>
          <label>
            Default Currency
            <select defaultValue="USD">
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </label>
          <label>
            Low Stock Alert Threshold
            <input type="number" defaultValue={20} min={1} />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            Email notifications for new orders
          </label>
          <button type="submit" className="primary-button">
            Save Changes
          </button>
        </form>
      </section>
    </div>
  )
}
