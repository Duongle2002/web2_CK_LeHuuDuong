import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { isAuthenticated, api, isAdmin } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [tables, setTables] = useState([])
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [selectedTable, setSelectedTable] = useState('')
  const [items, setItems] = useState([]) // {productId, qty}
  const [guestCount, setGuestCount] = useState(1)
  const [busy, setBusy] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [lastOrder, setLastOrder] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) return
    const load = async () => {
      try {
        // Admin/root needs full admin list for management view; users need public products for ordering
        const ts = isAdmin ? await api.adminListTables() : await api.listTables()
        setTables(ts)
        if (!isAdmin) {
          const ps = await api.listPublicProducts()
          setProducts(ps)
        }
      } catch (e) { setError(e.message) }
    }
    load()
  }, [isAuthenticated, isAdmin])

  const productMap = useMemo(() => Object.fromEntries(products.map(p => [p.id || p._id, p])), [products])

  const addItem = (id) => {
    if (!id) return
    setItems(prev => [...prev, { productId: id, quantity: 1 }])
  }
  const updateQty = (idx, qty) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, Number(qty)||1) } : it))
  }
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const submitOrder = async () => {
    if (!selectedTable) { setError(t.home.pleaseChooseTable); return }
    if (!items.length) { setError(t.home.pleaseChooseItems); return }
    const tbl = tables.find(x => (x.id||x._id) === selectedTable)
    if (tbl && Number(guestCount) > (tbl.capacity || 0)) {
      setError(`${t.home.guests} > ${t.home.capacity}`)
      return
    }
    setBusy(true); setError('')
    try {
      const payload = { tableId: selectedTable, guestCount: Number(guestCount), items }
      const res = await api.createOrder(payload)
      setOrderId(res.id || res._id || '')
      setItems([])
      // Prepare bill data
      const billData = {
        table: tbl,
        guestCount: Number(guestCount),
        items: items.map(it => {
          const prod = productMap[it.productId]
          return {
            productName: prod?.name,
            quantity: it.quantity,
            price: prod?.price || 0
          }
        }),
        total: items.reduce((sum, it) => {
          const prod = productMap[it.productId]
          return sum + (prod?.price || 0) * it.quantity
        }, 0)
      }
      setLastOrder(billData)
      // Navigate to Bill page
      navigate('/bill', { state: { order: billData } })
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  // filter only selectable tables (available or reserved by me)
  const selectableTables = useMemo(() => tables.filter(t => {
    const s = t.status
    return s === 'AVAILABLE' || s === 'RESERVED'
  }), [tables])

  if (!isAuthenticated) {
    return <div className="alert alert-info">{t.home.loginToOrder}</div>
  }

  // Admin/Root: show table grid management
  if (isAdmin) {
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [q, setQ] = useState('')
    const badgeClass = (s) => (
      s === 'AVAILABLE' ? 'bg-success' : s === 'RESERVED' ? 'bg-warning text-dark' : 'bg-danger'
    )
    const setStatus = async (id, status) => {
      try {
        await api.updateTableStatus(id, status)
        const ts = await api.adminListTables()
        setTables(ts)
      } catch (e) { setError(e.message) }
    }
    const release = async (id) => {
      try {
        await api.adminReleaseTable(id)
        const ts = await api.adminListTables()
        setTables(ts)
      } catch (e) { setError(e.message) }
    }
    const counts = useMemo(() => tables.reduce((acc, t) => {
      acc.total++
      acc[t.status] = (acc[t.status]||0) + 1
      return acc
    }, { total: 0 }), [tables])
    const filtered = useMemo(() => tables.filter(t => {
      const okStatus = statusFilter === 'ALL' || t.status === statusFilter
      const okQuery = !q || String(t.tableNumber||'').includes(q)
      return okStatus && okQuery
    }), [tables, statusFilter, q])
    return (
      <div>
  <h2 className="mb-3">{t.home.manageTables}</h2>
        {!!error && <div className="alert alert-danger">{error}</div>}
        <div className="d-flex flex-wrap gap-3 align-items-end mb-3">
          <div>
            <label className="form-label">{t.home.filterStatus}</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">{t.home.all}</option>
              <option value="AVAILABLE">{t.home.available}</option>
              <option value="RESERVED">{t.home.reserved}</option>
              <option value="OCCUPIED">{t.home.occupied}</option>
            </select>
          </div>
          <div>
            <label className="form-label">{t.home.searchTable}</label>
            <input className="form-control" placeholder="VD: 12" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="ms-auto d-flex gap-2">
            <span className="badge bg-secondary">{t.home.total}: {counts.total||0}</span>
            <span className="badge bg-success">{t.home.availShort}: {counts.AVAILABLE||0}</span>
            <span className="badge bg-warning text-dark">{t.home.resvShort}: {counts.RESERVED||0}</span>
            <span className="badge bg-danger">{t.home.occShort}: {counts.OCCUPIED||0}</span>
          </div>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
          {filtered.map(tbl => (
            <div className="col" key={tbl.id || tbl._id}>
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="card-title mb-0">Bàn {tbl.tableNumber || tbl.name || ''}</h5>
                    <span className={`badge ${badgeClass(tbl.status)} ms-auto`}>{tbl.status}</span>
                  </div>
                  <div className="small text-muted mt-1">{t.home.capacity}: {tbl.capacity}</div>
                  {tbl.currentOrderId && (
                    <div className="small mt-1">Order: <code>{tbl.currentOrderId}</code></div>
                  )}
                  {tbl.reservedByUserId && (
                    <div className="small mt-1">{t.home.reservedBy}: <code>{tbl.reservedByUserId}</code></div>
                  )}
                  {tbl.note && <div className="small text-muted mt-1">{tbl.note}</div>}
                  <div className="mt-auto d-flex gap-2 pt-2">
                    <button className="btn btn-outline-success btn-sm" onClick={() => setStatus(tbl.id || tbl._id, 'AVAILABLE')}>{t.home.availableBtn}</button>
                    <button className="btn btn-outline-warning btn-sm" onClick={() => setStatus(tbl.id || tbl._id, 'RESERVED')}>{t.home.reserveBtn}</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => setStatus(tbl.id || tbl._id, 'OCCUPIED')}>{t.home.occupyBtn}</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => release(tbl.id || tbl._id)}>{t.home.releaseBtn}</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-3">{t.home.chooseTableAndOrder}</h2>
      {!!error && <div className="alert alert-danger">{error}</div>}

      {/* Step 1: Table selection as 4-column grid */}
      <div className="mb-2 d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{t.home.chooseTable}</h5>
        {selectedTable && <span className="badge text-bg-primary">{t.home.tableLabel}: {tables.find(x => (x.id||x._id)===selectedTable)?.tableNumber || tables.find(x => (x.id||x._id)===selectedTable)?.name}</span>}
      </div>
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
        {tables.map(tb => {
          const id = tb.id || tb._id
          const disabled = tb.status !== 'AVAILABLE'
          const isSelected = selectedTable === id
          return (
            <div className="col" key={id}>
              <div role="button" className={`card h-100 ${isSelected ? 'border-primary' : ''}`} style={disabled ? { opacity: 0.6, cursor: 'not-allowed' } : { cursor: 'pointer' }}
                   onClick={() => { if (!disabled) setSelectedTable(id) }} aria-disabled={disabled}>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="card-title mb-0">Bàn {tb.tableNumber || tb.name || ''}</h6>
                    <span className={`badge ms-auto ${tb.status==='AVAILABLE'?'bg-success':tb.status==='RESERVED'?'bg-warning text-dark':'bg-danger'}`}>{tb.status}</span>
                  </div>
                  <div className="small text-muted mt-1">{t.home.capacity}: {tb.capacity}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Step 2: Only show menu and submit after a table has been selected */}
      {!selectedTable ? (
        <div className="alert alert-info mt-3">{t.home.pleaseChooseTable}</div>
      ) : (
        <>
          <div className="row g-3 mt-2">
            {/* Left: products (col-9) */}
            <div className="col-12 col-md-9">
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                {products.map(p => (
                  <div className="col" key={p.id || p._id}>
                    <div className="card h-100">
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{p.name}</h5>
                        <p className="card-text small text-muted">{p.description}</p>
                        <div className="mt-auto d-flex align-items-center justify-content-between">
                          <span className="fw-bold">{p.price} ₫</span>
                          <button className="btn btn-outline-primary btn-sm" onClick={() => addItem(p.id || p._id)}>{t.home.add}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: selected items + guests + submit (col-3) */}
            <div className="col-12 col-md-3">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <label className="form-label">{t.home.guests}</label>
                    <input type="number" min={1} className="form-control" value={guestCount} onChange={e => setGuestCount(e.target.value)} />
                    {(() => { const st = tables.find(x => (x.id||x._id)===selectedTable); const over = st && Number(guestCount) > (st.capacity||0); return over ? (<div className="text-danger small mt-1">{t.home.guests} &gt; {t.home.capacity}</div>) : (<div className="text-muted small mt-1">{t.home.capacity}: {st?.capacity||0}</div>) })()}
                  </div>

                  <h6 className="mb-2">{t.home.selectedItems}</h6>
                  {!items.length ? (
                    <div className="text-muted mb-2">{t.home.none}</div>
                  ) : (
                    <ul className="list-group mb-2">
                      {items.map((it, idx) => (
                        <li key={idx} className="list-group-item d-flex align-items-center gap-3">
                          <div className="flex-grow-1">{productMap[it.productId]?.name}</div>
                          <input type="number" min={1} className="form-control" style={{ width: 80 }} value={it.quantity}
                                 onChange={e => updateQty(idx, e.target.value)} />
                          <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(idx)}>{t.home.removeBtn}</button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto text-end">
                    {(() => { const st = tables.find(x => (x.id||x._id)===selectedTable); const over = st && Number(guestCount) > (st.capacity||0); const disabled = busy || !items.length || over; return (
                      <button disabled={disabled} className="btn btn-primary" onClick={submitOrder}>{t.home.submitOrder}</button>
                    ) })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
