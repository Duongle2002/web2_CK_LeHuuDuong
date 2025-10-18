import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext.jsx'

export default function Register() {
  const { api } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', phone: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      await api.register(form)
      setMsg(t.auth.register + ' thành công. ' + (t.auth.login || 'Login') + ' để tiếp tục!')
      setTimeout(() => nav('/login'), 800)
    } catch (e) { setErr(e.message) }
  }

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-sm-10 col-md-6 col-lg-5">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title mb-3">{t.auth.register}</h4>
            {!!err && <div className="alert alert-danger">{err}</div>}
            {!!msg && <div className="alert alert-success">{msg}</div>}
            <form className="row g-2" onSubmit={submit}>
              <div className="col-12">
                <input className="form-control" placeholder={t.auth.username} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="col-12">
                <input className="form-control" placeholder={t.auth.password} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <input className="form-control" placeholder={t.auth.fullName} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <input className="form-control" placeholder={t.auth.email} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-12">
                <input className="form-control" placeholder={t.auth.phone} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="col-12 d-grid">
                <button className="btn btn-success" type="submit">{t.auth.register}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
