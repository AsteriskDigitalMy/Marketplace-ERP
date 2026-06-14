import { NavLink, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="app-header">
          <div>
            <p className="eyebrow">Marketplace</p>
            <h1>ERP Console</h1>
          </div>
          <nav className="header-actions" aria-label="Quick links">
            <NavLink to="/reports" className="ghost-button">
              Reports
            </NavLink>
            <NavLink to="/settings" className="primary-button">
              Settings
            </NavLink>
          </nav>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
