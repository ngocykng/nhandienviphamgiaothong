# VietTraffic AI

VietTraffic AI là ứng dụng hỗ trợ giám sát giao thông và tư vấn pháp luật giao thông đường bộ Việt Nam. Ứng dụng được xây dựng bằng React, TypeScript, Vite, Express và Google Gemini API.

## Tính năng chính

- **AI Tracking Video**: tải video, mô phỏng/phân tích phương tiện và theo dõi các tình huống giao thông.
- **Tư vấn luật giao thông**: gửi câu hỏi đến Gemini AI để nhận tư vấn theo ngữ cảnh pháp luật Việt Nam.
- **Tra cứu khung mức phạt**: tìm nhanh các hành vi vi phạm và mức phạt được lưu trong dữ liệu của ứng dụng.
- **Kiểm tra vi phạm**: xem thông tin phương tiện, bằng chứng và chi tiết lỗi qua các thành phần giao diện.
- **Tích hợp nguồn tham khảo**: liên kết đến Bộ Công Thương, Cục CSGT và Cổng Dịch vụ công Quốc gia.

## Yêu cầu hệ thống

- Node.js phiên bản 20 trở lên (khuyến nghị bản LTS).
- npm phiên bản đi kèm Node.js.
- Một Gemini API key nếu muốn sử dụng chức năng tư vấn AI.

Kiểm tra phiên bản:

```powershell
node --version
npm --version
```

## Tải mã nguồn

### Cách 1: Tải từ Git

```powershell
git clone <URL_KHO_LUU_TRU>
cd "New folder"
```

Thay `<URL_KHO_LUU_TRU>` bằng URL repository thực tế của dự án.

### Cách 2: Tải file ZIP

1. Tải file ZIP của dự án.
2. Giải nén vào một thư mục tùy ý.
3. Mở PowerShell tại thư mục dự án.

Ví dụ trên Windows:

```powershell
cd "C:\duan\New folder"
```

## Cài đặt

Cài các thư viện phụ thuộc:

```powershell
npm install
```

## Cấu hình Gemini API

Tạo file `.env.local` tại thư mục gốc của dự án. Có thể sao chép file mẫu:

```powershell
Copy-Item .env.example .env.local
```

Mở `.env.local` và thay giá trị mẫu bằng API key của bạn:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

Không chia sẻ API key và không commit file `.env.local` lên repository. File này đã được loại trừ trong `.gitignore`.

## Chạy ở môi trường phát triển

```powershell
npm run dev
```

Sau khi server khởi động, mở:

```text
http://localhost:3000
```

Server phát triển bao gồm cả Express API và Vite middleware. Nếu cổng `3000` đang được sử dụng, hãy dừng tiến trình đang chạy trước khi khởi động lại.

## Kiểm tra và build

Kiểm tra TypeScript:

```powershell
npm run lint
```

Tạo bản build production:

```powershell
npm run build
```

Chạy thử bản build:

```powershell
npm run preview
```

Chạy server:

```powershell
npm start
```

## Tổng quan cấu trúc dự án

```text
New folder/
├── .env.example                 # Mẫu biến môi trường
├── .env.local                   # Khóa cục bộ, không commit
├── .gitignore                   # Các tệp/thư mục loại trừ khỏi Git
├── index.html                   # HTML entry point
├── package.json                 # Dependencies và các npm scripts
├── server.ts                    # Express server, Gemini API và Vite middleware
├── tsconfig.json                # Cấu hình TypeScript
├── vite.config.ts               # Cấu hình Vite, React và Tailwind
├── dist/                        # Sản phẩm sau khi npm run build
└── src/
    ├── App.tsx                  # Component gốc và điều hướng các màn hình
    ├── main.tsx                 # Điểm khởi chạy React
    ├── index.css                # CSS entry point
    ├── components/
    │   ├── LegalConsultant.tsx             # Màn hình tư vấn luật
    │   ├── QuickPenaltyLookup.tsx           # Tra cứu mức phạt
    │   ├── RoboflowSettingsModal.tsx       # Cấu hình Roboflow
    │   ├── TrafficCanvasSimulator.ts       # Mô phỏng giao thông trên canvas
    │   ├── VideoTrackingPlayer.tsx         # Giao diện tracking video
    │   ├── ViolationInspector.tsx           # Kiểm tra thông tin vi phạm
    │   └── ViolationNoticeModal.tsx         # Hiển thị thông báo vi phạm
    ├── data/
    │   ├── presetScenarios.ts              # Các kịch bản giao thông mẫu
    │   └── trafficLaws.ts                   # Dữ liệu luật và mức phạt
    └── types/
        └── traffic.ts                       # Kiểu dữ liệu giao thông
```

## Luồng hoạt động tổng quát

1. `server.ts` đọc biến môi trường và khởi tạo Express cùng Gemini client.
2. Server cung cấp các API tư vấn/phân tích và phục vụ ứng dụng React.
3. `main.tsx` khởi chạy `App.tsx`.
4. `App.tsx` điều hướng giữa ba khu vực:
   - AI Tracking Video
   - Tư Vấn Luật
   - Khung Mức Phạt
5. Các component trong `src/components/` xử lý giao diện và tương tác.
6. Dữ liệu tĩnh được quản lý trong `src/data/`, kiểu dùng chung trong `src/types/`.

## Npm scripts

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy server phát triển |
| `npm run build` | Build ứng dụng production |
| `npm run preview` | Xem thử bản build |
| `npm run lint` | Kiểm tra TypeScript |
| `npm start` | Chạy server |
| `npm run clean` | Xóa thư mục build theo cấu hình script |

## Xử lý lỗi thường gặp

### `npm install` báo lỗi `ERESOLVE`

Đảm bảo đang dùng dependencies mới nhất trong `package.json`, sau đó chạy lại:

```powershell
npm install
```

Dự án sử dụng `esbuild` tương thích với Vite 8. Không nên dùng `--force` hoặc `--legacy-peer-deps` nếu chưa xác định rõ nguyên nhân.

### Cảnh báo thiếu Gemini API key

Kiểm tra các điều kiện sau:

- File `.env.local` nằm đúng thư mục gốc.
- Tên biến là `GEMINI_API_KEY`.
- Đã khởi động lại `npm run dev` sau khi thay đổi file môi trường.

### Cổng 3000 đã được sử dụng

Dừng server cũ đang chạy hoặc giải phóng cổng 3000, sau đó chạy lại `npm run dev`.

## Lưu ý pháp lý

Thông tin tư vấn trong ứng dụng chỉ có tính chất tham khảo, không thay thế ý kiến tư vấn chính thức của luật sư hoặc cơ quan nhà nước có thẩm quyền. Khi xử lý vụ việc thực tế, hãy đối chiếu văn bản pháp luật hiện hành và thông tin từ các cổng chính thức.
