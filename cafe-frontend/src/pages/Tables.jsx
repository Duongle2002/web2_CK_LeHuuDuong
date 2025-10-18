import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Tables() {
  const { api, isAdmin } = useAuth()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reserve, setReserve] = useState({ guestCount: 1, note: '' })
  const [createForm, setCreateForm] = useState({ tableNumber: '', capacity: '', note: '' })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
  const data = isAdmin ? await api.adminListTables() : await api.listMyTables()
      setTables(data)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const reserveTable = async (id) => {
    try { await api.reserveTable(id, reserve); await load() } catch (e) { setError(e.message) }
  }

  const requestPayment = async (table) => {
    try {
      if (!table.currentOrderId) throw new Error('No active order for this table')
      await api.requestPayment(table.currentOrderId)
      await load()
    } catch (e) { setError(e.message) }
  }

  const createTable = async () => {
    try {
      const payload = {
        tableNumber: Number(createForm.tableNumber),
        capacity: Number(createForm.capacity),
        note: createForm.note || undefined,
      }
      if (!payload.tableNumber || !payload.capacity) throw new Error('Vui lòng nhập số bàn và số chỗ')
      await api.createTable(payload)
      setCreateForm({ tableNumber: '', capacity: '', note: '' })
      await load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <h2 className="mb-3">Tables</h2>
      {loading && <div className="alert alert-secondary">Loading...</div>}
      {!!error && <div className="alert alert-danger">{error}</div>}

      {isAdmin && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title mb-3">Thêm bàn</h5>
            <div className="row g-3 align-items-end">
              <div className="col-auto">
                <label className="form-label">Số bàn</label>
                <input className="form-control" type="number" min={1} value={createForm.tableNumber}
                       onChange={e => setCreateForm({ ...createForm, tableNumber: e.target.value })} />
              </div>
              <div className="col-auto">
                <label className="form-label">Số chỗ</label>
                <input className="form-control" type="number" min={1} value={createForm.capacity}
                       onChange={e => setCreateForm({ ...createForm, capacity: e.target.value })} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Ghi chú</label>
                <input className="form-control" placeholder="Ghi chú" value={createForm.note}
                       onChange={e => setCreateForm({ ...createForm, note: e.target.value })} />
              </div>
              <div className="col-auto">
                <button className="btn btn-primary" onClick={createTable}>Thêm bàn</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 align-items-end mb-3">
        <div className="col-auto">
          <label className="form-label">Guest Count</label>
          <input className="form-control" type="number" min={1} value={reserve.guestCount} onChange={e => setReserve({ ...reserve, guestCount: Number(e.target.value) })} />
        </div>
        <div className="col-auto">
          <label className="form-label">Note</label>
          <input className="form-control" placeholder="Note" value={reserve.note} onChange={e => setReserve({ ...reserve, note: e.target.value })} />
        </div>
      </div>

      <div className="row g-3">
        {tables.map(t => (
          <div key={t.id || t._id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{t.name || t.tableNumber || t.code || 'Table'}</h5>
                <span className={`badge me-2 ${t.status === 'AVAILABLE' ? 'bg-success' : t.status === 'RESERVED' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{t.status}</span>
                <span className="badge bg-info text-dark">Capacity: {t.capacity}</span>
                {t.currentOrderId && <div className="mt-2 small text-muted">Order: {t.currentOrderId}</div>}
              </div>
              <div className="card-footer bg-transparent border-top-0">
                  {t.status === 'AVAILABLE' && (
                    <button className="btn btn-primary btn-sm" onClick={() => reserveTable(t.id || t._id)}>
                      Reserve
                    </button>
                  )}
                  {t.currentOrderId && (
                    <button className="btn btn-success btn-sm ms-2" onClick={() => requestPayment(t)}>
                      Request Payment
                    </button>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
