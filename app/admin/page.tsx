'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  order_code: string;
  fullname: string;
  phone: string;
  address: string;
  items: any[];
  custom_name?: string;
  custom_number?: string;
  payment_method: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  version: string;
  tag: string;
  description: string;
  features: string[];
  image_url: string;
  is_featured: boolean;
  in_stock: boolean;
}

interface GalleryItem {
  id: string;
  title: string;
  desc: string;
  tag: string;
  category: string;
  image_url: string;
}

interface Trophy {
  id: string;
  title: string;
  count_label: string;
  years: string;
  desc: string;
  icon: string;
  is_highlight: boolean;
}

interface TimelineEvent {
  id: string;
  year_label: string;
  title: string;
  content: string;
  is_highlight: boolean;
}

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'gallery' | 'trophies' | 'timeline'>('orders');
  
  // Realtime Data from Supabase
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'danger' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Check saved session
    try {
      const savedAuth = sessionStorage.getItem('arsenal_admin_logged');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {}
    setAuthLoading(false);
  }, []);

  const loadAllData = () => {
    fetch('/api/orders').then(r => r.json()).then(d => { if (d.success) setOrders(d.data || []); }).catch(() => {});
    fetch('/api/products').then(r => r.json()).then(d => { if (d.success) setProducts(d.data || []); }).catch(() => {});
    fetch('/api/gallery').then(r => r.json()).then(d => { if (d.success) setGallery(d.data || []); }).catch(() => {});
    fetch('/api/trophies').then(r => r.json()).then(d => { if (d.success) setTrophies(d.data || []); }).catch(() => {});
    fetch('/api/timeline').then(r => r.json()).then(d => { if (d.success) setTimeline(d.data || []); }).catch(() => {});
    fetch('/api/stats').then(r => r.json()).then(d => { if (d.success) setStats(d.data); }).catch(() => {});
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('arsenal_admin_logged', 'true');
        showToast('Đăng nhập thành công! Chào mừng Quản trị viên.', 'success');
      } else {
        setLoginError(data.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      if (usernameInput === 'admin' && passwordInput === '12345') {
        setIsAuthenticated(true);
        sessionStorage.setItem('arsenal_admin_logged', 'true');
        showToast('Đăng nhập thành công!', 'success');
      } else {
        setLoginError('Sai tên đăng nhập hoặc mật khẩu!');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('arsenal_admin_logged');
    setIsAuthenticated(false);
    setPasswordInput('');
    showToast('Đã đăng xuất khỏi hệ thống quản trị', 'info');
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        showToast('Đã cập nhật trạng thái đơn hàng trên Supabase', 'success');
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi cập nhật đơn hàng', 'danger');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này khỏi Supabase?')) return;
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.filter(o => o.id !== id));
        showToast('Đã xóa đơn hàng thành công', 'info');
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi xóa đơn hàng', 'danger');
    }
  };

  // Handlers for Products
  const [newProduct, setNewProduct] = useState({
    name: '', price: 890000, version: 'Home', tag: 'MỚI', description: '', features: 'Vải thi đấu chuẩn cầu thủ, Thêu tên số miễn phí', image_url: '/assets/images/arsenal-home.jpg', is_featured: false
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          features: newProduct.features.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Thêm sản phẩm thành công vào Supabase', 'success');
        setNewProduct({ name: '', price: 890000, version: 'Home', tag: 'MỚI', description: '', features: 'Vải thi đấu, Thêu tên số', image_url: '/assets/images/arsenal-home.jpg', is_featured: false });
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi thêm sản phẩm', 'danger');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Xóa sản phẩm này khỏi Supabase?')) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      showToast('Đã xóa sản phẩm', 'info');
      loadAllData();
    } catch (e) {
      showToast('Lỗi khi xóa sản phẩm', 'danger');
    }
  };

  // Handlers for Gallery
  const [newGallery, setNewGallery] = useState({
    title: '', desc: '', tag: 'CHI TIẾT', category: 'home', image_url: '/assets/images/arsenal-home.jpg'
  });

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGallery)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Thêm ảnh thư viện thành công vào Supabase', 'success');
        setNewGallery({ title: '', desc: '', tag: 'CHI TIẾT', category: 'home', image_url: '/assets/images/arsenal-home.jpg' });
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi thêm ảnh', 'danger');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Xóa mục ảnh này khỏi Supabase?')) return;
    try {
      await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      showToast('Đã xóa mục ảnh', 'info');
      loadAllData();
    } catch (e) {
      showToast('Lỗi khi xóa ảnh', 'danger');
    }
  };

  // Handlers for Trophies
  const [newTrophy, setNewTrophy] = useState({
    title: '', count_label: '18x', years: '1930, 1931...', desc: '', icon: '🛡️', is_highlight: false
  });

  const handleAddTrophy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/trophies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrophy)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Thêm danh hiệu cúp thành công vào Supabase', 'success');
        setNewTrophy({ title: '', count_label: '18x', years: '', desc: '', icon: '🛡️', is_highlight: false });
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi thêm cúp', 'danger');
    }
  };

  const handleDeleteTrophy = async (id: string) => {
    if (!confirm('Xóa cúp này khỏi Supabase?')) return;
    try {
      await fetch(`/api/trophies?id=${id}`, { method: 'DELETE' });
      showToast('Đã xóa danh hiệu', 'info');
      loadAllData();
    } catch (e) {
      showToast('Lỗi khi xóa cúp', 'danger');
    }
  };

  // Handlers for Timeline
  const [newTimeline, setNewTimeline] = useState({
    year_label: '1886', title: '', content: '', is_highlight: false
  });

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTimeline)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Thêm cột mốc lịch sử thành công vào Supabase', 'success');
        setNewTimeline({ year_label: '1886', title: '', content: '', is_highlight: false });
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi thêm cột mốc', 'danger');
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Xóa cột mốc này khỏi Supabase?')) return;
    try {
      await fetch(`/api/timeline?id=${id}`, { method: 'DELETE' });
      showToast('Đã xóa cột mốc', 'info');
      loadAllData();
    } catch (e) {
      showToast('Lỗi khi xóa cột mốc', 'danger');
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mute)' }}>
        Đang khởi động hệ thống quản trị...
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 30%, rgba(216, 30, 61, 0.2), transparent 70%), var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <div style={{
          maxWidth: 420, width: '100%', background: 'var(--card)', border: '1px solid var(--line-strong)',
          borderRadius: 16, padding: 36, boxShadow: '0 25px 50px rgba(0,0,0,0.8)', textAlign: 'center'
        }}>
          <img src="/assets/images/arsenal-1886-crest.png" alt="Arsenal 1886" style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'Big Shoulders Display', fontSize: 28, fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.05em', marginBottom: 6 }}>
            QUẢN TRỊ ARSENAL 1886
          </h2>
          <p style={{ color: 'var(--mute)', fontSize: 13.5, marginBottom: 24 }}>Vui lòng xác thực tài khoản quản trị để truy cập dữ liệu Supabase.</p>

          {loginError && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', color: '#ff6b81', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 18, textAlign: 'left' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 6 }}>Tên đăng nhập (Username)</label>
              <input
                required
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 8, color: '#fff', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 6 }}>Mật khẩu (Password)</label>
              <input
                required
                type="password"
                placeholder="Nhập mật khẩu..."
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 8, color: '#fff', fontSize: 14 }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 6, background: 'var(--red)', color: '#fff', padding: '14px',
                borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: 'pointer', border: 'none'
              }}
            >
              Đăng Nhập Quản Trị →
            </button>
          </form>

          <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--mute)', textDecoration: 'none' }}>
              ← Quay lại Trang Chủ Khách Hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '30px 24px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/assets/images/arsenal-1886-crest.png" alt="Arsenal" style={{ width: 44, height: 44 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>
                  ARSENAL 1886 — ADMIN PORTAL
                </h1>
                <span style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                  SUPABASE POSTGRESQL LIVE
                </span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>
                Đang đăng nhập với tư cách: <b style={{ color: 'var(--cream)' }}>admin</b> (Super Administrator)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={loadAllData}
              style={{ background: 'var(--card-2)', border: '1px solid var(--line-strong)', color: 'var(--text)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
            >
              🔄 Tải lại dữ liệu
            </button>
            <Link
              href="/"
              target="_blank"
              style={{ background: 'var(--card-2)', border: '1px solid var(--line-strong)', color: 'var(--gold)', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              🌐 Mở Trang Chủ
            </Link>
            <button
              onClick={handleLogout}
              style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', color: '#ff6b81', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        {/* KPI STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 30 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, borderLeft: '4px solid var(--gold)' }}>
            <div style={{ fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>Tổng Doanh Thu</div>
            <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: 'var(--gold)', marginTop: 4 }}>
              {stats ? stats.total_revenue.toLocaleString('vi-VN') + 'đ' : '0đ'}
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, borderLeft: '4px solid var(--red)' }}>
            <div style={{ fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>Tổng Đơn Hàng</div>
            <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: 'var(--cream)', marginTop: 4 }}>
              {stats ? stats.total_orders : orders.length}
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, borderLeft: '4px solid #ff6b81' }}>
            <div style={{ fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>Đơn Chờ Xử Lý</div>
            <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: '#ff6b81', marginTop: 4 }}>
              {stats ? stats.pending_orders : orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, borderLeft: '4px solid var(--success)' }}>
            <div style={{ fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>Sản Phẩm & Ảnh</div>
            <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: 'var(--cream)', marginTop: 4 }}>
              {products.length} SP / {gallery.length} Ảnh
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { id: 'orders', label: `📦 Đơn Hàng (${orders.length})` },
            { id: 'products', label: `👕 Sản Phẩm (${products.length})` },
            { id: 'gallery', label: `🖼️ Thư Viện Ảnh (${gallery.length})` },
            { id: 'trophies', label: `🏆 Cúp & Danh Hiệu (${trophies.length})` },
            { id: 'timeline', label: `⏳ Lịch Sử (${timeline.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--gold)' : 'var(--card-2)',
                color: activeTab === tab.id ? '#000' : 'var(--mute)',
                border: '1px solid ' + (activeTab === tab.id ? 'var(--gold)' : 'var(--line)')
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ORDERS TABLE */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)' }}>Danh Sách Đơn Hàng (Realtime Supabase)</h3>
              <span style={{ fontSize: 13, color: 'var(--mute)' }}>Tự động đồng bộ với Cloud PostgreSQL</span>
            </div>

            {orders.length === 0 ? (
              <div style={{ background: 'var(--card)', padding: 40, borderRadius: 12, textAlign: 'center', color: 'var(--mute)' }}>
                Chưa có đơn hàng nào trong cơ sở dữ liệu Supabase. Hãy đặt thử trên trang chủ!
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--line)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: 'var(--card-2)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
                      <th style={{ padding: '14px 16px' }}>Mã Đơn</th>
                      <th style={{ padding: '14px 16px' }}>Khách Hàng</th>
                      <th style={{ padding: '14px 16px' }}>Sản Phẩm & In Ấn</th>
                      <th style={{ padding: '14px 16px' }}>Tổng Tiền</th>
                      <th style={{ padding: '14px 16px' }}>Thanh Toán</th>
                      <th style={{ padding: '14px 16px' }}>Trạng Thái</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord, idx) => (
                      <tr key={ord.id || idx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--gold)' }}>
                          #{ord.order_code}
                          <div style={{ fontSize: 11, color: 'var(--mute-2)', fontWeight: 400 }}>{new Date(ord.created_at).toLocaleDateString('vi-VN')}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--cream)' }}>{ord.fullname}</div>
                          <div style={{ color: 'var(--mute)', fontSize: 12 }}>📞 {ord.phone}</div>
                          <div style={{ color: 'var(--mute-2)', fontSize: 11 }}>📍 {ord.address}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {ord.items && ord.items.map((it, itIdx) => (
                            <div key={itIdx} style={{ marginBottom: 4 }}>
                              • <b>{it.name}</b> ({it.version} - Size {it.size}) x{it.quantity}
                            </div>
                          ))}
                          {(ord.custom_name || ord.custom_number) && (
                            <div style={{ color: 'var(--gold)', fontSize: 12, background: 'var(--gold-dim)', display: 'inline-block', padding: '2px 6px', borderRadius: 4, marginTop: 4 }}>
                              In: {ord.custom_name} #{ord.custom_number}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--cream)' }}>
                          {ord.total_amount ? Number(ord.total_amount).toLocaleString('vi-VN') + 'đ' : '0đ'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 12, background: 'var(--card-2)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--line)' }}>
                            {ord.payment_method === 'COD' ? '💵 COD' : '📱 QR Banking'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <select
                            value={ord.status}
                            onChange={e => handleUpdateOrderStatus(ord.id, e.target.value)}
                            style={{
                              padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                              background: ord.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : ord.status === 'shipping' ? 'rgba(232, 196, 104, 0.2)' : 'var(--card-2)',
                              color: ord.status === 'completed' ? '#4ade80' : ord.status === 'shipping' ? 'var(--gold)' : 'var(--cream)',
                              border: '1px solid var(--line)'
                            }}
                          >
                            <option value="pending">⏳ Chờ xử lý</option>
                            <option value="processing">🧵 Đang in/may</option>
                            <option value="shipping">🚚 Đang giao hàng</option>
                            <option value="completed">✅ Đã hoàn tất</option>
                            <option value="cancelled">❌ Đã hủy</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                          >
                            🗑️ Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Danh Sách Sản Phẩm Trong DB</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {products.map((prod, idx) => (
                  <div key={prod.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--cream)', fontSize: 16 }}>{prod.name}</div>
                      <div style={{ color: 'var(--gold)', fontSize: 14, fontWeight: 700 }}>{Number(prod.price).toLocaleString('vi-VN')}đ · {prod.version}</div>
                      <div style={{ color: 'var(--mute)', fontSize: 12 }}>Tag: {prod.tag} | Còn hàng: {prod.in_stock ? 'Có' : 'Hết'}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Product Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Sản Phẩm Mới Vào Supabase</h4>
              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tên sản phẩm *</label>
                  <input
                    required
                    type="text"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Giá bán (VNĐ) *</label>
                    <input
                      required
                      type="number"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Phiên bản</label>
                    <select
                      value={newProduct.version}
                      onChange={e => setNewProduct({ ...newProduct, version: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    >
                      <option value="Home">Sân Nhà (Home)</option>
                      <option value="Away">Sân Khách (Away)</option>
                      <option value="Combo 2">Bộ Combo 2 Áo</option>
                      <option value="Collector">Collector Edition</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả ngắn</label>
                  <textarea
                    rows={2}
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}
                >
                  Lưu Sản Phẩm Vào Supabase
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY CRUD */}
        {activeTab === 'gallery' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Thư Viện Ảnh (Realtime Supabase)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {gallery.map((g, idx) => (
                  <div key={g.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, position: 'relative' }}>
                    <img src={g.image_url} alt={g.title} style={{ width: '100%', height: 100, objectFit: 'contain', background: '#0e1014', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cream)' }}>{g.title}</div>
                    <div style={{ color: 'var(--gold)', fontSize: 11 }}>{g.category}</div>
                    <button
                      onClick={() => handleDeleteGallery(g.id)}
                      style={{ position: 'absolute', top: 6, right: 6, color: 'var(--red)', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 11, cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Gallery Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Ảnh Mới Vào Supabase</h4>
              <form onSubmit={handleAddGallery} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tiêu đề ảnh *</label>
                  <input
                    required
                    type="text"
                    value={newGallery.title}
                    onChange={e => setNewGallery({ ...newGallery, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Đường dẫn ảnh (URL hoặc /assets/images/*) *</label>
                  <input
                    required
                    type="text"
                    value={newGallery.image_url}
                    onChange={e => setNewGallery({ ...newGallery, image_url: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Danh mục lọc</label>
                    <select
                      value={newGallery.category}
                      onChange={e => setNewGallery({ ...newGallery, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    >
                      <option value="home">home (Sân Nhà)</option>
                      <option value="away">away (Sân Khách)</option>
                      <option value="pl-badge">pl-badge (Logo Ngoại Hạng)</option>
                      <option value="badge">badge (Huy Hiệu 1886)</option>
                      <option value="brand">brand (Thương Hiệu Adidas)</option>
                      <option value="package">package (Hộp Quà Sưu Tầm)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tag nhãn</label>
                    <input
                      type="text"
                      value={newGallery.tag}
                      onChange={e => setNewGallery({ ...newGallery, tag: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả chi tiết</label>
                  <textarea
                    rows={2}
                    value={newGallery.desc}
                    onChange={e => setNewGallery({ ...newGallery, desc: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}
                >
                  Lưu Ảnh Vào Supabase
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: TROPHIES CRUD */}
        {activeTab === 'trophies' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Bộ Sưu Tập Cúp Vô Địch</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {trophies.map((tr, idx) => (
                  <div key={tr.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--cream)', fontSize: 15 }}>{tr.icon} {tr.title} ({tr.count_label})</div>
                      <div style={{ color: 'var(--gold)', fontSize: 12 }}>Năm: {tr.years}</div>
                      <div style={{ color: 'var(--mute)', fontSize: 12 }}>{tr.desc}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteTrophy(tr.id)}
                      style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Trophy Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Cúp / Danh Hiệu</h4>
              <form onSubmit={handleAddTrophy} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tên giải đấu / Cúp *</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Siêu Cúp Anh (Community Shield)"
                    value={newTrophy.title}
                    onChange={e => setNewTrophy({ ...newTrophy, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Số lần vô địch *</label>
                    <input
                      required
                      type="text"
                      placeholder="VD: 18x"
                      value={newTrophy.count_label}
                      onChange={e => setNewTrophy({ ...newTrophy, count_label: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Biểu tượng (Emoji)</label>
                    <input
                      type="text"
                      value={newTrophy.icon}
                      onChange={e => setNewTrophy({ ...newTrophy, icon: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Các năm đăng quang</label>
                  <input
                    type="text"
                    placeholder="VD: 1930, 1931, ..., 2023"
                    value={newTrophy.years}
                    onChange={e => setNewTrophy({ ...newTrophy, years: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả ý nghĩa danh hiệu</label>
                  <textarea
                    rows={2}
                    value={newTrophy.desc}
                    onChange={e => setNewTrophy({ ...newTrophy, desc: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}
                >
                  Lưu Danh Hiệu Vào Supabase
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: TIMELINE CRUD */}
        {activeTab === 'timeline' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Cột Mốc Lịch Sử Ra Đời</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {timeline.map((ev, idx) => (
                  <div key={ev.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>{ev.year_label} — {ev.title}</div>
                      <div style={{ color: 'var(--mute)', fontSize: 13, marginTop: 4 }}>{ev.content}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteTimeline(ev.id)}
                      style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Milestone Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Cột Mốc Lịch Sử</h4>
              <form onSubmit={handleAddTimeline} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Năm / Thời kỳ *</label>
                    <input
                      required
                      type="text"
                      placeholder="VD: 1886"
                      value={newTimeline.year_label}
                      onChange={e => setNewTimeline({ ...newTimeline, year_label: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tiêu đề cột mốc *</label>
                    <input
                      required
                      type="text"
                      placeholder="VD: Dial Square & Những phát pháo đầu tiên"
                      value={newTimeline.title}
                      onChange={e => setNewTimeline({ ...newTimeline, title: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Nội dung lịch sử</label>
                  <textarea
                    rows={3}
                    value={newTimeline.content}
                    onChange={e => setNewTimeline({ ...newTimeline, content: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}
                >
                  Lưu Cột Mốc Vào Supabase
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* TOAST ALERT */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 5000,
          background: 'var(--card-2)', border: '1px solid var(--line-strong)',
          borderLeft: '4px solid ' + (toast.type === 'success' ? 'var(--success)' : toast.type === 'danger' ? 'var(--red)' : 'var(--gold)'),
          color: 'var(--text)', padding: '14px 20px', borderRadius: 6,
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14
        }}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'danger' ? '⚠️' : '🔔'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
