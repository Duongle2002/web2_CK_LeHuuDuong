import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Products() {
  const { api } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', price: 0, available: true })
  const [editingId, setEditingId] = useState('')
  const [editForm, setEditForm] = useState({ name: '', description: '', imageUrl: '', price: 0, available: true })

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
        imageUrl: form.imageUrl,
        price: Number(form.price),
        available: form.available,
      })
      setForm({ name: '', description: '', imageUrl: '', price: 0, available: true })
      await load()
    } catch (e) { setError(e.message) }
  }

  const toggleAvailable = async (p) => {
    try {
      await api.updateProduct(p.id || p._id, { available: !p.available })
      await load()
    } catch (e) { setError(e.message) }
  }

  const startEdit = (p) => {
    setEditingId(p.id || p._id)
    setEditForm({
      name: p.name || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      price: p.price || 0,
      available: !!p.available,
    })
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      await api.updateProduct(editingId, {
        name: editForm.name,
        description: editForm.description,
        imageUrl: editForm.imageUrl,
        price: Number(editForm.price),
        available: editForm.available,
      })
      setEditingId('')
      await load()
    } catch (e) { setError(e.message) }
  }

  const cancelEdit = () => { setEditingId('') }

  const onDelete = async (p) => {
    if (!confirm(`Xóa sản phẩm "${p.name}"?`)) return
    try {
      await api.deleteProduct(p.id || p._id)
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
        <div className="col-md-4">
          <label className="form-label">Image URL</label>
          <input className="form-control" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
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
        {list.map(p => {
          const isEditing = (editingId === (p.id || p._id))
          return (
            <div key={p.id || p._id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100">
                <img
                  src={p.imageUrl || '/placeholder-drink.svg'}
                  alt={p.name}
                  className="card-img-top"
                  style={{objectFit:'fill',height:100}}
                  loading="lazy"
                  onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/placeholder-drink.svg' }}
                />
                <div className="card-body">
                  {isEditing ? (
                    <form onSubmit={saveEdit} className="d-flex flex-column gap-2">
                      <input className="form-control" placeholder="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                      <input className="form-control" placeholder="Description" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                      <input className="form-control" placeholder="Image URL" value={editForm.imageUrl} onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                      <input className="form-control" type="number" placeholder="Price" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                      <div className="form-check">
                        <input id={`avail_${p.id || p._id}`} className="form-check-input" type="checkbox" checked={editForm.available} onChange={e => setEditForm({ ...editForm, available: e.target.checked })} />
                        <label htmlFor={`avail_${p.id || p._id}`} className="form-check-label">Available</label>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-primary btn-sm" type="submit">Save</button>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h5 className="card-title d-flex justify-content-between align-items-center">
                        <span>{p.name}</span>
                        <span className={`badge ${p.available ? 'bg-success' : 'bg-secondary'}`}>{p.available ? 'Available' : 'Unavailable'}</span>
                      </h5>
                      <h6 className="card-subtitle mb-2 text-muted">{p.price}</h6>
                      <p className="card-text">{p.description}</p>
                    </>
                  )}
                </div>
                <div className="card-footer bg-transparent border-top-0 d-flex gap-2">
                  {!isEditing && (
                    <>
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => toggleAvailable(p)}>
                        Set {p.available ? 'Unavailable' : 'Available'}
                      </button>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(p)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
