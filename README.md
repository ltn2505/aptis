# Aptis PRO — Chinh Phục Từ Vựng

Ứng dụng web ôn tập từ vựng theo hướng Aptis (B2): đọc hiểu có chỗ trống kéo-thả, nghe các dạng khớp đáp án / khớp speaker / điền cụm tiếng Anh.

## Công nghệ

- **React 18** + **Vite 6**
- **Tailwind CSS 3**
- **lucide-react** (icon)

## Chạy dự án

```bash
npm install
npm run dev
```

Mở trình duyệt theo URL hiển thị trong terminal (thường `http://localhost:5173`).

### Lệnh khác

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy môi trường phát triển (hot reload) |
| `npm run build` | Build production vào thư mục `dist/` |
| `npm run preview` | Xem bản build production cục bộ |

## Cấu trúc chính

- `index.html` — shell HTML, mount `#root`
- `src/main.jsx` — entry React
- `src/App.jsx` — toàn bộ **dữ liệu bài** (`initialData`) và **giao diện** (Reading / Listening)
- `src/index.css` — Tailwind + style toàn cục

Chỉnh nội dung đề (câu hỏi, đáp án, section) trực tiếp trong `initialData` trong `App.jsx`.

## Tính năng (tóm tắt)

### Reading

- Điền chỗ trống bằng cách **kéo từ kho đáp án** sang ô trống (hoặc click ô sau khi chọn chip).

### Listening

- **Part 1:** Một đáp án / ô; **kho đáp án** cố định bên phải (sticky).
- **Part 2:** Màn hình tham khảo (không kéo thả).
- **Part 3:** Khớp **Man / Woman / Both** theo từng câu; nhiều chủ đề, có biến thể nam/nữ mở lời; màu theo chủ đề.
- **Part 4:** **Chủ đề + câu** tiếng Việt, ô trống là **cụm tiếng Anh** trong kho; layout hai cột giống Part 1.

### Chung

- **Kho từ / đáp án:** mỗi *thẻ* trong kho có `slotId` riêng — **trùng nội dung từ** vẫn kéo được từng thẻ riêng (Reading & Listening).
- **Hoàn thành section:** sau ~**2 giây** tự chuyển **section kế** (hoặc đánh dấu xong ở section cuối của part).

## Build production

```bash
npm run build
```

Thư mục đầu ra: `dist/`. Triển khai như một site tĩnh (GitHub Pages, Netlify, Vite preview, v.v.).

## Giấy phép / dữ liệu

Dự án `private`; nội dung đề mang tính học tập — chỉnh sửa trong `App.jsx` cho khớp đề nghe/đọc thực tế của bạn.
