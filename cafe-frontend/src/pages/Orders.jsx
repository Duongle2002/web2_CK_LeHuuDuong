import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext.jsx'

export default function Orders() {
  const { api, user, isAdmin } = useAuth()
  const { t } = useI18n()
  const [error, setError] = useState('')
  const [myOrders, setMyOrders] = useState([])
  const [myTables, setMyTables] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [adminTables, setAdminTables] = useState([])
  const [onlyOpen, setOnlyOpen] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [paymentFilter, setPaymentFilter] = useState('ALL')
  const [q, setQ] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          const [orders, tables] = await Promise.all([
            api.listAllOrders(onlyOpen),
            api.adminListTables(),
          ])
          setAllOrders(orders)
          setAdminTables(tables)
        } else {
          const [os, ts] = await Promise.all([
            api.request('/api/orders/my'),
            api.listMyTables(),
          ])
          setMyOrders(os)
          setMyTables(ts)
        }
      } catch (e) { setError(e.message) }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, onlyOpen])

  const tableName = (id) => myTables.find(t => (t.id||t._id) === id)?.name || 'Table'
  const adminTableName = (id) => {
    const t = adminTables.find(t => (t.id||t._id) === id)
    return t ? (t.name || t.tableNumber || 'Table') : id
  }

  const reloadAll = async () => {
    try { setAllOrders(await api.listAllOrders(onlyOpen)) } catch (e) { setError(e.message) }
  }

  const actions = {
    confirm: async (id) => { try { await api.confirmOrder(id); await reloadAll() } catch (e) { setError(e.message) } },
    preparing: async (id) => { try { await api.preparingOrder(id); await reloadAll() } catch (e) { setError(e.message) } },
    ready: async (id) => { try { await api.readyOrder(id); await reloadAll() } catch (e) { setError(e.message) } },
    served: async (id) => { try { await api.servedOrder(id); await reloadAll() } catch (e) { setError(e.message) } },
    pay: async (id) => { try { await api.payOrder(id); await reloadAll() } catch (e) { setError(e.message) } },
    cancel: async (id) => { try { await api.cancelOrder(id); await reloadAll() } catch (e) { setError(e.message) } },
  }

  if (isAdmin) {
    const filtered = useMemo(() => {
      return allOrders.filter(o => {
        const okQ = !q || String(o.id || o._id).toLowerCase().includes(q.toLowerCase())
        const okStatus = statusFilter === 'ALL' || (o.fulfillmentStatus || 'PENDING') === statusFilter
        const pay = o.paymentStatus || (o.paidAt ? 'PAID' : 'UNPAID')
        const okPay = paymentFilter === 'ALL' || pay === paymentFilter
        return okQ && okStatus && okPay
      })
    }, [allOrders, q, statusFilter, paymentFilter])
    return (
      <div>
        <h2 className="mb-3">Quản lý đơn hàng</h2>
        {!!error && <div className="alert alert-danger">{error}</div>}
        <div className="d-flex flex-wrap gap-3 align-items-end mb-3">
          <div>
            <label className="form-label">Chỉ hiển thị đơn chưa thanh toán</label>
            <div>
              <input type="checkbox" id="onlyOpen" checked={onlyOpen} onChange={e => setOnlyOpen(e.target.checked)} />{' '}
              <label htmlFor="onlyOpen">onlyOpen</label>
            </div>
          </div>
          <div>
            <label className="form-label">Trạng thái pha chế</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">Tất cả</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PREPARING">PREPARING</option>
              <option value="READY">READY</option>
              <option value="SERVED">SERVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div>
            <label className="form-label">Thanh toán</label>
            <select className="form-select" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
              <option value="ALL">Tất cả</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
          <div>
            <label className="form-label">Tìm theo mã đơn</label>
            <input className="form-control" placeholder="Nhập mã..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Bàn</th>
                <th>Khách</th>
                <th>Trạng thái pha chế</th>
                <th>Thanh toán</th>
                <th>Tổng</th>
                <th>Thời gian</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id || o._id}>
                  <td style={{maxWidth:160, wordBreak:'break-all'}}>{o.id || o._id}</td>
                  <td>{adminTableName(o.tableId)}</td>
                  <td>{o.guestCount}</td>
                  <td>{o.fulfillmentStatus || '-'}</td>
                  <td>{o.paymentStatus || (o.paidAt ? 'PAID' : 'UNPAID')}</td>
                  <td>{(o.totalAmount || 0).toLocaleString()}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="d-flex flex-wrap gap-1">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => actions.confirm(o.id || o._id)}>Xác nhận</button>
                    <button className="btn btn-outline-warning btn-sm" onClick={() => actions.preparing(o.id || o._id)}>Đang pha</button>
                    <button className="btn btn-outline-info btn-sm" onClick={() => actions.ready(o.id || o._id)}>Sẵn sàng</button>
                    <button className="btn btn-outline-success btn-sm" onClick={() => actions.served(o.id || o._id)}>Đã phục vụ</button>
                    <button className="btn btn-success btn-sm" onClick={() => actions.pay(o.id || o._id)}>Thanh toán</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => actions.cancel(o.id || o._id)}>Hủy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-3">{t.orders.myOrders}</h2>
      {!!error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <h5>{t.orders.myTables}</h5>
        {!myTables.length ? (
          <div className="text-muted">{t.orders.youHaveNoTables}</div>
        ) : (
          <ul className="list-group">
            {myTables.map(t => (
              <li className="list-group-item" key={t.id || t._id}>
                {(t.name || t.tableNumber || 'Table')} - {t.status}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!myOrders.length ? (
        <div className="text-muted">{t.orders.noOrders}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{t.orders.code}</th>
                <th>{t.orders.table}</th>
                <th>{t.orders.status}</th>
                <th>{t.orders.payment}</th>
                <th>{t.orders.time}</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map(o => (
                <tr key={o.id || o._id}>
                  <td>{o.id || o._id}</td>
                  <td>{tableName(o.tableId)}</td>
                  <td>{o.fulfillmentStatus || o.status}</td>
                  <td>{o.paymentStatus || (o.paidAt ? 'PAID' : 'UNPAID')}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
