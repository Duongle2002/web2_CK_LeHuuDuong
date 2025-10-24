import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Reports() {
  const { api, isAdmin } = useAuth()
  const [error, setError] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [daily, setDaily] = useState(null)
  const [start, setStart] = useState(() => new Date(new Date().setDate(new Date().getDate()-7)).toISOString().slice(0,10))
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0,10))
  const [summary, setSummary] = useState(null)
  const [top, setTop] = useState([])

  useEffect(() => { loadDaily() }, [date])
  useEffect(() => { loadRange() }, [start, end])

  const loadDaily = async () => {
    try { setDaily(await api.dailyReport(date)) } catch (e) { setError(e.message) }
  }
  const loadRange = async () => {
    try {
      const [sum, tops] = await Promise.all([
        api.rangeReport(start, end),
        api.topProducts(start, end, 10),
      ])
      setSummary(sum)
      setTop(tops)
    } catch (e) { setError(e.message) }
  }

  if (!isAdmin) return <div className="alert alert-danger">Permission denied</div>

  const onBackfill = async () => {
    try {
      const res = await api.backfillPaidAt()
      // Reload both reports afterwards
      await Promise.all([loadDaily(), loadRange()])
      alert(`Hoàn tất đồng bộ paidAt: ${res}`)
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Báo cáo</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={onBackfill}>Đồng bộ paidAt</button>
      </div>
      {!!error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-3">
        <div className="col-auto">
          <label className="form-label">Báo cáo ngày</label>
          <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        {daily && (
          <div className="col d-flex align-items-end">
            <div className="d-flex gap-3 flex-wrap">
              <div className="card p-3"><div className="small text-muted">Doanh thu</div><div className="fs-5">{Number(daily.totalRevenue||0).toLocaleString()}</div></div>
              <div className="card p-3"><div className="small text-muted">Số đơn</div><div className="fs-5">{daily.ordersCount}</div></div>
              <div className="card p-3"><div className="small text-muted">Khách</div><div className="fs-5">{daily.guests}</div></div>
            </div>
          </div>
        )}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-auto">
          <label className="form-label">Từ ngày</label>
          <input type="date" className="form-control" value={start} onChange={e => setStart(e.target.value)} />
        </div>
        <div className="col-auto">
          <label className="form-label">Đến ngày</label>
          <input type="date" className="form-control" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
        {summary && (
          <div className="col d-flex align-items-end">
            <div className="d-flex gap-3 flex-wrap">
              <div className="card p-3"><div className="small text-muted">Tổng doanh thu</div><div className="fs-5">{Number(summary.totalRevenue||0).toLocaleString()}</div></div>
              <div className="card p-3"><div className="small text-muted">Tổng số đơn</div><div className="fs-5">{summary.ordersCount}</div></div>
              <div className="card p-3"><div className="small text-muted">Tổng khách</div><div className="fs-5">{summary.guests}</div></div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Top sản phẩm</h5>
          {!top.length ? (
            <div className="text-muted">Không có dữ liệu</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((p, idx) => (
                    <tr key={p.productId}>
                      <td>{idx+1}</td>
                      <td>{p.name}</td>
                      <td>{p.quantity}</td>
                      <td>{Number(p.revenue||0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
