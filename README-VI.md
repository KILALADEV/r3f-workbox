# React Three Fiber Hands-on

Tài liệu thực hành (Hands-on) tạo hộp quà mở ra khi nhấp chuột bằng cách sử dụng React Three Fiber (R3F).

Trong bài thực hành này, bạn sẽ xây dựng logic đóng/mở với các hình khối (Geometry) đơn giản trước, sau đó thay thế giao diện bằng mô hình GLB nhưng vẫn giữ nguyên logic đã viết.

## Môi trường yêu cầu

- Node.js 22.12.0 trở lên
- npm (Đi kèm sẵn khi cài Node.js)
- Trình duyệt PC hỗ trợ WebGL (Khuyến nghị dùng Google Chrome)

## Cách khởi chạy project

Chạy lệnh sau để cài đặt các package cần thiết (chỉ cần làm trong lần đầu tiên):

```bash
npm install
```

Khởi chạy server phát triển (Development server):

```bash
npm run dev
```

Mở đường dẫn hiển thị trên terminal (thông thường là http://localhost:4321) bằng trình duyệt.

Để dừng server phát triển, nhấn tổ hợp phím Ctrl + C trên terminal.

## Các thành phần đã được chuẩn bị sẵn ở STEP này

- Canvas của R3F
- Camera cố định (Fixed camera)
- Ánh sáng (Lighting)
- Mặt đất (Ground)
- Mô hình hộp quà dạng GLB
  - Body: Thân hộp
  - Lid: Group bao gồm nắp, dây nơ và nút thắt
- Hộp quà (Present) được tạo bằng Geometry của R3F
- Chuyển đổi trạng thái đóng/mở khi click chuột
- Animation cho Lid (nắp) và Present (quà)

Khi click vào hộp quà, phần thân (Body) sẽ giữ nguyên, còn nắp (Lid) và phần quà (Present) sẽ di chuyển lên trên. Khi click lần nữa, cả hai sẽ trở về vị trí ban đầu.

## Các file chỉnh sửa chính

```text
src/
├─ pages/
│  └─ index.astro
├─ components/
│  └─ GiftScene.tsx
└─ styles/
   └─ global.css
```

File chính bạn sẽ chỉnh sửa trong bài thực hành này là src/components/GiftScene.tsx.

File này chứa scene của R3F và component GiftBox. Trong đó, phần Present (tạo bằng Geometry của R3F) đã được kết hợp với Body và Lid của file GLB.

Cấu hình Astro cũng như file index.astro đã được chuẩn bị xong, nên về cơ bản bạn không cần phải thay đổi chúng.

## Quy trình thực hành (Workflow)

```text
00-start
↓
01-click-open
↓
02-add-present
↓
03-replace-with-glb
```

Đây là phần nội dung chính của bài thực hành:

1. **01-click-open**  
   Dùng sự kiện click để thay đổi trạng thái của hộp quà và tạo animation cho nắp (Lid) di chuyển lên trên.

2. **02-add-present**  
   Thêm món quà vào bên trong hộp và tạo animation cho món quà di chuyển tương ứng theo trạng thái đóng/mở.

3. **03-replace-with-glb**  
   Thay thế hộp quà làm bằng Geometry sang mô hình GLB, đồng thời áp dụng lại chính logic đóng/mở đó.

### BONUS: Customize (Tùy chọn)

`bonus-customize` dành cho những ai hoàn thành sớm hoặc còn thừa thời gian muốn tự do tùy biến thêm.
Bạn không nhất thiết phải làm hết phần này. Hãy tham khảo chi tiết ý tưởng và gợi ý tại [HANDSON.md](./HANDSON.md)

## Công nghệ sử dụng

- Astro
- React
- React Three Fiber
- drei
- three.js
- TypeScript

Dự án này không sử dụng thư viện animation bên ngoài nào khác mà sẽ thực thi bằng chính các tính năng của R3F và React.

## Trải nghiệm thu được sau bài thực hành này

Trong bài thực hành này, đầu tiên bạn sẽ tạo tương tác với các Geometry đơn giản, sau đó mới thay thế bằng mô hình GLB để hoàn thiện giao diện.

Hãy cùng trải nghiệm luồng làm việc thực tế trong R3F: không làm giao diện hoàn chỉnh ngay từ đầu, mà sẽ xây dựng logic trên khối dựng đơn giản trước, rồi phát triển mức độ hiển thị sau.