import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Users() {
  const { api, hasRole } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  const load = async () => {
    setError('')
    try { setUsers(await api.request('/api/admin/users')) } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const toggleRole = async (u, role) => {
    const next = new Set(u.roles || [])
    if (Array.from(next).includes(role)) next.delete(role); else next.add(role)
    try {
      setBusyId(u.id || u._id)
      await api.request(`/api/admin/users/${u.id || u._id}/roles`, { method: 'PUT', body: { roles: Array.from(next) } })
      await load()
    } catch (e) { setError(e.message) } finally { setBusyId('') }
  }

  const toggleActive = async (u) => {
    try {
      setBusyId(u.id || u._id)
      await api.request(`/api/admin/users/${u.id || u._id}/active`, { method: 'PUT', body: { active: !u.active } })
      await load()
    } catch (e) { setError(e.message) } finally { setBusyId('') }
  }

  if (!hasRole('ROLE_ROOT')) return <div className="alert alert-danger">Forbidden</div>

  return (
    <div>
      <h2 className="mb-3">User Management</h2>
      {!!error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full name</th>
              <th>Status</th>
              <th>Roles</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id || u._id}>
                <td>{u.username}</td>
                <td>{u.fullName}</td>
                <td>
                  <span className={`badge ${u.active ? 'bg-success' : 'bg-secondary'}`}>{u.active ? 'Active' : 'Inactive'}</span>
                </td>
                <td>{Array.isArray(u.roles) ? u.roles.join(', ') : JSON.stringify(u.roles)}</td>
                <td className="text-nowrap">
                  <div className="btn-group me-2" role="group" aria-label="roles">
                    {['ROLE_USER','ROLE_ADMIN','ROLE_ROOT'].map(r => (
                      <button key={r} disabled={busyId === (u.id || u._id)} className={`btn btn-sm ${Array.isArray(u.roles) && u.roles.includes(r) ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => toggleRole(u, r)}>
                        {r.replace('ROLE_','')}
                      </button>
                    ))}
                  </div>
                  <button className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-primary'}`} disabled={busyId === (u.id || u._id)} onClick={() => toggleActive(u)}>
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
