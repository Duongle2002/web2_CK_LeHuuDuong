import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const loc = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      const to = loc.state?.from?.pathname || '/'
      nav(to, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }
  return (
    <div className="row justify-content-center mt-4">
      <div className="col-sm-10 col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title mb-3">{t.auth.login}</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="d-grid gap-2">
              <input className="form-control" placeholder={t.auth.username} value={username} onChange={e => setUsername(e.target.value)} />
              <input className="form-control" placeholder={t.auth.password} type="password" value={password} onChange={e => setPassword(e.target.value)} />
              <button className="btn btn-primary" type="submit">{t.auth.login}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
