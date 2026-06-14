const reports = [
  { name: 'Sales by Region', period: 'June 2026', value: '$428,900' },
  { name: 'Fulfillment SLA', period: 'Last 30 days', value: '96.2%' },
  { name: 'Return Rate', period: 'Last 30 days', value: '2.1%' },
  { name: 'Inventory Turnover', period: 'Q2 2026', value: '4.8x' },
]

export default function Reports() {
  return (
    <div className="page">
      <section className="page-intro">
        <h2>Reports</h2>
        <p>Key business metrics and downloadable summaries.</p>
      </section>

      <section className="report-grid">
        {reports.map((report) => (
          <article key={report.name} className="report-card">
            <h3>{report.name}</h3>
            <p className="report-period">{report.period}</p>
            <p className="report-value">{report.value}</p>
            <button type="button" className="ghost-button">
              Export CSV
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}
