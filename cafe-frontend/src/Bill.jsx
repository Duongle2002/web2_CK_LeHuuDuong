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

  const { table, items, total, guestCount } = order;

  return (
    <div className="container mt-4">
      <h2>{t.bill.title}</h2>
      <div className="card mb-3">
        <div className="card-body">
          <p><strong>{t.bill.table}</strong>: {table?.tableNumber || table?.name}</p>
          <p><strong>{t.bill.guestCount}</strong>: {guestCount}</p>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{t.bill.product}</th>
            <th>{t.bill.quantity}</th>
            <th>{t.bill.price}</th>
            <th>{t.bill.total}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.productName}</td>
              <td>{item.quantity}</td>
              <td>{item.price.toLocaleString()}</td>
              <td>{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-end">
        <h4>{t.bill.total}: {total.toLocaleString()}</h4>
      </div>
    </div>
  );
};

export default Bill;
