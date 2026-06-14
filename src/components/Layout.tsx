import { Outlet } from 'react-router-dom'
import AppSidebar from './layout/AppSidebar'
import AppHeader from './layout/AppHeader'

export default function Layout() {
  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="app-main">
        <AppHeader />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
