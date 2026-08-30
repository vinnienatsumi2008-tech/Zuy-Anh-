'use client';

import React, { useState, useEffect } from 'react';

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

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  version: string;
  quantity: number;
  image_url: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  
  // UI states
  const [selectedVersion, setSelectedVersion] = useState<'Home' | 'Away'>('Home');
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [galleryCategory, setGalleryCategory] = useState<string>('all');
  const [historyTab, setHistoryTab] = useState<'trophies' | 'timeline' | 'badges'>('trophies');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  
  // Cart & Order
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [orderSuccessCode, setOrderSuccessCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Order Form
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    address: '',
    version: 'Home',
    size: 'L',
    custom_name: '',
    custom_number: '',
    payment_method: 'COD' as 'COD' | 'QR_BANKING'
  });

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 17 });
  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'danger' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    // Load real live data from Supabase PostgreSQL via API
    fetch('/api/products').then(res => res.json()).then(res => { if (res.success && res.data?.length) setProducts(res.data); }).catch(() => {});
    fetch('/api/gallery').then(res => res.json()).then(res => { if (res.success && res.data?.length) setGallery(res.data); }).catch(() => {});
    fetch('/api/trophies').then(res => res.json()).then(res => { if (res.success && res.data?.length) setTrophies(res.data); }).catch(() => {});
    fetch('/api/timeline').then(res => res.json()).then(res => { if (res.success && res.data?.length) setTimeline(res.data); }).catch(() => {});

    // Load Cart from localStorage
    try {
      const saved = localStorage.getItem('arsenal_cart_next');
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {}

    // Countdown tick
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const saveCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('arsenal_cart_next', JSON.stringify(newCart));
    } catch (e) {}
  };

  const handleAddToCart = (productName: string, price: number, version: string, size: string, img: string) => {
    const existingIndex = cart.findIndex(item => item.name === productName && item.version === version && item.size === size);
    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
    } else {
      const newItem: CartItem = {
        id: 'cart-' + Date.now(),
        name: productName,
        price,
        version,
        size,
        quantity: 1,
        image_url: img
      };
      updatedCart = [...cart, newItem];
    }
    saveCartState(updatedCart);
    showToast(`Đã thêm ${productName} (${version} - Size ${size}) vào giỏ!`, 'success');
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    saveCartState(updated);
  };

  const removeFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    saveCartState(updated);
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleQuickBuy = (productName: string, price: number, version: string, size: string) => {
    setFormData(prev => ({ ...prev, version, size }));
    setOrderSuccessCode(null);
    setIsOrderModalOpen(true);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const itemsToOrder = cart.length > 0 ? cart : [
        {
          id: 'single-' + Date.now(),
          name: `Áo Đấu Arsenal 1886 (${formData.version})`,
          price: 890000,
          size: formData.size,
          version: formData.version,
          quantity: 1
        }
      ];

      const total = itemsToOrder.reduce((acc, it) => acc + it.price * it.quantity, 0);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullname,
          phone: formData.phone,
          address: formData.address,
          items: itemsToOrder,
          custom_name: formData.custom_name,
          custom_number: formData.custom_number,
          payment_method: formData.payment_method,
          total_amount: total
        })
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccessCode(data.data.order_code);
        saveCartState([]);
        showToast(`Đặt hàng thành công! Mã đơn: #${data.data.order_code}`, 'success');
      } else {
        showToast('Có lỗi xảy ra khi tạo đơn hàng: ' + (data.error || 'Vui lòng thử lại'), 'danger');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ dữ liệu.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGallery = galleryCategory === 'all' 
    ? gallery 
    : gallery.filter(item => item.category === galleryCategory);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* NAVBAR (WITHOUT ADMIN BUTTON AS REQUESTED) */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: 'rgba(10, 11, 13, 0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)', padding: '14px 24px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/assets/images/arsenal-1886-crest.png" alt="Arsenal 1886" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 20, fontWeight: 900, letterSpacing: '0.05em', color: 'var(--cream)', lineHeight: 1 }}>ARSENAL 1886</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.1em' }}>OFFICIAL KIT COLLECTION</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <a href="#features" style={{ fontSize: 14, fontWeight: 600, color: 'var(--mute)' }}>Đặc quyền</a>
            <a href="#showcase" style={{ fontSize: 14, fontWeight: 600, color: 'var(--mute)' }}>Sản phẩm</a>
            <a href="#gallery" style={{ fontSize: 14, fontWeight: 600, color: 'var(--mute)' }}>Thư viện ảnh</a>
            <a href="#history-honours" style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>Lịch sử & Cúp</a>
            <a href="#pricing" style={{ fontSize: 14, fontWeight: 600, color: 'var(--mute)' }}>Bảng giá</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--card-2)', border: '1px solid var(--line-strong)',
                padding: '8px 16px', borderRadius: 8, color: 'var(--text)', cursor: 'pointer', position: 'relative'
              }}
            >
              <span>🛒 Giỏ hàng</span>
              <span style={{
                background: 'var(--red)', color: '#fff', fontSize: 11, fontWeight: 800,
                padding: '2px 7px', borderRadius: 12
              }}>{cartCount}</span>
            </button>
            <a href="#pricing" style={{
              background: 'var(--red)', color: '#fff', padding: '9px 18px',
              borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer'
            }}>
              Đặt ngay
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={{
        position: 'relative', padding: '90px 24px 70px',
        background: 'radial-gradient(ellipse at 50% -20%, rgba(216, 30, 61, 0.25), transparent 70%), var(--bg)',
        borderBottom: '1px solid var(--line)', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '15%', right: '5%',
          fontFamily: 'Big Shoulders Display', fontSize: 'clamp(140px, 25vw, 320px)',
          fontWeight: 900, color: 'rgba(255, 255, 255, 0.02)', pointerEvents: 'none', userSelect: 'none'
        }}>
          1886
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--red-dim)', border: '1px solid rgba(216, 30, 61, 0.4)',
              color: '#ff6b81', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 20
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
              Chỉ 500 bộ phát hành — Mùa giải 2026/27
            </div>
            <h1 style={{
              fontFamily: 'Big Shoulders Display', fontSize: 'clamp(48px, 6vw, 76px)',
              fontWeight: 900, lineHeight: 1.05, textTransform: 'uppercase', color: 'var(--cream)', marginBottom: 20
            }}>
              Áo đấu<br />cho người<br /><span style={{ color: 'var(--red)' }}>xem thật.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'var(--mute)', lineHeight: 1.6, maxWidth: 520, marginBottom: 32 }}>
              Vải thi đấu chuẩn cầu thủ, form dáng chính xác từng milimet, thêu tên số theo yêu cầu. Đây không phải một chiếc áo phông — đây là tấm vé bước vào Emirates.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="#pricing" style={{
                background: 'var(--red)', color: '#fff', padding: '14px 28px',
                borderRadius: 8, fontWeight: 800, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8
              }}>
                Chọn phiên bản của bạn →
              </a>
              <a href="#gallery" style={{
                background: 'var(--card-2)', border: '1px solid var(--line-strong)',
                color: 'var(--text)', padding: '14px 24px', borderRadius: 8, fontWeight: 700, fontSize: 15
              }}>
                🔍 Xem thư viện ảnh
              </a>
            </div>
          </div>

          {/* Countdown Card */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--line-strong)',
            borderRadius: 16, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: 14 }}>
              Ưu đãi mở bán kết thúc sau
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 42, fontWeight: 900, color: 'var(--cream)', lineHeight: 1 }}>{String(timeLeft.hours).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', marginTop: 4 }}>Giờ</div>
              </div>
              <div style={{ background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 42, fontWeight: 900, color: 'var(--cream)', lineHeight: 1 }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', marginTop: 4 }}>Phút</div>
              </div>
              <div style={{ background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 42, fontWeight: 900, color: 'var(--red)', lineHeight: 1 }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--mute)', textTransform: 'uppercase', marginTop: 4 }}>Giây</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 16, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>4.9 / 5</div>
                <div style={{ fontSize: 11, color: 'var(--mute)' }}>2,140 đánh giá</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cream)' }}>96%</div>
                <div style={{ fontSize: 11, color: 'var(--mute)' }}>đã bán</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cream)' }}>1–3 ngày</div>
                <div style={{ fontSize: 11, color: 'var(--mute)' }}>giao nhanh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stripline */}
        <div style={{
          maxWidth: 1200, margin: '50px auto 0', display: 'flex', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, borderTop: '1px solid var(--line)', paddingTop: 24, fontSize: 14, color: 'var(--mute)'
        }}>
          <div><b style={{ color: 'var(--cream)' }}>Chất liệu</b> · AEROREADY® tái chế</div>
          <div><b style={{ color: 'var(--cream)' }}>Thêu tên số</b> · Miễn phí trọn bộ</div>
          <div><b style={{ color: 'var(--cream)' }}>Bảo hành</b> · Đổi form 30 ngày</div>
          <div><b style={{ color: 'var(--gold)' }}>Bảo chứng</b> · Adidas chính hãng 100%</div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Vì sao chọn bộ sưu tập này</div>
          <h2 style={{ fontFamily: 'Big Shoulders Display', fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 900, color: 'var(--cream)' }}>Từng đường chỉ đều có lý do.</h2>
          <p style={{ color: 'var(--mute)', maxWidth: 600, margin: '10px auto 0', fontSize: 15 }}>Không phải hàng chợ gắn mác. Mỗi chi tiết được kiểm định qua quy trình 6 bước trước khi đến tay bạn.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🦁</div>
            <h4 style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 8, fontWeight: 700 }}>Logo Ngoại Hạng Anh 3D</h4>
            <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.5 }}>Bộ đôi patch tay áo Premier League & No Room For Racism ép nhiệt nhung nổi 3D chuẩn cầu thủ.</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✨</div>
            <h4 style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 8, fontWeight: 700 }}>Thêu tên số cao tần</h4>
            <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.5 }}>In ép nhiệt chuẩn CLB, không bong tróc sau 50 lần giặt. Miễn phí cho mọi đơn hàng.</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📐</div>
            <h4 style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 8, fontWeight: 700 }}>Form dáng chuẩn EU</h4>
            <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.5 }}>Rập form riêng theo số đo cầu thủ, có bảng size chi tiết và tư vấn 1:1 trước khi đặt.</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🚀</div>
            <h4 style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 8, fontWeight: 700 }}>Giao nhanh 1–3 ngày</h4>
            <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.5 }}>Kho hàng nội địa, theo dõi đơn realtime, đóng gói hộp cứng chống móp mép ngực áo.</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>👟</div>
            <h4 style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 8, fontWeight: 700 }}>Thương hiệu Adidas</h4>
            <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.5 }}>Bảo chứng chất lượng chuẩn thể thao quốc tế từ tập đoàn trang phục thi đấu hàng đầu thế giới.</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🛡️</div>
            <h4 style={{ fontSize: 18, color: 'var(--cream)', marginBottom: 8, fontWeight: 700 }}>Đổi form 30 ngày</h4>
            <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.5 }}>Không vừa dáng? Đổi size miễn phí trong 30 ngày, kể cả khi đã thêu tên số riêng.</p>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section id="showcase" style={{ padding: '90px 24px', background: 'var(--bg-elev)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Tương tác trực quan</div>
            <h2 style={{ fontFamily: 'Big Shoulders Display', fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 900, color: 'var(--cream)' }}>Sân Nhà hay Sân Khách?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 40, alignItems: 'center' }}>
            {/* Visual Box */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
              padding: 24, textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: 460,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
            }}>
              <img
                src={selectedVersion === 'Home' ? '/assets/images/arsenal-home.jpg' : '/assets/images/arsenal-away.jpg'}
                alt={`Áo đấu Arsenal ${selectedVersion}`}
                style={{
                  maxHeight: 380, maxWidth: '100%', objectFit: 'contain',
                  borderRadius: 8, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))', transition: 'all 0.3s ease'
                }}
              />
              <div style={{
                position: 'absolute', bottom: 16, left: 16, right: 16,
                display: 'flex', justifyContent: 'center', gap: 12
              }}>
                <button
                  onClick={() => setSelectedVersion('Home')}
                  style={{
                    padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: selectedVersion === 'Home' ? 'var(--red)' : 'var(--card-2)',
                    color: '#fff', border: '1px solid var(--line-strong)'
                  }}
                >
                  🔴 Sân Nhà (Home Kit)
                </button>
                <button
                  onClick={() => setSelectedVersion('Away')}
                  style={{
                    padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: selectedVersion === 'Away' ? 'var(--gold)' : 'var(--card-2)',
                    color: selectedVersion === 'Away' ? '#000' : '#fff', border: '1px solid var(--line-strong)'
                  }}
                >
                  🔵 Sân Khách (Away Kit)
                </button>
              </div>
            </div>

            {/* Product Controls */}
            <div>
              <div style={{
                fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--gold)',
                background: 'var(--gold-dim)', display: 'inline-block', padding: '4px 10px', borderRadius: 6, marginBottom: 12
              }}>
                {selectedVersion === 'Home' ? 'TRUYỀN THỐNG 1886' : 'PHIÊN BẢN HOÀNG GIA'}
              </div>
              <h3 style={{ fontFamily: 'Big Shoulders Display', fontSize: 36, fontWeight: 900, color: 'var(--cream)', marginBottom: 12 }}>
                Áo Đấu Arsenal 1886 ({selectedVersion === 'Home' ? 'Sân Nhà' : 'Sân Khách'})
              </h3>
              <p style={{ color: 'var(--mute)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                {selectedVersion === 'Home' 
                  ? 'Sắc đỏ pháo thủ kinh điển phối tay trắng tuyết, dập nổi huy hiệu Arsenal 1886 hoàng gia và logo Adidas Performance cao cấp.'
                  : 'Sắc xanh đêm phối họa tiết dệt chìm 3D Chevron, logo cỏ 3 lá Adidas Originals mạ vàng hoàng gia độc quyền.'}
              </p>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cream)', marginBottom: 10 }}>Chọn kích cỡ (Size chuẩn EU):</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        width: 44, height: 44, borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: 'pointer',
                        background: selectedSize === size ? 'var(--gold)' : 'var(--card)',
                        color: selectedSize === size ? '#000' : 'var(--text)',
                        border: '1px solid ' + (selectedSize === size ? 'var(--gold)' : 'var(--line-strong)')
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}>
                <span style={{ fontFamily: 'Big Shoulders Display', fontSize: 44, fontWeight: 900, color: 'var(--gold)' }}>890.000đ</span>
                <span style={{ fontSize: 16, color: 'var(--mute-2)', textDecoration: 'line-through' }}>1.250.000đ</span>
                <span style={{ background: 'var(--red-dim)', color: '#ff6b81', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>-28% MỞ BÁN</span>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <button
                  onClick={() => handleAddToCart(
                    `Áo Đấu Arsenal 1886 (${selectedVersion})`,
                    890000,
                    selectedVersion,
                    selectedSize,
                    selectedVersion === 'Home' ? '/assets/images/arsenal-home.jpg' : '/assets/images/arsenal-away.jpg'
                  )}
                  style={{
                    flex: 1, background: 'var(--card-2)', border: '1px solid var(--gold)',
                    color: 'var(--gold)', padding: '14px', borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: 'pointer'
                  }}
                >
                  🛒 Thêm vào giỏ
                </button>
                <button
                  onClick={() => handleQuickBuy(`Áo Đấu Arsenal 1886 (${selectedVersion})`, 890000, selectedVersion, selectedSize)}
                  style={{
                    flex: 1, background: 'var(--red)', border: 'none',
                    color: '#fff', padding: '14px', borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: 'pointer'
                  }}
                >
                  ⚡ Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION (LOADED LIVE FROM SUPABASE) */}
      <section id="gallery" style={{ padding: '90px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Thư viện ảnh chi tiết</div>
          <h2 style={{ fontFamily: 'Big Shoulders Display', fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 900, color: 'var(--cream)' }}>Cận cảnh chất lượng chế tác.</h2>
          <p style={{ color: 'var(--mute)', maxWidth: 600, margin: '10px auto 0', fontSize: 15 }}>Quan sát chi tiết từ thớ vải dệt vi mô, logo Adidas, huy hiệu thêu 3D đến hộp đóng gói sưu tầm.</p>
        </div>

        {/* Gallery Filters */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
          {[
            { id: 'all', label: 'Tất cả (6)' },
            { id: 'home', label: 'Áo Sân Nhà' },
            { id: 'away', label: 'Áo Sân Khách' },
            { id: 'pl-badge', label: 'Badge Ngoại Hạng Anh' },
            { id: 'badge', label: 'Huy Hiệu 1886' },
            { id: 'brand', label: 'Thương Hiệu Adidas' },
            { id: 'package', label: 'Hộp Quà Sưu Tầm' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setGalleryCategory(f.id)}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: galleryCategory === f.id ? 'var(--gold)' : 'var(--card)',
                color: galleryCategory === f.id ? '#000' : 'var(--mute)',
                border: '1px solid ' + (galleryCategory === f.id ? 'var(--gold)' : 'var(--line-strong)')
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {filteredGallery.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setLightboxItem(item)}
              style={{
                background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
                overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s ease'
              }}
            >
              <div style={{ height: 220, background: '#0e1014', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 6 }}
                />
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>{item.tag}</div>
                <h4 style={{ fontSize: 17, color: 'var(--cream)', fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{item.title}</h4>
                <p style={{ fontSize: 13.5, color: 'var(--mute)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HISTORY & TROPHY CABINET SECTION (LOADED LIVE FROM SUPABASE) */}
      <section id="history-honours" style={{
        padding: '90px 24px',
        background: 'radial-gradient(circle at top right, rgba(216,30,61,0.08), transparent 45%), radial-gradient(circle at bottom left, rgba(232,196,104,0.06), transparent 50%), var(--bg-elev)',
        borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Di sản 140 năm vẻ vang (1886 - Nay)</div>
            <h2 style={{ fontFamily: 'Big Shoulders Display', fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 900, color: 'var(--cream)' }}>Lịch sử, Danh hiệu & Kỷ nguyên Hoàng kim.</h2>
            <p style={{ color: 'var(--mute)', maxWidth: 650, margin: '10px auto 0', fontSize: 15 }}>Từ những người thợ pháo binh Royal Arsenal năm 1886 đến biểu tượng bất tử The Invincibles và pháo đài Emirates Stadium.</p>
          </div>

          {/* Key Stats Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px 16px', textAlign: 'center', borderTop: '3px solid var(--gold)' }}>
              <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 48, fontWeight: 900, color: 'var(--gold)' }}>13</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase' }}>Vô Địch Ngoại Hạng Anh</div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px 16px', textAlign: 'center', borderTop: '3px solid var(--red)' }}>
              <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 48, fontWeight: 900, color: 'var(--cream)' }}>14</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase' }}>Cúp FA (Kỷ lục nước Anh)</div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px 16px', textAlign: 'center', borderTop: '3px solid var(--gold)' }}>
              <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 48, fontWeight: 900, color: 'var(--gold)' }}>18x</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase' }}>Siêu Cúp Anh (Shield)</div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '24px 16px', textAlign: 'center', borderTop: '3px solid var(--red)' }}>
              <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 48, fontWeight: 900, color: 'var(--cream)' }}>50</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--mute)', textTransform: 'uppercase' }}>Tổng Danh Hiệu Lớn</div>
            </div>
          </div>

          {/* History Navigation Tabs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 36, borderBottom: '1px solid var(--line)', paddingBottom: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => setHistoryTab('trophies')}
              style={{
                padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                background: historyTab === 'trophies' ? 'var(--gold)' : 'transparent',
                color: historyTab === 'trophies' ? '#000' : 'var(--mute)',
                border: '1px solid ' + (historyTab === 'trophies' ? 'var(--gold)' : 'var(--line-strong)')
              }}
            >
              🏆 Bộ Sưu Tập Cúp (Champions)
            </button>
            <button
              onClick={() => setHistoryTab('timeline')}
              style={{
                padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                background: historyTab === 'timeline' ? 'var(--gold)' : 'transparent',
                color: historyTab === 'timeline' ? '#000' : 'var(--mute)',
                border: '1px solid ' + (historyTab === 'timeline' ? 'var(--gold)' : 'var(--line-strong)')
              }}
            >
              ⏳ Cột Mốc Lịch Sử Ra Đời
            </button>
            <button
              onClick={() => setHistoryTab('badges')}
              style={{
                padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                background: historyTab === 'badges' ? 'var(--gold)' : 'transparent',
                color: historyTab === 'badges' ? '#000' : 'var(--mute)',
                border: '1px solid ' + (historyTab === 'badges' ? 'var(--gold)' : 'var(--line-strong)')
              }}
            >
              🛡️ Huy Hiệu Giải Đấu & CLB
            </button>
          </div>

          {/* TAB 1: TROPHIES */}
          {historyTab === 'trophies' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {trophies.map((tr, idx) => (
                <div
                  key={tr.id || idx}
                  style={{
                    background: tr.is_highlight ? 'linear-gradient(145deg, #1d1912, #111215)' : 'var(--card)',
                    border: '1px solid ' + (tr.is_highlight ? 'rgba(232,196,104,0.5)' : 'var(--line)'),
                    borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 32 }}>{tr.icon}</div>
                      <div style={{
                        fontFamily: 'Big Shoulders Display', fontSize: 24, fontWeight: 900,
                        color: 'var(--gold)', background: 'var(--gold-dim)', padding: '2px 12px', borderRadius: 16, border: '1px solid var(--gold)'
                      }}>
                        {tr.count_label}
                      </div>
                    </div>
                    <h3 style={{ fontSize: 20, color: 'var(--cream)', fontWeight: 800, marginBottom: 8 }}>{tr.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.5, marginBottom: 16 }}>{tr.desc}</p>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11.5, color: 'var(--gold)', borderTop: '1px dashed var(--line)', paddingTop: 12 }}>
                    <b>Năm vô địch:</b> {tr.years}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {historyTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, borderLeft: '2px solid var(--red)', paddingLeft: 24, marginLeft: 12 }}>
              {timeline.map((item, idx) => (
                <div key={item.id || idx} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -33, top: 4, width: 16, height: 16, borderRadius: '50%',
                    background: item.is_highlight ? 'var(--gold)' : 'var(--red)', border: '3px solid var(--bg)'
                  }} />
                  <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 24, fontWeight: 900, color: 'var(--gold)', marginBottom: 4 }}>
                    {item.year_label}
                  </div>
                  <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: '18px 20px' }}>
                    <h4 style={{ fontSize: 18, color: 'var(--cream)', fontWeight: 800, marginBottom: 6 }}>{item.title}</h4>
                    <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.6 }}>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: BADGES */}
          {historyTab === 'badges' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <img src="/assets/images/arsenal-1886-crest.png" alt="Huy hiệu 1886" style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 16px' }} />
                <h4 style={{ fontSize: 17, color: 'var(--cream)', fontWeight: 700, marginBottom: 6 }}>Huy Hiệu Di Sản 1886</h4>
                <p style={{ fontSize: 13, color: 'var(--mute)' }}>Khẩu pháo thần công và châm ngôn Victoria Concordia Crescit.</p>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <img src="/assets/images/premier-league-badge.jpg" alt="Premier League Badge" style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 16px' }} />
                <h4 style={{ fontSize: 17, color: 'var(--cream)', fontWeight: 700, marginBottom: 6 }}>Patch Ngoại Hạng Anh</h4>
                <p style={{ fontSize: 13, color: 'var(--mute)' }}>Logo đầu sư tử 3D và thông điệp No Room For Racism.</p>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <img src="/assets/images/adidas-logo.png" alt="Adidas Logo" style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto 16px', background: '#fff', borderRadius: 6, padding: 8 }} />
                <h4 style={{ fontSize: 17, color: 'var(--cream)', fontWeight: 700, marginBottom: 6 }}>Nhà Chế Tác Adidas</h4>
                <p style={{ fontSize: 13, color: 'var(--mute)' }}>Biểu tượng 3 sọc thể thao bảo chứng chất lượng UEFA.</p>
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 56, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>🏆</div>
                <h4 style={{ fontSize: 17, color: 'var(--cream)', fontWeight: 700, marginBottom: 6 }}>Kỷ Lục 14 Cúp FA</h4>
                <p style={{ fontSize: 13, color: 'var(--mute)' }}>Vinh danh câu lạc bộ giàu thành tích FA Cup nhất nước Anh.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PRICING SECTION (LOADED LIVE FROM SUPABASE) */}
      <section id="pricing" style={{ padding: '90px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Bảng giá</div>
          <h2 style={{ fontFamily: 'Big Shoulders Display', fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 900, color: 'var(--cream)' }}>Chọn đúng gói, không cần đắn đo.</h2>
          <p style={{ color: 'var(--mute)', maxWidth: 500, margin: '10px auto 0', fontSize: 15 }}>Ba lựa chọn rõ ràng, không phí ẩn, miễn phí giao hàng toàn quốc.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {products.map((prod, idx) => (
            <div
              key={prod.id || idx}
              style={{
                background: prod.is_featured ? 'linear-gradient(145deg, #1c1517, #131418)' : 'var(--card)',
                border: '1px solid ' + (prod.is_featured ? 'var(--red)' : 'var(--line)'),
                borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {prod.tag && (
                <div style={{
                  position: 'absolute', top: -12, right: 24,
                  background: prod.is_featured ? 'var(--red)' : 'var(--gold)',
                  color: prod.is_featured ? '#fff' : '#000',
                  fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 12, textTransform: 'uppercase'
                }}>
                  {prod.tag}
                </div>
              )}

              <div>
                <h3 style={{ fontSize: 22, color: 'var(--cream)', fontWeight: 800, marginBottom: 8 }}>{prod.name}</h3>
                <p style={{ fontSize: 14, color: 'var(--mute)', marginBottom: 20 }}>{prod.description}</p>
                <div style={{ fontFamily: 'Big Shoulders Display', fontSize: 44, fontWeight: 900, color: 'var(--gold)', marginBottom: 24 }}>
                  {prod.price.toLocaleString('vi-VN')}đ
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
                  {prod.features && prod.features.map((feat, fIdx) => (
                    <div key={fIdx} style={{ fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--success)' }}>✓</span> {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleAddToCart(prod.name, prod.price, prod.version, selectedSize, prod.image_url)}
                  style={{
                    flex: 1, background: 'var(--card-2)', border: '1px solid var(--line-strong)',
                    color: 'var(--text)', padding: '12px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  🛒 Thêm giỏ
                </button>
                <button
                  onClick={() => handleQuickBuy(prod.name, prod.price, prod.version, selectedSize)}
                  style={{
                    flex: 1, background: prod.is_featured ? 'var(--red)' : 'var(--gold)',
                    color: prod.is_featured ? '#fff' : '#000', border: 'none',
                    padding: '12px', borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: 'pointer'
                  }}
                >
                  Đặt gói này
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER (NO ADMIN BUTTON) */}
      <footer style={{ background: '#07080a', borderTop: '1px solid var(--line)', padding: '60px 24px 40px', color: 'var(--mute)', fontSize: 14 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/assets/images/arsenal-1886-crest.png" alt="Arsenal 1886" style={{ width: 28, height: 28 }} />
            <span style={{ color: 'var(--cream)', fontWeight: 800, fontFamily: 'Big Shoulders Display', fontSize: 18 }}>ARSENAL 1886 COLLECTION</span>
          </div>
          <div>© 2026 Arsenal 1886 Heritage Edition. All Rights Reserved.</div>
        </div>
      </footer>

      {/* LIGHTBOX MODAL */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 760, width: '100%', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 24, textAlign: 'center', position: 'relative' }}
          >
            <button
              onClick={() => setLightboxItem(null)}
              style={{ position: 'absolute', top: 12, right: 16, fontSize: 24, color: 'var(--mute)', cursor: 'pointer' }}
            >
              ✕
            </button>
            <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <img src={lightboxItem.image_url} alt={lightboxItem.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>{lightboxItem.tag}</div>
            <h3 style={{ fontSize: 22, color: 'var(--cream)', fontWeight: 800, marginBottom: 8 }}>{lightboxItem.title}</h3>
            <p style={{ color: 'var(--mute)', fontSize: 15, lineHeight: 1.5 }}>{lightboxItem.desc}</p>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setIsCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 440, height: '100%', background: 'var(--card)',
            borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column', zIndex: 3001
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--cream)' }}>Giỏ hàng của bạn ({cartCount})</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ fontSize: 20, color: 'var(--mute)', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--mute)', marginTop: 80 }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
                  <p>Giỏ hàng đang trống</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 14, background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 10, padding: 12 }}>
                    <img src={item.image_url} alt={item.name} style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 6, background: '#111' }} />
                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontSize: 14, fontWeight: 700, color: 'var(--cream)' }}>{item.name}</h5>
                      <div style={{ fontSize: 12, color: 'var(--gold)', margin: '2px 0' }}>Size: {item.size} | {item.version}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--cream)' }}>{item.price.toLocaleString('vi-VN')}đ</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <button onClick={() => removeFromCart(idx)} style={{ color: 'var(--red)', fontSize: 12, cursor: 'pointer' }}>Xóa</button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card)', borderRadius: 4, padding: '2px 6px' }}>
                        <button onClick={() => updateQuantity(idx, -1)} style={{ cursor: 'pointer', color: 'var(--mute)', fontWeight: 800 }}>-</button>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} style={{ cursor: 'pointer', color: 'var(--mute)', fontWeight: 800 }}>+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: 24, borderTop: '1px solid var(--line)', background: 'var(--card-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ color: 'var(--mute)' }}>Tổng cộng:</span>
                  <span style={{ fontFamily: 'Big Shoulders Display', fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>
                    {cartTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setOrderSuccessCode(null); setIsOrderModalOpen(true); }}
                  style={{
                    width: '100%', background: 'var(--red)', color: '#fff', padding: '14px',
                    borderRadius: 8, fontWeight: 800, fontSize: 16, cursor: 'pointer'
                  }}
                >
                  Tiến hành đặt hàng →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL (SAVES DIRECTLY TO SUPABASE) */}
      {isOrderModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3500, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
            <button
              onClick={() => setIsOrderModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 20, fontSize: 20, color: 'var(--mute)', cursor: 'pointer' }}
            >
              ✕
            </button>

            {orderSuccessCode ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontFamily: 'Big Shoulders Display', fontSize: 32, fontWeight: 900, color: 'var(--gold)', marginBottom: 8 }}>
                  ĐẶT HÀNG THÀNH CÔNG!
                </h3>
                <p style={{ color: 'var(--mute)', fontSize: 15, marginBottom: 20 }}>
                  Cảm ơn bạn đã lựa chọn bộ sưu tập Arsenal 1886. Đơn hàng của bạn đã được ghi nhận trực tiếp vào hệ thống.
                </p>
                <div style={{
                  background: 'var(--card-2)', border: '1px dashed var(--gold)',
                  borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 18, fontWeight: 800, color: 'var(--cream)'
                }}>
                  Mã đơn hàng: #{orderSuccessCode}
                </div>
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  style={{ background: 'var(--red)', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
                >
                  Xong
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontFamily: 'Big Shoulders Display', fontSize: 28, fontWeight: 900, color: 'var(--cream)', marginBottom: 6 }}>
                  THÔNG TIN ĐẶT HÀNG
                </h3>
                <p style={{ color: 'var(--mute)', fontSize: 14, marginBottom: 20 }}>Điền thông tin nhận hàng và yêu cầu in ấn tên/số riêng.</p>

                <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Họ và tên *</label>
                    <input
                      required
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullname}
                      onChange={e => setFormData({ ...formData, fullname: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Số điện thoại *</label>
                      <input
                        required
                        type="tel"
                        placeholder="0912 345 678"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Kích cỡ (Size) *</label>
                      <select
                        value={formData.size}
                        onChange={e => setFormData({ ...formData, size: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                      >
                        <option value="S">Size S (50-60kg)</option>
                        <option value="M">Size M (60-70kg)</option>
                        <option value="L">Size L (70-80kg)</option>
                        <option value="XL">Size XL (80-90kg)</option>
                        <option value="XXL">Size XXL (&gt;90kg)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Địa chỉ nhận hàng *</label>
                    <input
                      required
                      type="text"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 6, color: '#fff' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--card-2)', padding: 12, borderRadius: 8, border: '1px dashed var(--line-strong)' }}>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--gold)', display: 'block', marginBottom: 4 }}>In tên riêng (Miễn phí)</label>
                      <input
                        type="text"
                        placeholder="VD: SAKA, HENRY"
                        value={formData.custom_name}
                        onChange={e => setFormData({ ...formData, custom_name: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 4, color: '#fff' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: 'var(--gold)', display: 'block', marginBottom: 4 }}>In số áo (Miễn phí)</label>
                      <input
                        type="text"
                        placeholder="VD: 7, 14"
                        value={formData.custom_number}
                        onChange={e => setFormData({ ...formData, custom_number: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 4, color: '#fff' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mute)', display: 'block', marginBottom: 6 }}>Phương thức thanh toán</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 6, cursor: 'pointer',
                        background: formData.payment_method === 'COD' ? 'var(--red-dim)' : 'var(--card-2)',
                        border: '1px solid ' + (formData.payment_method === 'COD' ? 'var(--red)' : 'var(--line)')
                      }}>
                        <input
                          type="radio"
                          name="pm"
                          checked={formData.payment_method === 'COD'}
                          onChange={() => setFormData({ ...formData, payment_method: 'COD' })}
                        />
                        <span style={{ fontSize: 13 }}>Thanh toán COD</span>
                      </label>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 6, cursor: 'pointer',
                        background: formData.payment_method === 'QR_BANKING' ? 'var(--gold-dim)' : 'var(--card-2)',
                        border: '1px solid ' + (formData.payment_method === 'QR_BANKING' ? 'var(--gold)' : 'var(--line)')
                      }}>
                        <input
                          type="radio"
                          name="pm"
                          checked={formData.payment_method === 'QR_BANKING'}
                          onChange={() => setFormData({ ...formData, payment_method: 'QR_BANKING' })}
                        />
                        <span style={{ fontSize: 13 }}>Chuyển khoản QR</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      marginTop: 10, background: 'var(--red)', color: '#fff', padding: '14px',
                      borderRadius: 8, fontWeight: 800, fontSize: 16, cursor: isSubmitting ? 'not-allowed' : 'pointer', border: 'none',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'Đang gửi đơn hàng...' : 'Xác nhận đặt hàng →'}
                  </button>
                </form>
              </div>
            )}
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
