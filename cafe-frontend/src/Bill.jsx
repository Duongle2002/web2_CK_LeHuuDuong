import React, { useEffect } from 'react';
import { useI18n } from './context/I18nContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

const Bill = () => {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/', { replace: true });
    }
  }, [order, navigate]);
  if (!order) return null;

  const { table, items = [], totalAmount, total, guestCount, createdAt, paymentStatus } = order;
  // Fallbacks: support both totalAmount and total, and compute from items if missing
  const computedTotal = (() => {
    if (totalAmount != null) return Number(totalAmount)
    if (total != null) return Number(total)
    return items.reduce((sum, it) => sum + Number(it.unitPrice || it.price || 0) * Number(it.quantity || 0), 0)
  })()
  const when = createdAt ? new Date(createdAt).toLocaleString() : new Date().toLocaleString()
  const payState = paymentStatus || 'UNPAID'

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center gap-2 mb-2">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => navigate('/orders')}
          aria-label={t.bill.backOrders}
          title={t.bill.backOrders}
        >
          ←
        </button>
        <h2 className="mb-0">{t.bill.title}</h2>
        <div className="ms-auto">
          <button className="btn btn-primary" onClick={() => { alert('Đã gửi yêu cầu thanh toán.'); navigate('/orders') }}>{t.bill.pay}</button>
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <p><strong>{t.bill.table}</strong>: {table?.tableNumber || table?.name}</p>
          <p><strong>{t.bill.guests}</strong>: {guestCount}</p>
          <p className="mb-0"><small className="text-muted">{when} • {payState}</small></p>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{t.bill.item}</th>
            <th>{t.bill.qty}</th>
            <th>{t.bill.unitPrice}</th>
            <th>{t.bill.lineTotal}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const unit = Number(item.unitPrice || item.price || 0)
            const qty = Number(item.quantity || 0)
            return (
              <tr key={idx}>
                <td>{item.name || item.productName}</td>
                <td>{qty}</td>
                <td>{unit.toLocaleString()}</td>
                <td>{(unit * qty).toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="text-end">
  <h4>{t.bill.total}: {Number(computedTotal || 0).toLocaleString()}</h4>
      </div>
    </div>
  );
};

export default Bill;
