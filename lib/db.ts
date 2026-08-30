import fs from 'fs';
import path from 'path';

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
  category: 'home' | 'away' | 'pl-badge' | 'badge' | 'brand' | 'package' | string;
  image_url: string;
  display_order: number;
}

export interface Trophy {
  id: string;
  title: string;
  count_label: string;
  years: string;
  desc: string;
  icon: string;
  is_highlight: boolean;
  display_order: number;
}

export interface TimelineEvent {
  id: string;
  year_label: string;
  title: string;
  content: string;
  is_highlight: boolean;
  display_order: number;
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
  payment_method: 'COD' | 'QR_BANKING' | string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled' | string;
  created_at: string;
}

export interface DatabaseSchema {
  products: Product[];
  gallery: GalleryItem[];
  trophies: Trophy[];
  timeline: TimelineEvent[];
  orders: Order[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'arsenal_db.json');

const INITIAL_DATA: DatabaseSchema = {
  products: [
    {
      id: 'prod-home',
      name: 'Áo Sân Nhà 1886',
      price: 890000,
      version: 'Home',
      tag: 'Bản Tiêu Chuẩn',
      description: '1 áo chính hãng Sân Nhà, tem bảo chứng chất lượng, giao hàng 1-3 ngày.',
      features: [
        '1 áo chính hãng (Sân Nhà)',
        'Bảo chứng Adidas chính hãng 100%',
        'Giao hàng tiêu chuẩn 1–3 ngày',
        'Miễn phí đổi size 30 ngày'
      ],
      image_url: '/assets/images/arsenal-home.jpg',
      is_featured: false,
      in_stock: true
    },
    {
      id: 'prod-combo',
      name: 'Bộ Sưu Tập Đầy Đủ (2 Áo)',
      price: 1590000,
      version: 'Combo 2',
      tag: 'Được Mua Nhiều Nhất',
      description: 'Áo sân nhà + sân khách, thêu tên số miễn phí trọn bộ.',
      features: [
        '2 áo (Sân nhà + Sân khách)',
        'Thêu tên số miễn phí trọn bộ',
        'Giao nhanh 1–3 ngày',
        'Đổi form 30 ngày miễn phí',
        'Tặng kèm móc khóa Arsenal 1886'
      ],
      image_url: '/assets/images/arsenal-away.jpg',
      is_featured: true,
      in_stock: true
    },
    {
      id: 'prod-collector',
      name: 'Collector Edition (Trọn bộ Fan Kit)',
      price: 2490000,
      version: 'Collector',
      tag: 'Giới Hạn 500 Bộ',
      description: 'Trọn bộ Ultimate Fan Kit kèm Hộp Vali Sưu Tầm lót nhung cao cấp.',
      features: [
        'Trọn bộ Áo đấu + Khăn + Tất + Huy hiệu',
        'Hộp quà Vali lót nhung sang trọng',
        'Thêu tên số miễn phí riêng',
        'Thẻ số hiệu & Kỷ niệm chương độc bản',
        'Ưu tiên hỗ trợ VIP 24/7'
      ],
      image_url: '/assets/images/arsenal-collector-box.jpg',
      is_featured: false,
      in_stock: true
    }
  ],
  gallery: [
    {
      id: 'gal-1',
      title: 'Áo Đấu Arsenal Home Kit (Đỏ Truyền Thống & Trắng)',
      desc: 'Thiết kế kinh điển với sắc đỏ pháo thủ, bo cổ và tay áo viền trắng tuyết sang trọng.',
      tag: 'Áo Đấu Sân Nhà',
      category: 'home',
      image_url: '/assets/images/arsenal-home.jpg',
      display_order: 1
    },
    {
      id: 'gal-2',
      title: 'Áo Đấu Arsenal Away Kit (Xanh Đêm & Họa Tiết Chevron)',
      desc: 'Phiên bản sân khách đẳng cấp với phối màu xanh đêm hoàng gia kết hợp hoa văn 3D tinh xảo.',
      tag: 'Áo Đấu Sân Khách',
      category: 'away',
      image_url: '/assets/images/arsenal-away.jpg',
      display_order: 2
    },
    {
      id: 'gal-3',
      title: 'Logo Giải Đấu Ngoại Hạng Anh 3D & No Room For Racism',
      desc: 'Patch tay áo ép nổi chất liệu nhung cao cấp chuẩn thi đấu Premier League sắc nét đến từng góc cạnh.',
      tag: 'Logo Ngoại Hạng Anh',
      category: 'pl-badge',
      image_url: '/assets/images/premier-league-badge.jpg',
      display_order: 3
    },
    {
      id: 'gal-4',
      title: 'Huy Hiệu Arsenal 1886 Victoria Concordia Crescit',
      desc: 'Biểu tượng di sản lịch sử với khẩu pháo thần công và châm ngôn bất hủ Chiến thắng đến từ sự hòa hợp.',
      tag: 'Huy hiệu Cổ điển 1886',
      category: 'badge',
      image_url: '/assets/images/arsenal-1886-crest.png',
      display_order: 4
    },
    {
      id: 'gal-5',
      title: 'Logo Thương Hiệu Adidas — Biểu Tượng 3 Sọc Thể Thao',
      desc: 'Nhà sản xuất trang phục thi đấu chính thức với công nghệ dệt thể thao chuyên nghiệp hàng đầu thế giới.',
      tag: 'Thương Hiệu Áo Đấu',
      category: 'brand',
      image_url: '/assets/images/adidas-logo.png',
      display_order: 5
    },
    {
      id: 'gal-6',
      title: 'Hộp Quà Vali Collector Box Giới Hạn Sang Trọng',
      desc: 'Hộp cứng cao cấp bảo quản áo đấu với khóa kim loại mạ vàng và lót nhung đỏ bảo vệ tối đa.',
      tag: 'Hộp Quà Sưu Tầm',
      category: 'package',
      image_url: '/assets/images/arsenal-collector-box.jpg',
      display_order: 6
    }
  ],
  trophies: [
    {
      id: 'tr-invincibles',
      title: 'Cúp Vàng Bất Bại (The Invincibles 2003/04)',
      count_label: '1 DUY NHẤT',
      years: '2003/04 (49 trận bất bại)',
      desc: 'Chiếc cúp vàng độc bản duy nhất trong lịch sử 136 năm bóng đá Anh dành riêng cho đội bóng bất bại trọn vẹn 38 vòng đấu.',
      icon: '🏆',
      is_highlight: true,
      display_order: 1
    },
    {
      id: 'tr-fa-cup',
      title: 'Cúp FA (FA Cup — Kỷ Lục Nước Anh)',
      count_label: '14x KỶ LỤC',
      years: '1930, 1936, 1950, 1971, 1979, 1993, 1998, 2002, 2003, 2005, 2014, 2015, 2017, 2020',
      desc: 'CLB giàu thành tích nhất lịch sử giải đấu lâu đời nhất hành tinh với 14 lần nâng cao chiếc cúp bạc danh giá.',
      icon: '🥇',
      is_highlight: true,
      display_order: 2
    },
    {
      id: 'tr-league',
      title: 'Vô Địch Quốc Gia / Ngoại Hạng Anh (First Division & EPL)',
      count_label: '13x VÔ ĐỊCH',
      years: '1931, 1933, 1934, 1935, 1938, 1948, 1953, 1971, 1989, 1991, 1998, 2002, 2004',
      desc: '13 lần thống trị đỉnh cao bóng đá xứ sở sương mù qua nhiều thế hệ pháo thủ vĩ đại.',
      icon: '👑',
      is_highlight: false,
      display_order: 3
    },
    {
      id: 'tr-shield',
      title: 'Siêu Cúp Anh (FA Community Shield)',
      count_label: '18x SIÊU CÚP',
      years: '1930, 1931, 1933, 1934, 1938, 1948, 1953, 1991, 1998, 1999, 2002, 2004, 2014, 2015, 2017, 2020, 2023, 2024',
      desc: '18 lần giương cao Siêu Cúp Anh, mở màn đỉnh cao của các mùa giải bóng đá hoàng gia Anh.',
      icon: '🛡️',
      is_highlight: false,
      display_order: 4
    },
    {
      id: 'tr-c2',
      title: 'Cúp C2 Châu Âu (European Cup Winners Cup)',
      count_label: '1x CHÂU ÂU',
      years: '1994 (Thắng Parma 1-0 tại Copenhagen)',
      desc: 'Vinh quang đỉnh cao lục địa già với chiến thắng quả cảm trước dàn sao Parma hùng mạnh.',
      icon: '⭐',
      is_highlight: false,
      display_order: 5
    },
    {
      id: 'tr-others',
      title: 'Cúp Liên Đoàn & Cúp Hội Chợ Châu Âu (Inter-Cities Fairs Cup)',
      count_label: '3x DANH HIỆU',
      years: '1970 (Fairs Cup), 1987, 1993 (League Cup)',
      desc: 'Những chiếc cúp lịch sử khẳng định vị thế ông lớn bóng đá Anh và châu Âu.',
      icon: '🎖️',
      is_highlight: false,
      display_order: 6
    }
  ],
  timeline: [
    {
      id: 'tl-1886',
      year_label: '1886 — Khai Sinh Dial Square',
      title: 'Những phát pháo đầu tiên tại xưởng vũ khí Woolwich',
      content: 'Nhóm công nhân nhà máy đạn dược Royal Arsenal tại Woolwich (Đông Nam London) thành lập đội bóng Dial Square vào tháng 10/1886, chọn màu áo đỏ thẫm truyền thống từ sự giúp đỡ của Nottingham Forest.',
      is_highlight: true,
      display_order: 1
    },
    {
      id: 'tl-1913',
      year_label: '1913 — Hành Trình Đến Highbury',
      title: 'Bắc tiến London và thánh địa huyền thoại Arsenal Stadium',
      content: 'CLB chuyển về phía bắc London và định cư tại sân vận động Highbury tráng lệ. Nơi đây trở thành pháo đài bất khả xâm phạm suốt 93 năm lịch sử trước khi chuyển sang Emirates.',
      is_highlight: false,
      display_order: 2
    },
    {
      id: 'tl-1925',
      year_label: '1925–1934 — Kỷ Nguyên Herbert Chapman',
      title: 'Cách mạng sơ đồ WM, áo tay trắng và trạm tàu điện Arsenal',
      content: 'Huyền thoại Herbert Chapman thay đổi diện mạo bóng đá hiện đại với sơ đồ chiến thuật WM, phát minh số áo trên lưng, biến sắc đỏ - tay trắng thành biểu tượng vĩnh cửu và đổi tên ga tàu điện ngầm thành Arsenal.',
      is_highlight: false,
      display_order: 3
    },
    {
      id: 'tl-1971-89',
      year_label: '1971 & 1989 — Cú Đúp Lịch Sử & Đêm Anfield Huyền Thoại',
      title: 'Cú đúp Double 1971 và khoảnh khắc Michael Thomas phút 90+2',
      content: 'Năm 1971, Arsenal giành cú đúp VĐQG và FA Cup. Ngày 26/5/1989, bàn thắng kinh điển ở giây cuối cùng của Michael Thomas tại Anfield giúp Arsenal vô địch nghẹt thở sau 18 năm chờ đợi.',
      is_highlight: false,
      display_order: 4
    },
    {
      id: 'tl-1996-04',
      year_label: '1996–2004 — Triều Đại Arsène Wenger & The Invincibles',
      title: 'Bóng đá vị nghệ thuật & Kỷ lục 49 trận bất bại vĩnh cửu',
      content: 'Giáo sư Arsène Wenger mang đến lối đá tấn công quyến rũ hoa mỹ. Đỉnh cao là mùa giải Ngoại Hạng Anh 2003/04 với Henry, Bergkamp, Vieira, Pires khi Arsenal trở thành đội bóng duy nhất trong lịch sử đăng quang với thành tích bất bại trọn vẹn cả mùa.',
      is_highlight: true,
      display_order: 5
    },
    {
      id: 'tl-now',
      year_label: '2006–Nay — Pháo Đài Emirates & Kỷ Nguyên Tái Thiết',
      title: 'Chuyển mình tới SVĐ Emirates và phục hưng dưới thời Mikel Arteta',
      content: 'Năm 2006, Arsenal khánh thành SVĐ Emirates hiện đại 60.000 chỗ ngồi. Dưới sự dẫn dắt của HLV Mikel Arteta cùng lứa ngôi sao trẻ Bukayo Saka, Martin Ødegaard, Arsenal đang viết tiếp những chương sử vàng chói lọi trong lòng hàng triệu Gooners toàn cầu.',
      is_highlight: false,
      display_order: 6
    }
  ],
  orders: []
};

export function getDb(): DatabaseSchema {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...INITIAL_DATA, ...parsed };
  } catch (error) {
    console.error('Error reading DB:', error);
    return INITIAL_DATA;
  }
}

export function saveDb(data: DatabaseSchema): boolean {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving DB:', error);
    return false;
  }
}
