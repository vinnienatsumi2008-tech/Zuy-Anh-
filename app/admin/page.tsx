'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  size: string;
  version: string;
  quantity: number;
}

interface Order {
  id: string;
  order_code: string;
  fullname: string;
  phone: string;
  address: string;
  items: OrderItem[];
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

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'gallery' | 'trophies' | 'timeline' | 'users'>('orders');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Search & Filter
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  
  // Edit Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [editingTrophy, setEditingTrophy] = useState<Trophy | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState<string>('');

  // Upload States
  const [isUploadingProductImg, setIsUploadingProductImg] = useState<boolean>(false);
  const [isUploadingGalleryImg, setIsUploadingGalleryImg] = useState<boolean>(false);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const editProductFileInputRef = useRef<HTMLInputElement>(null);
  const editGalleryFileInputRef = useRef<HTMLInputElement>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'danger' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
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
    fetch('/api/users').then(r => r.json()).then(d => { if (d.success) setUsers(d.data || []); }).catch(() => {});
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
        showToast('Đăng nhập thành công!', 'success');
      } else {
        setLoginError(data.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      setLoginError('Sai tên đăng nhập hoặc mật khẩu!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('arsenal_admin_logged');
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
    showToast('Đã đăng xuất', 'info');
  };

  // Image Upload Handler
  const handleUploadImageFile = async (file: File, callback: (url: string) => void) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        callback(data.url);
        showToast('Đã tải ảnh lên thành công', 'success');
      } else {
        showToast(data.error || 'Lỗi khi tải ảnh', 'danger');
      }
    } catch (e) {
      showToast('Lỗi kết nối khi tải ảnh', 'danger');
    }
  };

  // ===================== ORDERS CRUD =====================
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
        showToast('Đã cập nhật trạng thái đơn hàng', 'success');
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi cập nhật đơn hàng', 'danger');
    }
  };

  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOrder)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật đơn hàng', 'success');
        setEditingOrder(null);
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi lưu đơn hàng', 'danger');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.filter(o => o.id !== id));
        showToast('Đã xóa đơn hàng', 'info');
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi xóa đơn hàng', 'danger');
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(ord => {
    const matchStatus = orderFilterStatus === 'all' || ord.status === orderFilterStatus;
    const matchSearch = orderSearch.trim() === '' || 
      ord.order_code.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.fullname.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.phone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  // ===================== PRODUCTS CRUD =====================
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 890000,
    version: 'Home',
    tag: 'Bản Mới',
    description: 'Áo đấu chính hãng bảo chứng chất lượng, giao hàng 1-3 ngày toàn quốc.',
    features: '1 áo chính hãng, Bảo chứng Adidas 100%, Miễn phí thêu tên số, Đổi size 30 ngày',
    image_url: '/assets/images/arsenal-home.jpg',
    is_featured: false,
    in_stock: true
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          features: typeof newProduct.features === 'string' ? newProduct.features.split(',').map(s => s.trim()) : newProduct.features
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã thêm sản phẩm thành công', 'success');
        setNewProduct({
          name: '',
          price: 890000,
          version: 'Home',
          tag: 'Bản Mới',
          description: 'Áo đấu chính hãng bảo chứng chất lượng, giao hàng 1-3 ngày toàn quốc.',
          features: '1 áo chính hãng, Bảo chứng Adidas 100%, Miễn phí thêu tên số, Đổi size 30 ngày',
          image_url: '/assets/images/arsenal-home.jpg',
          is_featured: false,
          in_stock: true
        });
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi thêm sản phẩm', 'danger');
    }
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          features: Array.isArray(editingProduct.features) ? editingProduct.features : (editingProduct.features as any).split(',').map((s: string) => s.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật sản phẩm', 'success');
        setEditingProduct(null);
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi lưu sản phẩm', 'danger');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      showToast('Đã xóa sản phẩm', 'info');
      loadAllData();
    } catch (e) {
      showToast('Lỗi khi xóa sản phẩm', 'danger');
    }
  };

  // ===================== GALLERY CRUD =====================
  const [newGallery, setNewGallery] = useState({
    title: '',
    desc: 'Hình ảnh chi tiết sắc nét chuẩn bộ sưu tập Arsenal 1886.',
    tag: 'ẢNH CHI TIẾT',
    category: 'home',
    image_url: '/assets/images/arsenal-home.jpg'
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
        showToast('Đã thêm ảnh thành công', 'success');
        setNewGallery({
          title: '',
          desc: 'Hình ảnh chi tiết sắc nét chuẩn bộ sưu tập Arsenal 1886.',
          tag: 'ẢNH CHI TIẾT',
          category: 'home',
          image_url: '/assets/images/arsenal-home.jpg'
        });
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi thêm ảnh', 'danger');
    }
  };

  const handleSaveEditGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    try {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGallery)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật ảnh', 'success');
        setEditingGallery(null);
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi lưu ảnh', 'danger');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    try {
      await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      showToast('Đã xóa ảnh', 'info');
      loadAllData();
    } catch (e) {
      showToast('Lỗi khi xóa ảnh', 'danger');
    }
  };

  // ===================== TROPHIES CRUD =====================
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
        showToast('Đã thêm danh hiệu thành công', 'success');
        setNewTrophy({ title: '', count_label: '18x', years: '', desc: '', icon: '🛡️', is_highlight: false });
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi thêm danh hiệu', 'danger');
    }
  };

  const handleSaveEditTrophy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrophy) return;
    try {
      const res = await fetch('/api/trophies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTrophy)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật danh hiệu', 'success');
        setEditingTrophy(null);
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi lưu danh hiệu', 'danger');
    }
  };

  const handleDeleteTrophy = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh hiệu này?')) return;
    try {
      await fetch(`/api/trophies?id=${id}`, { method: 'DELETE' });
      showToast('Đã xóa danh hiệu', 'info');
      loadAllData();
    } catch (e) {
      showToast('Lỗi khi xóa danh hiệu', 'danger');
    }
  };

  // ===================== TIMELINE CRUD =====================
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
        showToast('Đã thêm cột mốc thành công', 'success');
        setNewTimeline({ year_label: '1886', title: '', content: '', is_highlight: false });
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi thêm cột mốc', 'danger');
    }
  };

  const handleSaveEditTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeline) return;
    try {
      const res = await fetch('/api/timeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTimeline)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật cột mốc', 'success');
        setEditingTimeline(null);
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi lưu cột mốc', 'danger');
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa cột mốc này?')) return;
    try {
      await fetch(`/api/timeline?id=${id}`, { method: 'DELETE' });
      showToast('Đã xóa cột mốc', 'info');
      loadAllData();
    } catch (e) {
      showToast('Lỗi khi xóa cột mốc', 'danger');
    }
  };

  // ===================== USERS CRUD =====================
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Staff'
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã tạo tài khoản người dùng thành công', 'success');
        setNewUser({ username: '', email: '', password: '', role: 'Staff' });
        loadAllData();
      } else {
        showToast(data.error || 'Lỗi khi tạo tài khoản', 'danger');
      }
    } catch (e) {
      showToast('Lỗi kết nối khi tạo tài khoản', 'danger');
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          email: editingUser.email,
          role: editingUser.role,
          password: newPasswordForUser || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã cập nhật tài khoản', 'success');
        setEditingUser(null);
        setNewPasswordForUser('');
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi lưu tài khoản', 'danger');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa tài khoản', 'info');
        loadAllData();
      }
    } catch (e) {
      showToast('Lỗi khi xóa tài khoản', 'danger');
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mute)' }}>
        Đang tải...
      </div>
    );
  }

  // CLEAN LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 30%, rgba(216, 30, 61, 0.2), transparent 70%), var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <div style={{
          maxWidth: 400, width: '100%', background: 'var(--card)', border: '1px solid var(--line-strong)',
          borderRadius: 16, padding: 36, boxShadow: '0 25px 50px rgba(0,0,0,0.8)', textAlign: 'center'
        }}>
          <img src="/assets/images/arsenal-1886-crest.png" alt="Arsenal 1886" style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'Big Shoulders Display', fontSize: 28, fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.05em', marginBottom: 20 }}>
            QUẢN TRỊ VIÊN
          </h2>

          {loginError && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', color: '#ff6b81', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 18, textAlign: 'left' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 6 }}>Tên đăng nhập hoặc Email</label>
              <input
                required
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 8, color: '#fff', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 6 }}>Mật khẩu</label>
              <input
                required
                type="password"
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
              Đăng Nhập
            </button>
          </form>

          <div style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--mute)', textDecoration: 'none' }}>
              ← Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CLEAN AUTHENTICATED DASHBOARD WITH FULL CRUD
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '30px 24px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/assets/images/arsenal-1886-crest.png" alt="Arsenal" style={{ width: 44, height: 44 }} />
            <div>
              <h1 style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>
                ARSENAL 1886
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={loadAllData}
              style={{ background: 'var(--card-2)', border: '1px solid var(--line-strong)', color: 'var(--text)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
            >
              🔄 Tải lại
            </button>
            <Link
              href="/"
              target="_blank"
              style={{ background: 'var(--card-2)', border: '1px solid var(--line-strong)', color: 'var(--gold)', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              🌐 Xem Trang Chủ
            </Link>
            <button
              onClick={handleLogout}
              style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', color: '#ff6b81', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* KPI STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 30 }}>
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
            <div style={{ fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>Sản Phẩm</div>
            <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: 'var(--cream)', marginTop: 4 }}>
              {products.length} SP
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, borderLeft: '4px solid #60a5fa' }}>
            <div style={{ fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}>Người Dùng</div>
            <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: 'var(--cream)', marginTop: 4 }}>
              {users.length} Tài khoản
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { id: 'orders', label: `Đơn Hàng (${orders.length})` },
            { id: 'products', label: `Sản Phẩm (${products.length})` },
            { id: 'gallery', label: `Thư Viện Ảnh (${gallery.length})` },
            { id: 'trophies', label: `Cúp & Danh Hiệu (${trophies.length})` },
            { id: 'timeline', label: `Lịch Sử (${timeline.length})` },
            { id: 'users', label: `Người Dùng (${users.length})` },
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)' }}>Danh Sách Đơn Hàng</h3>
              
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, tên, SĐT..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  style={{ padding: '8px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff', fontSize: 13 }}
                />
                <select
                  value={orderFilterStatus}
                  onChange={e => setOrderFilterStatus(e.target.value)}
                  style={{ padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff', fontSize: 13 }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang in/may</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Đã hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ background: 'var(--card)', padding: 40, borderRadius: 12, textAlign: 'center', color: 'var(--mute)' }}>
                Không tìm thấy đơn hàng nào phù hợp.
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
                    {filteredOrders.map((ord, idx) => (
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
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              onClick={() => setEditingOrder(ord)}
                              style={{ color: 'var(--gold)', background: 'var(--gold-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(ord.id)}
                              style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                            >
                              Xóa
                            </button>
                          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Danh Sách Sản Phẩm</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {products.map((prod, idx) => (
                  <div key={prod.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 72, height: 72, background: '#0e1014', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                      <img src={prod.image_url} alt={prod.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: 'var(--cream)', fontSize: 15 }}>{prod.name}</div>
                      <div style={{ color: 'var(--gold)', fontSize: 14, fontWeight: 700 }}>{Number(prod.price).toLocaleString('vi-VN')}đ · <span style={{ color: 'var(--mute)', fontSize: 12 }}>{prod.version}</span></div>
                      <div style={{ color: 'var(--mute)', fontSize: 11.5 }}>Tag: {prod.tag} | Còn hàng: {prod.in_stock ? 'Có' : 'Hết'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button
                        onClick={() => setEditingProduct(prod)}
                        style={{ color: 'var(--gold)', background: 'var(--gold-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Product Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Sản Phẩm Mới</h4>
              
              {/* IMAGE UPLOAD BOX FOR PRODUCT */}
              <div style={{ background: 'var(--card-2)', border: '1px dashed var(--gold)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 72, height: 72, background: '#090a0c', border: '1px solid var(--line)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={newProduct.image_url} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cream)', marginBottom: 6 }}>Hình ảnh sản phẩm</div>
                    <input
                      type="file"
                      ref={productFileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadImageFile(e.target.files[0], url => setNewProduct(prev => ({ ...prev, image_url: url })));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => productFileInputRef.current?.click()}
                      style={{
                        background: 'var(--gold)', color: '#000', padding: '6px 14px', borderRadius: 6,
                        fontWeight: 800, fontSize: 12, cursor: 'pointer'
                      }}
                    >
                      📁 Tải ảnh lên
                    </button>
                  </div>
                </div>
              </div>

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tag nhãn</label>
                    <input
                      type="text"
                      value={newProduct.tag}
                      onChange={e => setNewProduct({ ...newProduct, tag: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>URL ảnh</label>
                    <input
                      type="text"
                      value={newProduct.image_url}
                      onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả</label>
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
                  Lưu Sản Phẩm
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY CRUD */}
        {activeTab === 'gallery' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Thư Viện Ảnh</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {gallery.map((g, idx) => (
                  <div key={g.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, position: 'relative' }}>
                    <img src={g.image_url} alt={g.title} style={{ width: '100%', height: 110, objectFit: 'contain', background: '#0e1014', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--cream)' }}>{g.title}</div>
                    <div style={{ color: 'var(--gold)', fontSize: 11 }}>{g.category} · {g.tag}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        onClick={() => setEditingGallery(g)}
                        style={{ flex: 1, color: 'var(--gold)', background: 'var(--gold-dim)', border: 'none', borderRadius: 4, padding: '4px 6px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(g.id)}
                        style={{ flex: 1, color: 'var(--red)', background: 'var(--red-dim)', border: 'none', borderRadius: 4, padding: '4px 6px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Gallery Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Ảnh Mới</h4>
              
              {/* IMAGE UPLOAD BOX FOR GALLERY */}
              <div style={{ background: 'var(--card-2)', border: '1px dashed var(--gold)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 72, height: 72, background: '#090a0c', border: '1px solid var(--line)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={newGallery.image_url} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cream)', marginBottom: 6 }}>Hình ảnh</div>
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadImageFile(e.target.files[0], url => setNewGallery(prev => ({ ...prev, image_url: url })));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      style={{
                        background: 'var(--gold)', color: '#000', padding: '6px 14px', borderRadius: 6,
                        fontWeight: 800, fontSize: 12, cursor: 'pointer'
                      }}
                    >
                      📁 Tải ảnh lên
                    </button>
                  </div>
                </div>
              </div>

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Danh mục</label>
                    <select
                      value={newGallery.category}
                      onChange={e => setNewGallery({ ...newGallery, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    >
                      <option value="home">Sân Nhà (home)</option>
                      <option value="away">Sân Khách (away)</option>
                      <option value="pl-badge">Logo Ngoại Hạng (pl-badge)</option>
                      <option value="badge">Huy Hiệu 1886 (badge)</option>
                      <option value="brand">Thương Hiệu Adidas (brand)</option>
                      <option value="package">Hộp Quà Sưu Tầm (package)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tag</label>
                    <input
                      type="text"
                      value={newGallery.tag}
                      onChange={e => setNewGallery({ ...newGallery, tag: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả</label>
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
                  Lưu Ảnh
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: TROPHIES CRUD */}
        {activeTab === 'trophies' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Bộ Sưu Tập Cúp</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {trophies.map((tr, idx) => (
                  <div key={tr.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--cream)', fontSize: 15 }}>{tr.icon} {tr.title} ({tr.count_label})</div>
                      <div style={{ color: 'var(--gold)', fontSize: 12 }}>Năm: {tr.years}</div>
                      <div style={{ color: 'var(--mute)', fontSize: 12 }}>{tr.desc}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setEditingTrophy(tr)}
                        style={{ color: 'var(--gold)', background: 'var(--gold-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteTrophy(tr.id)}
                        style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Trophy Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Danh Hiệu</h4>
              <form onSubmit={handleAddTrophy} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tên giải đấu *</label>
                  <input
                    required
                    type="text"
                    value={newTrophy.title}
                    onChange={e => setNewTrophy({ ...newTrophy, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Số lần *</label>
                    <input
                      required
                      type="text"
                      value={newTrophy.count_label}
                      onChange={e => setNewTrophy({ ...newTrophy, count_label: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Biểu tượng</label>
                    <input
                      type="text"
                      value={newTrophy.icon}
                      onChange={e => setNewTrophy({ ...newTrophy, icon: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Năm</label>
                  <input
                    type="text"
                    value={newTrophy.years}
                    onChange={e => setNewTrophy({ ...newTrophy, years: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả</label>
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
                  Lưu Danh Hiệu
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: TIMELINE CRUD */}
        {activeTab === 'timeline' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Cột Mốc Lịch Sử</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {timeline.map((ev, idx) => (
                  <div key={ev.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>{ev.year_label} — {ev.title}</div>
                      <div style={{ color: 'var(--mute)', fontSize: 13, marginTop: 4 }}>{ev.content}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setEditingTimeline(ev)}
                        style={{ color: 'var(--gold)', background: 'var(--gold-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteTimeline(ev.id)}
                        style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Milestone Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Cột Mốc</h4>
              <form onSubmit={handleAddTimeline} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Năm *</label>
                    <input
                      required
                      type="text"
                      value={newTimeline.year_label}
                      onChange={e => setNewTimeline({ ...newTimeline, year_label: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tiêu đề *</label>
                    <input
                      required
                      type="text"
                      value={newTimeline.title}
                      onChange={e => setNewTimeline({ ...newTimeline, title: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Nội dung</label>
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
                  Lưu Cột Mốc
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: USERS CRUD */}
        {activeTab === 'users' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)', marginBottom: 16 }}>Danh Sách Người Dùng Quản Trị</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {users.map((u, idx) => (
                  <div key={u.id || idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--cream)', fontSize: 15 }}>
                        👤 {u.username} <span style={{ color: 'var(--gold)', fontSize: 12, background: 'var(--gold-dim)', padding: '2px 8px', borderRadius: 10 }}>{u.role}</span>
                      </div>
                      <div style={{ color: 'var(--mute)', fontSize: 12, marginTop: 4 }}>📧 {u.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setEditingUser(u)}
                        style={{ color: 'var(--gold)', background: 'var(--gold-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                      >
                        Sửa
                      </button>
                      {u.username !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add User Form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>+ Thêm Tài Khoản Mới</h4>
              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tên đăng nhập (Username) *</label>
                  <input
                    required
                    type="text"
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mật khẩu *</label>
                    <input
                      required
                      type="password"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)' }}>Vai trò (Role)</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    >
                      <option value="Staff">Nhân viên (Staff)</option>
                      <option value="Store Manager">Quản lý (Manager)</option>
                      <option value="Super Administrator">Quản trị viên cấp cao</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  style={{ background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}
                >
                  Tạo Người Dùng
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* ===================== EDIT MODAL FOR PRODUCT ===================== */}
      {editingProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative' }}>
            <button
              onClick={() => setEditingProduct(null)}
              style={{ position: 'absolute', top: 16, right: 20, fontSize: 20, color: 'var(--mute)', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>Chỉnh Sửa Sản Phẩm</h3>
            
            <div style={{ background: 'var(--card-2)', border: '1px dashed var(--gold)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 64, height: 64, background: '#090a0c', border: '1px solid var(--line)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={editingProduct.image_url} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <input
                    type="file"
                    ref={editProductFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadImageFile(e.target.files[0], url => setEditingProduct(prev => prev ? { ...prev, image_url: url } : null));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => editProductFileInputRef.current?.click()}
                    style={{ background: 'var(--gold)', color: '#000', padding: '6px 12px', borderRadius: 6, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
                  >
                    Thay đổi ảnh
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tên sản phẩm</label>
                <input
                  required
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Giá bán (VNĐ)</label>
                  <input
                    required
                    type="number"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Phiên bản</label>
                  <select
                    value={editingProduct.version}
                    onChange={e => setEditingProduct({ ...editingProduct, version: e.target.value })}
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
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tag nhãn</label>
                <input
                  type="text"
                  value={editingProduct.tag}
                  onChange={e => setEditingProduct({ ...editingProduct, tag: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={editingProduct.in_stock}
                    onChange={e => setEditingProduct({ ...editingProduct, in_stock: e.target.checked })}
                  />
                  Còn hàng
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured}
                    onChange={e => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                  />
                  Nổi bật
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ flex: 1, background: 'var(--card-2)', color: 'var(--mute)', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT MODAL FOR GALLERY ===================== */}
      {editingGallery && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 500, width: '100%', padding: 28, position: 'relative' }}>
            <button
              onClick={() => setEditingGallery(null)}
              style={{ position: 'absolute', top: 16, right: 20, fontSize: 20, color: 'var(--mute)', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>Chỉnh Sửa Ảnh Thư Viện</h3>
            
            <div style={{ background: 'var(--card-2)', border: '1px dashed var(--gold)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 64, height: 64, background: '#090a0c', border: '1px solid var(--line)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={editingGallery.image_url} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <input
                    type="file"
                    ref={editGalleryFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadImageFile(e.target.files[0], url => setEditingGallery(prev => prev ? { ...prev, image_url: url } : null));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => editGalleryFileInputRef.current?.click()}
                    style={{ background: 'var(--gold)', color: '#000', padding: '6px 12px', borderRadius: 6, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
                  >
                    Thay đổi ảnh
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveEditGallery} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tiêu đề ảnh</label>
                <input
                  required
                  type="text"
                  value={editingGallery.title}
                  onChange={e => setEditingGallery({ ...editingGallery, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Danh mục</label>
                  <select
                    value={editingGallery.category}
                    onChange={e => setEditingGallery({ ...editingGallery, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  >
                    <option value="home">Sân Nhà (home)</option>
                    <option value="away">Sân Khách (away)</option>
                    <option value="pl-badge">Logo Ngoại Hạng (pl-badge)</option>
                    <option value="badge">Huy Hiệu 1886 (badge)</option>
                    <option value="brand">Thương Hiệu Adidas (brand)</option>
                    <option value="package">Hộp Quà Sưu Tầm (package)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tag</label>
                  <input
                    type="text"
                    value={editingGallery.tag}
                    onChange={e => setEditingGallery({ ...editingGallery, tag: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả</label>
                <textarea
                  rows={2}
                  value={editingGallery.desc}
                  onChange={e => setEditingGallery({ ...editingGallery, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingGallery(null)}
                  style={{ flex: 1, background: 'var(--card-2)', color: 'var(--mute)', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT MODAL FOR TROPHY ===================== */}
      {editingTrophy && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 500, width: '100%', padding: 28, position: 'relative' }}>
            <button
              onClick={() => setEditingTrophy(null)}
              style={{ position: 'absolute', top: 16, right: 20, fontSize: 20, color: 'var(--mute)', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>Chỉnh Sửa Danh Hiệu</h3>
            <form onSubmit={handleSaveEditTrophy} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tên giải đấu</label>
                <input
                  required
                  type="text"
                  value={editingTrophy.title}
                  onChange={e => setEditingTrophy({ ...editingTrophy, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Số lần</label>
                  <input
                    required
                    type="text"
                    value={editingTrophy.count_label}
                    onChange={e => setEditingTrophy({ ...editingTrophy, count_label: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Biểu tượng</label>
                  <input
                    type="text"
                    value={editingTrophy.icon}
                    onChange={e => setEditingTrophy({ ...editingTrophy, icon: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Năm</label>
                <input
                  type="text"
                  value={editingTrophy.years}
                  onChange={e => setEditingTrophy({ ...editingTrophy, years: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Mô tả</label>
                <textarea
                  rows={2}
                  value={editingTrophy.desc}
                  onChange={e => setEditingTrophy({ ...editingTrophy, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingTrophy(null)}
                  style={{ flex: 1, background: 'var(--card-2)', color: 'var(--mute)', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT MODAL FOR TIMELINE ===================== */}
      {editingTimeline && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 500, width: '100%', padding: 28, position: 'relative' }}>
            <button
              onClick={() => setEditingTimeline(null)}
              style={{ position: 'absolute', top: 16, right: 20, fontSize: 20, color: 'var(--mute)', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>Chỉnh Sửa Cột Mốc Lịch Sử</h3>
            <form onSubmit={handleSaveEditTimeline} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Năm</label>
                  <input
                    required
                    type="text"
                    value={editingTimeline.year_label}
                    onChange={e => setEditingTimeline({ ...editingTimeline, year_label: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Tiêu đề</label>
                  <input
                    required
                    type="text"
                    value={editingTimeline.title}
                    onChange={e => setEditingTimeline({ ...editingTimeline, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Nội dung</label>
                <textarea
                  rows={3}
                  value={editingTimeline.content}
                  onChange={e => setEditingTimeline({ ...editingTimeline, content: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingTimeline(null)}
                  style={{ flex: 1, background: 'var(--card-2)', color: 'var(--mute)', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT MODAL FOR ORDER ===================== */}
      {editingOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 540, width: '100%', padding: 28, position: 'relative' }}>
            <button
              onClick={() => setEditingOrder(null)}
              style={{ position: 'absolute', top: 16, right: 20, fontSize: 20, color: 'var(--mute)', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)', marginBottom: 6 }}>
              Chi Tiết Đơn Hàng #{editingOrder.order_code}
            </h3>
            <p style={{ color: 'var(--mute)', fontSize: 13, marginBottom: 16 }}>Cập nhật thông tin khách hàng hoặc in ấn theo yêu cầu.</p>

            <form onSubmit={handleSaveEditOrder} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Họ và tên</label>
                  <input
                    type="text"
                    value={editingOrder.fullname}
                    onChange={e => setEditingOrder({ ...editingOrder, fullname: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--mute)' }}>Số điện thoại</label>
                  <input
                    type="text"
                    value={editingOrder.phone}
                    onChange={e => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={editingOrder.address}
                  onChange={e => setEditingOrder({ ...editingOrder, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--gold)' }}>Tên in áo</label>
                  <input
                    type="text"
                    value={editingOrder.custom_name || ''}
                    onChange={e => setEditingOrder({ ...editingOrder, custom_name: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--gold)' }}>Số áo</label>
                  <input
                    type="text"
                    value={editingOrder.custom_number || ''}
                    onChange={e => setEditingOrder({ ...editingOrder, custom_number: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Trạng thái đơn</label>
                <select
                  value={editingOrder.status}
                  onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang in/may</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="completed">Đã hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  style={{ flex: 1, background: 'var(--card-2)', color: 'var(--mute)', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  Lưu Đơn Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT MODAL FOR USER ===================== */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 440, width: '100%', padding: 28, position: 'relative' }}>
            <button
              onClick={() => { setEditingUser(null); setNewPasswordForUser(''); }}
              style={{ position: 'absolute', top: 16, right: 20, fontSize: 20, color: 'var(--mute)', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold)', marginBottom: 6 }}>
              Chỉnh Sửa Tài Khoản {editingUser.username}
            </h3>

            <form onSubmit={handleSaveEditUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Vai trò (Role)</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                >
                  <option value="Staff">Nhân viên (Staff)</option>
                  <option value="Store Manager">Quản lý (Manager)</option>
                  <option value="Super Administrator">Quản trị viên cấp cao</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--mute)' }}>Đổi mật khẩu mới (Bỏ trống nếu giữ nguyên)</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới..."
                  value={newPasswordForUser}
                  onChange={e => setNewPasswordForUser(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { setEditingUser(null); setNewPasswordForUser(''); }}
                  style={{ flex: 1, background: 'var(--card-2)', color: 'var(--mute)', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: 'var(--gold)', color: '#000', padding: '12px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
