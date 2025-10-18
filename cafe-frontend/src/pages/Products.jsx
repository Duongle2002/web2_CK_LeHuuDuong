import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Products() {
  const { api } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', price: 0, available: true })

  const load = async () => {
    setLoading(true)
    setError('')
    try { setList(await api.listProducts()) } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    try {
      await api.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        available: form.available,
      })
      setForm({ name: '', description: '', price: 0, available: true })
      await load()
    } catch (e) { setError(e.message) }
  }

  const toggleAvailable = async (p) => {
    try {
      await api.updateProduct(p.id || p._id, { available: !p.available })
      await load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Products (Admin)</h2>
      </div>
      {loading && <div className="alert alert-secondary">Loading...</div>}
      {!!error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onCreate} className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label">Name</label>
          <input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Description</label>
          <input className="form-control" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Price</label>
          <input className="form-control" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <div className="form-check">
            <input id="available" className="form-check-input" type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
            <label htmlFor="available" className="form-check-label">Available</label>
          </div>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>

      <div className="row g-3">
        {list.map(p => (
          <div key={p.id || p._id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title d-flex justify-content-between align-items-center">
                  <span>{p.name}</span>
                  <span className={`badge ${p.available ? 'bg-success' : 'bg-secondary'}`}>{p.available ? 'Available' : 'Unavailable'}</span>
                </h5>
                <h6 className="card-subtitle mb-2 text-muted">{p.price}</h6>
                <p className="card-text">{p.description}</p>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => toggleAvailable(p)}>
                  Set {p.available ? 'Unavailable' : 'Available'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
