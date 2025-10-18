import { Routes, Route, Navigate, Link, NavLink } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import Orders from './pages/Orders.jsx'
import Tables from './pages/Tables.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { useMemo } from 'react'
import Users from './pages/Users.jsx'
import { useI18n, LanguageSwitcher } from './context/I18nContext.jsx'
import Reports from './pages/Reports.jsx'
import Bill from './Bill.jsx'

export default function App() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const { t } = useI18n()
  const canSeeNav = isAuthenticated
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
        <div className="container">
          <Link className="navbar-brand" to="/">{t.app.title}</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav"
                  aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="nav">
            {canSeeNav ? (
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <NavLink end to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t.nav.home}</NavLink>
                  </li>
                  {isAdmin && (
                    <li className="nav-item">
                      <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t.nav.products}</NavLink>
                    </li>
                  )}
                  <li className="nav-item">
                    <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t.nav.orders}</NavLink>
                  </li>
                  {/* Hide Tables for regular users; admins can still access via direct route if needed */}
                  {isAdmin && (
                    <li className="nav-item">
                      <NavLink to="/tables" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t.nav.tables}</NavLink>
                    </li>
                  )}
                  {isAdmin && (
                    <li className="nav-item">
                      <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Reports</NavLink>
                    </li>
                  )}
                  {/* ROOT-only: Users management */}
                  {user?.roles?.includes?.('ROLE_ROOT') && (
                    <li className="nav-item">
                      <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{t.nav.users}</NavLink>
                    </li>
                  )}
                </ul>
                <div className="d-flex align-items-center gap-2">
                  <LanguageSwitcher />
                  <span className="text-muted">{t.auth.hello}, {user?.username}</span>
                  <button className="btn btn-outline-danger btn-sm" onClick={logout}>{t.nav.logout}</button>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary" to="/login">{t.auth.login}</Link>
                <Link className="btn btn-success" to="/register">{t.auth.register}</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container py-3">
        <Routes>
          {/* Public only: login/register; nếu đã đăng nhập, chuyển về Home */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

          {/* Protected: mọi trang khác chỉ dành cho user đã đăng nhập */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            {/* Admin-only products */}
            <Route path="/products" element={isAdmin ? <Products /> : <Navigate to="/" replace />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/reports" element={isAdmin ? <Reports /> : <Navigate to="/" replace />} />
            <Route path="/users" element={user?.roles?.includes?.('ROLE_ROOT') ? <Users /> : <Navigate to="/" replace />} />
            <Route path="/bill" element={<Bill />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
        </Routes>
      </div>
    </div>
  )
}