import React, { createContext, useContext, useMemo, useState } from 'react'

const I18nContext = createContext(null)

const dictionaries = {
  en: {
    app: { title: 'Cafe' },
    auth: {
      login: 'Login',
      register: 'Register',
      hello: 'Hello',
      pleaseLogin: 'Please login to access protected pages.',
      username: 'Username',
      password: 'Password',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
    },
    nav: {
      home: 'Home', products: 'Products', orders: 'Orders', tables: 'Tables', users: 'Users', logout: 'Logout'
    },
    home: {
      chooseTableAndOrder: 'Choose table and order',
      chooseTable: 'Choose table',
      guests: 'Guests',
      submitOrder: 'Submit Order',
      loginToOrder: 'Please login to reserve a table and order.',
      capacity: 'Capacity',
      reservedBy: 'Reserved by',
      manageTables: 'Manage tables',
      searchTable: 'Search table (#)',
      filterStatus: 'Filter status',
      all: 'All', available: 'AVAILABLE', reserved: 'RESERVED', occupied: 'OCCUPIED',
      total: 'Total', availShort: 'Avail', resvShort: 'Resv', occShort: 'Occ',
      availableBtn: 'Available', reserveBtn: 'Reserve', occupyBtn: 'Occupy', releaseBtn: 'Release',
      add: 'Add', selectedItems: 'Selected items', none: 'None yet.',
      pleaseChooseTable: 'Please choose a table',
      pleaseChooseItems: 'Please choose items',
      removeBtn: 'Remove',
      tableLabel: 'Table',
      orderLabel: 'Order',
    },
    orders: {
      myTables: 'My reserved tables',
      youHaveNoTables: 'You have no reserved tables.',
      myOrders: 'My orders',
      noOrders: 'No orders yet.',
      code: 'Code', table: 'Table', status: 'Status', payment: 'Payment', time: 'Time'
    }
    , bill: {
      title: 'Bill',
      table: 'Table',
      items: 'Items',
      item: 'Item',
      qty: 'Qty',
      unitPrice: 'Unit price',
      lineTotal: 'Line total',
      total: 'Total',
      guests: 'Guests',
      backOrders: 'Back to Orders',
      backHome: 'Back to Home',
      print: 'Print',
      pay: 'Pay'
    }
  },
  vn: {
    app: { title: 'Cafe' },
    auth: {
      login: 'Đăng nhập',
      register: 'Đăng ký',
      hello: 'Xin chào',
      pleaseLogin: 'Hãy đăng nhập để truy cập các trang bảo vệ.',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      fullName: 'Họ tên',
      email: 'Email',
      phone: 'SĐT',
    },
    nav: {
      home: 'Trang chủ', products: 'Sản phẩm', orders: 'Đơn hàng', tables: 'Bàn', users: 'Người dùng', logout: 'Đăng xuất'
    },
    home: {
      chooseTableAndOrder: 'Chọn bàn và gọi món',
      chooseTable: 'Chọn bàn',
      guests: 'Số khách',
      submitOrder: 'Gửi Order',
      loginToOrder: 'Hãy đăng nhập để đặt bàn và gọi món.',
      capacity: 'Số chỗ',
      reservedBy: 'Giữ bởi',
      manageTables: 'Quản lý bàn',
      searchTable: 'Tìm bàn (#)',
      filterStatus: 'Lọc trạng thái',
      all: 'Tất cả', available: 'AVAILABLE', reserved: 'RESERVED', occupied: 'OCCUPIED',
      total: 'Tổng', availShort: 'Avail', resvShort: 'Resv', occShort: 'Occ',
      availableBtn: 'Available', reserveBtn: 'Reserve', occupyBtn: 'Occupy', releaseBtn: 'Release',
      add: 'Thêm', selectedItems: 'Món đã chọn', none: 'Chưa có món nào.',
      pleaseChooseTable: 'Vui lòng chọn bàn',
      pleaseChooseItems: 'Vui lòng chọn món',
      removeBtn: 'Xóa',
      tableLabel: 'Bàn',
      orderLabel: 'Đơn',
    },
    orders: {
      myTables: 'Bàn đang giữ',
      youHaveNoTables: 'Bạn chưa giữ bàn nào.',
      myOrders: 'Đơn hàng của tôi',
      noOrders: 'Chưa có đơn hàng nào.',
      code: 'Mã', table: 'Bàn', status: 'Trạng thái', payment: 'Thanh toán', time: 'Thời gian'
    }
    , bill: {
      title: 'Hóa đơn',
      table: 'Bàn',
      items: 'Danh sách món',
      item: 'Món',
      qty: 'SL',
      unitPrice: 'Đơn giá',
      lineTotal: 'Thành tiền',
      total: 'Tổng cộng',
      guests: 'Số khách',
      backOrders: 'Về đơn hàng',
      backHome: 'Về trang chủ',
      print: 'In',
      pay: 'Thanh toán'
    }
  }
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'vn')
  const t = useMemo(() => dictionaries[lang], [lang])
  const switchLang = (l) => { setLang(l); localStorage.setItem('lang', l) }
  const value = useMemo(() => ({ lang, t, switchLang }), [lang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function LanguageSwitcher() {
  const { lang, switchLang } = useI18n()
  return (
    <div className="btn-group" role="group">
      <button className={`btn btn-sm ${lang==='vn'?'btn-primary':'btn-outline-primary'}`} onClick={() => switchLang('vn')}>VN</button>
      <button className={`btn btn-sm ${lang==='en'?'btn-primary':'btn-outline-primary'}`} onClick={() => switchLang('en')}>EN</button>
    </div>
  )
}
