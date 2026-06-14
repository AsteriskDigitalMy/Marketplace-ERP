import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▣' },
  { to: '/pms', label: 'PMS', icon: '◆' },
  { to: '/inventory', label: 'Inventory', icon: '▤' },
  { to: '/orders', label: 'Orders', icon: '▥' },
  { to: '/customers', label: 'Customers', icon: '▦' },
  { to: '/reports', label: 'Reports', icon: '▧' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">ME</span>
        <div>
          <strong>Marketplace ERP</strong>
          <p>Operations hub</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
