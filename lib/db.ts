import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export interface Product {
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

export interface GalleryItem {
  id: string;
  title: string;
  desc: string;
  tag: string;
  category: string;
  image_url: string;
  display_order?: number;
}

export interface Trophy {
  id: string;
  title: string;
  count_label: string;
  years: string;
  desc: string;
  icon: string;
  is_highlight: boolean;
  display_order?: number;
}

export interface TimelineEvent {
  id: string;
  year_label: string;
  title: string;
  content: string;
  is_highlight: boolean;
  display_order?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  size: string;
  version: string;
  quantity: number;
}

export interface Order {
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

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.hytqhapubpatqfkckozk:jXMqqFHHZCpR28ky@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(64) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        version VARCHAR(64) NOT NULL,
        tag VARCHAR(128),
        description TEXT,
        features JSONB,
        image_url TEXT,
        is_featured BOOLEAN DEFAULT false,
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS gallery (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        desc_text TEXT,
        tag VARCHAR(128),
        category VARCHAR(64) NOT NULL,
        image_url TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS trophies (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        count_label VARCHAR(64) NOT NULL,
        years TEXT,
        desc_text TEXT,
        icon VARCHAR(32),
        is_highlight BOOLEAN DEFAULT false,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS timeline (
        id VARCHAR(64) PRIMARY KEY,
        year_label VARCHAR(128) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        is_highlight BOOLEAN DEFAULT false,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        order_code VARCHAR(32) UNIQUE NOT NULL,
        fullname VARCHAR(255) NOT NULL,
        phone VARCHAR(64) NOT NULL,
        address TEXT NOT NULL,
        items JSONB NOT NULL,
        custom_name VARCHAR(128),
        custom_number VARCHAR(32),
        payment_method VARCHAR(64) DEFAULT 'COD',
        total_amount NUMERIC NOT NULL,
        status VARCHAR(64) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Seed default admin user if not exists
    const userRes = await pool.query("SELECT * FROM admin_users WHERE username = 'admin' OR email = 'admin@arsenal.com'");
    if (userRes.rows.length === 0) {
      const defaultHash = bcrypt.hashSync('12345', 10);
      await pool.query(
        "INSERT INTO admin_users (id, username, email, password_hash, role) VALUES ('usr-admin-1', 'admin', 'admin@arsenal.com', $1, 'Super Administrator')",
        [defaultHash]
      );
    }

    // Seed products if empty
    const pCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(pCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (id, name, price, version, tag, description, features, image_url, is_featured, in_stock) VALUES
        ('prod-home', 'Áo Sân Nhà 1886', 890000, 'Home', 'Bản Tiêu Chuẩn', '1 áo chính hãng Sân Nhà, tem bảo chứng chất lượng, giao hàng 1-3 ngày.', '["1 áo chính hãng (Sân Nhà)", "Bảo chứng Adidas chính hãng 100%", "Giao hàng tiêu chuẩn 1–3 ngày", "Miễn phí đổi size 30 ngày"]'::jsonb, '/assets/images/arsenal-home.jpg', false, true),
        ('prod-combo', 'Bộ Sưu Tập Đầy Đủ (2 Áo)', 1590000, 'Combo 2', 'Được Mua Nhiều Nhất', 'Áo sân nhà + sân khách, thêu tên số miễn phí trọn bộ.', '["2 áo (Sân nhà + Sân khách)", "Thêu tên số miễn phí trọn bộ", "Giao nhanh 1–3 ngày", "Đổi form 30 ngày miễn phí", "Tặng kèm móc khóa Arsenal 1886"]'::jsonb, '/assets/images/arsenal-away.jpg', true, true),
        ('prod-collector', 'Collector Edition (Trọn bộ Fan Kit)', 2490000, 'Collector', 'Giới Hạn 500 Bộ', 'Trọn bộ Ultimate Fan Kit kèm Hộp Vali Sưu Tầm lót nhung cao cấp.', '["Trọn bộ Áo đấu + Khăn + Tất + Huy hiệu", "Hộp quà Vali lót nhung sang trọng", "Thêu tên số miễn phí riêng", "Thẻ số hiệu & Kỷ niệm chương độc bản", "Ưu tiên hỗ trợ VIP 24/7"]'::jsonb, '/assets/images/arsenal-collector-box.jpg', false, true);
      `);
    }

    // Seed gallery if empty
    const gCount = await pool.query('SELECT COUNT(*) FROM gallery');
    if (parseInt(gCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO gallery (id, title, desc_text, tag, category, image_url, display_order) VALUES
        ('gal-1', 'Áo Đấu Arsenal Home Kit (Đỏ Truyền Thống & Trắng)', 'Thiết kế kinh điển với sắc đỏ pháo thủ, bo cổ và tay áo viền trắng tuyết sang trọng.', 'Áo Đấu Sân Nhà', 'home', '/assets/images/arsenal-home.jpg', 1),
        ('gal-2', 'Áo Đấu Arsenal Away Kit (Xanh Đêm & Họa Tiết Chevron)', 'Phiên bản sân khách đẳng cấp với phối màu xanh đêm hoàng gia kết hợp hoa văn 3D tinh xảo.', 'Áo Đấu Sân Khách', 'away', '/assets/images/arsenal-away.jpg', 2),
        ('gal-3', 'Logo Giải Đấu Ngoại Hạng Anh 3D & No Room For Racism', 'Patch tay áo ép nổi chất liệu nhung cao cấp chuẩn thi đấu Premier League sắc nét đến từng góc cạnh.', 'Logo Ngoại Hạng Anh', 'pl-badge', '/assets/images/premier-league-badge.jpg', 3),
        ('gal-4', 'Huy Hiệu Arsenal 1886 Victoria Concordia Crescit', 'Biểu tượng di sản lịch sử với khẩu pháo thần công và châm ngôn bất hủ Chiến thắng đến từ sự hòa hợp.', 'Huy hiệu Cổ điển 1886', 'badge', '/assets/images/arsenal-1886-crest.png', 4),
        ('gal-5', 'Logo Thương Hiệu Adidas — Biểu Tượng 3 Sọc Thể Thao', 'Nhà sản xuất trang phục thi đấu chính thức với công nghệ dệt thể thao chuyên nghiệp hàng đầu thế giới.', 'Thương Hiệu Áo Đấu', 'brand', '/assets/images/adidas-logo.png', 5),
        ('gal-6', 'Hộp Quà Vali Collector Box Giới Hạn Sang Trọng', 'Hộp cứng cao cấp bảo quản áo đấu với khóa kim loại mạ vàng và lót nhung đỏ bảo vệ tối đa.', 'Hộp Quà Sưu Tầm', 'package', '/assets/images/arsenal-collector-box.jpg', 6);
      `);
    }

    // Seed trophies if empty
    const tCount = await pool.query('SELECT COUNT(*) FROM trophies');
    if (parseInt(tCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO trophies (id, title, count_label, years, desc_text, icon, is_highlight, display_order) VALUES
        ('tr-invincibles', 'Cúp Vàng Bất Bại (The Invincibles 2003/04)', '1 DUY NHẤT', '2003/04 (49 trận bất bại)', 'Chiếc cúp vàng độc bản duy nhất trong lịch sử 136 năm bóng đá Anh dành riêng cho đội bóng bất bại trọn vẹn 38 vòng đấu.', '🏆', true, 1),
        ('tr-fa-cup', 'Cúp FA (FA Cup — Kỷ Lục Nước Anh)', '14x KỶ LỤC', '1930, 1936, 1950, 1971, 1979, 1993, 1998, 2002, 2003, 2005, 2014, 2015, 2017, 2020', 'CLB giàu thành tích nhất lịch sử giải đấu lâu đời nhất hành tinh với 14 lần nâng cao chiếc cúp bạc danh giá.', '🥇', true, 2),
        ('tr-league', 'Vô Địch Quốc Gia / Ngoại Hạng Anh (First Division & EPL)', '13x VÔ ĐỊCH', '1931, 1933, 1934, 1935, 1938, 1948, 1953, 1971, 1989, 1991, 1998, 2002, 2004', '13 lần thống trị đỉnh cao bóng đá xứ sở sương mù qua nhiều thế hệ pháo thủ vĩ đại.', '👑', false, 3),
        ('tr-shield', 'Siêu Cúp Anh (FA Community Shield)', '18x SIÊU CÚP', '1930, 1931, 1933, 1934, 1938, 1948, 1953, 1991, 1998, 1999, 2002, 2004, 2014, 2015, 2017, 2020, 2023, 2024', '18 lần giương cao Siêu Cúp Anh, mở màn đỉnh cao của các mùa giải bóng đá hoàng gia Anh.', '🛡️', false, 4),
        ('tr-c2', 'Cúp C2 Châu Âu (European Cup Winners Cup)', '1x CHÂU ÂU', '1994 (Thắng Parma 1-0 tại Copenhagen)', 'Vinh quang đỉnh cao lục địa già với chiến thắng quả cảm trước dàn sao Parma hùng mạnh.', '⭐', false, 5),
        ('tr-others', 'Cúp Liên Đoàn & Cúp Hội Chợ Châu Âu (Inter-Cities Fairs Cup)', '3x DANH HIỆU', '1970 (Fairs Cup), 1987, 1993 (League Cup)', 'Những chiếc cúp lịch sử khẳng định vị thế ông lớn bóng đá Anh và châu Âu.', '🎖️', false, 6);
      `);
    }

    // Seed timeline if empty
    const tmCount = await pool.query('SELECT COUNT(*) FROM timeline');
    if (parseInt(tmCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO timeline (id, year_label, title, content, is_highlight, display_order) VALUES
        ('tl-1886', '1886 — Khai Sinh Dial Square', 'Những phát pháo đầu tiên tại xưởng vũ khí Woolwich', 'Nhóm công nhân nhà máy đạn dược Royal Arsenal tại Woolwich (Đông Nam London) thành lập đội bóng Dial Square vào tháng 10/1886, chọn màu áo đỏ thẫm truyền thống từ sự giúp đỡ của Nottingham Forest.', true, 1),
        ('tl-1913', '1913 — Hành Trình Đến Highbury', 'Bắc tiến London và thánh địa huyền thoại Arsenal Stadium', 'CLB chuyển về phía bắc London và định cư tại sân vận động Highbury tráng lệ. Nơi đây trở thành pháo đài bất khả xâm phạm suốt 93 năm lịch sử trước khi chuyển sang Emirates.', false, 2),
        ('tl-1925', '1925–1934 — Kỷ Nguyên Herbert Chapman', 'Cách mạng sơ đồ WM, áo tay trắng và trạm tàu điện Arsenal', 'Huyền thoại Herbert Chapman thay đổi diện mạo bóng đá hiện đại với sơ đồ chiến thuật WM, phát minh số áo trên lưng, biến sắc đỏ - tay trắng thành biểu tượng vĩnh cửu và đổi tên ga tàu điện ngầm thành Arsenal.', false, 3),
        ('tl-1971-89', '1971 & 1989 — Cú Đúp Lịch Sử & Đêm Anfield Huyền Thoại', 'Cú đúp Double 1971 và khoảnh khắc Michael Thomas phút 90+2', 'Năm 1971, Arsenal giành cú đúp VĐQG và FA Cup. Ngày 26/5/1989, bàn thắng kinh điển ở giây cuối cùng của Michael Thomas tại Anfield giúp Arsenal vô địch nghẹt thở sau 18 năm chờ đợi.', false, 4),
        ('tl-1996-04', '1996–2004 — Triều Đại Arsène Wenger & The Invincibles', 'Bóng đá vị nghệ thuật & Kỷ lục 49 trận bất bại vĩnh cửu', 'Giáo sư Arsène Wenger mang đến lối đá tấn công quyến rũ hoa mỹ. Đỉnh cao là mùa giải Ngoại Hạng Anh 2003/04 với Henry, Bergkamp, Vieira, Pires khi Arsenal trở thành đội bóng duy nhất trong lịch sử đăng quang với thành tích bất bại trọn vẹn cả mùa.', true, 5),
        ('tl-now', '2006–Nay — Pháo Đài Emirates & Kỷ Nguyên Tái Thiết', 'Chuyển mình tới SVĐ Emirates và phục hưng dưới thời Mikel Arteta', 'Năm 2006, Arsenal khánh thành SVĐ Emirates hiện đại 60.000 chỗ ngồi. Dưới sự dẫn dắt của HLV Mikel Arteta cùng lứa ngôi sao trẻ Bukayo Saka, Martin Ødegaard, Arsenal đang viết tiếp những chương sử vàng chói lọi trong lòng hàng triệu Gooners toàn cầu.', false, 6);
      `);
    }

    isInitialized = true;
  } catch (err) {
    console.error('Error initializing PostgreSQL tables:', err);
  }
}

// Authentication
export async function authenticateAdminUser(identifier: string, plainPassword: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  await initDb();
  try {
    const res = await pool.query(
      'SELECT * FROM admin_users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)',
      [identifier.trim()]
    );

    if (res.rows.length === 0) {
      return { success: false, error: 'Tài khoản không tồn tại trên hệ thống' };
    }

    const row = res.rows[0];
    const isMatch = bcrypt.compareSync(plainPassword, row.password_hash);

    if (!isMatch) {
      return { success: false, error: 'Mật khẩu không chính xác' };
    }

    return {
      success: true,
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        created_at: row.created_at
      }
    };
  } catch (error: any) {
    return { success: false, error: 'Lỗi xác thực cơ sở dữ liệu: ' + error.message };
  }
}

// Admin Users CRUD
export async function getAdminUsers(): Promise<AdminUser[]> {
  await initDb();
  const res = await pool.query('SELECT id, username, email, role, created_at FROM admin_users ORDER BY created_at ASC');
  return res.rows;
}

export async function createAdminUser(userData: { username: string; email: string; password: string; role?: string }): Promise<AdminUser> {
  await initDb();
  const id = 'usr-' + Date.now();
  const hash = bcrypt.hashSync(userData.password, 10);
  const res = await pool.query(
    'INSERT INTO admin_users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, created_at',
    [id, userData.username, userData.email, hash, userData.role || 'Staff']
  );
  return res.rows[0];
}

export async function updateAdminUser(id: string, userData: { email?: string; password?: string; role?: string }): Promise<AdminUser> {
  await initDb();
  if (userData.password) {
    const hash = bcrypt.hashSync(userData.password, 10);
    const res = await pool.query(
      'UPDATE admin_users SET email = COALESCE($1, email), password_hash = $2, role = COALESCE($3, role) WHERE id = $4 RETURNING id, username, email, role, created_at',
      [userData.email, hash, userData.role, id]
    );
    return res.rows[0];
  } else {
    const res = await pool.query(
      'UPDATE admin_users SET email = COALESCE($1, email), role = COALESCE($2, role) WHERE id = $3 RETURNING id, username, email, role, created_at',
      [userData.email, userData.role, id]
    );
    return res.rows[0];
  }
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  await initDb();
  await pool.query('DELETE FROM admin_users WHERE id = $1', [id]);
  return true;
}

// Products CRUD
export async function getProducts(): Promise<Product[]> {
  await initDb();
  const res = await pool.query('SELECT * FROM products ORDER BY is_featured DESC, price ASC');
  return res.rows.map(r => ({
    id: r.id,
    name: r.name,
    price: Number(r.price),
    version: r.version,
    tag: r.tag,
    description: r.description,
    features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || '[]'),
    image_url: r.image_url,
    is_featured: r.is_featured,
    in_stock: r.in_stock
  }));
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  await initDb();
  const id = product.id || 'prod-' + Date.now();
  await pool.query(
    'INSERT INTO products (id, name, price, version, tag, description, features, image_url, is_featured, in_stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
    [
      id,
      product.name,
      product.price,
      product.version || 'Home',
      product.tag || '',
      product.description || '',
      JSON.stringify(product.features || []),
      product.image_url || '/assets/images/arsenal-home.jpg',
      product.is_featured || false,
      product.in_stock ?? true
    ]
  );
  return { id, ...product } as Product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  await initDb();
  await pool.query(
    'UPDATE products SET name = $1, price = $2, version = $3, tag = $4, description = $5, features = $6, image_url = $7, is_featured = $8, in_stock = $9 WHERE id = $10',
    [
      product.name,
      product.price,
      product.version,
      product.tag,
      product.description,
      JSON.stringify(product.features || []),
      product.image_url,
      product.is_featured,
      product.in_stock,
      id
    ]
  );
  return { id, ...product } as Product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await initDb();
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return true;
}

// Gallery CRUD
export async function getGallery(): Promise<GalleryItem[]> {
  await initDb();
  const res = await pool.query('SELECT * FROM gallery ORDER BY display_order ASC, created_at ASC');
  return res.rows.map(r => ({
    id: r.id,
    title: r.title,
    desc: r.desc_text,
    tag: r.tag,
    category: r.category,
    image_url: r.image_url,
    display_order: r.display_order
  }));
}

export async function createGallery(item: Partial<GalleryItem>): Promise<GalleryItem> {
  await initDb();
  const id = item.id || 'gal-' + Date.now();
  await pool.query(
    'INSERT INTO gallery (id, title, desc_text, tag, category, image_url, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [
      id,
      item.title,
      item.desc || '',
      item.tag || 'CHI TIẾT',
      item.category || 'home',
      item.image_url || '/assets/images/arsenal-home.jpg',
      item.display_order || 99
    ]
  );
  return { id, ...item } as GalleryItem;
}

export async function updateGallery(id: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
  await initDb();
  await pool.query(
    'UPDATE gallery SET title = $1, desc_text = $2, tag = $3, category = $4, image_url = $5, display_order = $6 WHERE id = $7',
    [
      item.title,
      item.desc || '',
      item.tag || 'CHI TIẾT',
      item.category || 'home',
      item.image_url || '/assets/images/arsenal-home.jpg',
      item.display_order || 99,
      id
    ]
  );
  return { id, ...item } as GalleryItem;
}

export async function deleteGallery(id: string): Promise<boolean> {
  await initDb();
  await pool.query('DELETE FROM gallery WHERE id = $1', [id]);
  return true;
}

// Trophies CRUD
export async function getTrophies(): Promise<Trophy[]> {
  await initDb();
  const res = await pool.query('SELECT * FROM trophies ORDER BY display_order ASC, created_at ASC');
  return res.rows.map(r => ({
    id: r.id,
    title: r.title,
    count_label: r.count_label,
    years: r.years,
    desc: r.desc_text,
    icon: r.icon,
    is_highlight: r.is_highlight,
    display_order: r.display_order
  }));
}

export async function createTrophy(trophy: Partial<Trophy>): Promise<Trophy> {
  await initDb();
  const id = trophy.id || 'tr-' + Date.now();
  await pool.query(
    'INSERT INTO trophies (id, title, count_label, years, desc_text, icon, is_highlight, display_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      id,
      trophy.title,
      trophy.count_label,
      trophy.years,
      trophy.desc || '',
      trophy.icon || '🏆',
      trophy.is_highlight || false,
      trophy.display_order || 99
    ]
  );
  return { id, ...trophy } as Trophy;
}

export async function updateTrophy(id: string, trophy: Partial<Trophy>): Promise<Trophy> {
  await initDb();
  await pool.query(
    'UPDATE trophies SET title = $1, count_label = $2, years = $3, desc_text = $4, icon = $5, is_highlight = $6, display_order = $7 WHERE id = $8',
    [
      trophy.title,
      trophy.count_label,
      trophy.years,
      trophy.desc || '',
      trophy.icon || '🏆',
      trophy.is_highlight || false,
      trophy.display_order || 99,
      id
    ]
  );
  return { id, ...trophy } as Trophy;
}

export async function deleteTrophy(id: string): Promise<boolean> {
  await initDb();
  await pool.query('DELETE FROM trophies WHERE id = $1', [id]);
  return true;
}

// Timeline CRUD
export async function getTimeline(): Promise<TimelineEvent[]> {
  await initDb();
  const res = await pool.query('SELECT * FROM timeline ORDER BY display_order ASC, created_at ASC');
  return res.rows.map(r => ({
    id: r.id,
    year_label: r.year_label,
    title: r.title,
    content: r.content,
    is_highlight: r.is_highlight,
    display_order: r.display_order
  }));
}

export async function createTimeline(event: Partial<TimelineEvent>): Promise<TimelineEvent> {
  await initDb();
  const id = event.id || 'tl-' + Date.now();
  await pool.query(
    'INSERT INTO timeline (id, year_label, title, content, is_highlight, display_order) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      id,
      event.year_label,
      event.title,
      event.content || '',
      event.is_highlight || false,
      event.display_order || 99
    ]
  );
  return { id, ...event } as TimelineEvent;
}

export async function updateTimeline(id: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> {
  await initDb();
  await pool.query(
    'UPDATE timeline SET year_label = $1, title = $2, content = $3, is_highlight = $4, display_order = $5 WHERE id = $6',
    [
      event.year_label,
      event.title,
      event.content || '',
      event.is_highlight || false,
      event.display_order || 99,
      id
    ]
  );
  return { id, ...event } as TimelineEvent;
}

export async function deleteTimeline(id: string): Promise<boolean> {
  await initDb();
  await pool.query('DELETE FROM timeline WHERE id = $1', [id]);
  return true;
}

// Orders CRUD
export async function getOrders(): Promise<Order[]> {
  await initDb();
  const res = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return res.rows.map(r => ({
    id: r.id,
    order_code: r.order_code,
    fullname: r.fullname,
    phone: r.phone,
    address: r.address,
    items: Array.isArray(r.items) ? r.items : JSON.parse(r.items || '[]'),
    custom_name: r.custom_name,
    custom_number: r.custom_number,
    payment_method: r.payment_method,
    total_amount: Number(r.total_amount),
    status: r.status,
    created_at: r.created_at
  }));
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  await initDb();
  const id = order.id || 'ord-' + Date.now();
  const order_code = order.order_code || 'ARS-' + Math.floor(100000 + Math.random() * 900000);
  const res = await pool.query(
    'INSERT INTO orders (id, order_code, fullname, phone, address, items, custom_name, custom_number, payment_method, total_amount, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    [
      id,
      order_code,
      order.fullname,
      order.phone,
      order.address,
      JSON.stringify(order.items || []),
      order.custom_name || '',
      order.custom_number || '',
      order.payment_method || 'COD',
      order.total_amount || 0,
      order.status || 'pending'
    ]
  );
  const r = res.rows[0];
  return {
    id: r.id,
    order_code: r.order_code,
    fullname: r.fullname,
    phone: r.phone,
    address: r.address,
    items: Array.isArray(r.items) ? r.items : JSON.parse(r.items || '[]'),
    custom_name: r.custom_name,
    custom_number: r.custom_number,
    payment_method: r.payment_method,
    total_amount: Number(r.total_amount),
    status: r.status,
    created_at: r.created_at
  };
}

export async function updateOrder(id: string, orderData: Partial<Order>): Promise<boolean> {
  await initDb();
  await pool.query(
    'UPDATE orders SET fullname = COALESCE($1, fullname), phone = COALESCE($2, phone), address = COALESCE($3, address), status = COALESCE($4, status), custom_name = COALESCE($5, custom_name), custom_number = COALESCE($6, custom_number) WHERE id = $7',
    [
      orderData.fullname,
      orderData.phone,
      orderData.address,
      orderData.status,
      orderData.custom_name,
      orderData.custom_number,
      id
    ]
  );
  return true;
}

export async function updateOrderStatus(id: string, status: string): Promise<boolean> {
  await initDb();
  await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
  return true;
}

export async function deleteOrder(id: string): Promise<boolean> {
  await initDb();
  await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  return true;
}

// Stats
export async function getStats() {
  await initDb();
  const revRes = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(*) as total_orders FROM orders WHERE status != $1', ['cancelled']);
  const pendRes = await pool.query('SELECT COUNT(*) as pending_orders FROM orders WHERE status = $1', ['pending']);
  const pCount = await pool.query('SELECT COUNT(*) as total_products FROM products');
  const gCount = await pool.query('SELECT COUNT(*) as total_gallery FROM gallery');
  const tCount = await pool.query('SELECT COUNT(*) as total_trophies FROM trophies');
  const uCount = await pool.query('SELECT COUNT(*) as total_users FROM admin_users');

  return {
    total_revenue: Number(revRes.rows[0].total_revenue),
    total_orders: parseInt(revRes.rows[0].total_orders),
    pending_orders: parseInt(pendRes.rows[0].pending_orders),
    total_products: parseInt(pCount.rows[0].total_products),
    total_gallery: parseInt(gCount.rows[0].total_gallery),
    total_trophies: parseInt(tCount.rows[0].total_trophies),
    total_users: parseInt(uCount.rows[0].total_users)
  };
}
