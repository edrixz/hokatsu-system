🗺️ PROJECT ROADMAP: HOKATSU MAP MANAGER
📅 PHASE 1: FOUNDATION & SETUP (Khởi tạo & Kết nối)
Mục tiêu: Dựng khung dự án, thiết lập cơ sở dữ liệu và hiển thị bản đồ cơ bản.

1.1. Environment Setup

Khởi tạo Project Nuxt 3 (TypeScript).

Cài đặt Stack: tailwindcss, shadcn-nuxt, @nuxtjs/supabase, vue3-google-map.

Cấu hình .env: Google Maps API Key, Supabase URL/Key.

1.2. Database Engineering

Thực thi SQL Script (Schema v2) trên Supabase.

Thiết lập Storage Bucket school-images & Policy Public.

Tạo file type definition types/school.ts khớp với DB.

1.3. Base UI Layout

Xây dựng Layout 2 cột: Sidebar (List & Controls) - Map Container (Full height).

Tích hợp Google Map Component, center mặc định tại khu vực sinh sống (Set cứng ban đầu).

Kết nối Supabase: Fetch danh sách địa điểm (đang rỗng) và log ra console để test kết nối.

✅ Kết quả (Deliverable): Web App chạy được trên Localhost, thấy bản đồ Google Map, kết nối DB thành công.

🏗️ PHASE 2: SMART DATA ENTRY (Nhập liệu Thông minh)
Mục tiêu: Thêm các địa điểm quan trọng (Nhà, Công ty, Trường học) với vị trí chính xác tuyệt đối.

2.1. Google Autocomplete Integration

Tạo Input Search Address trong Sidebar.

Logic: User chọn địa chỉ gợi ý -> Map pan tới vị trí đó -> Cắm Marker tạm thời.

2.2. Precision Pinning (Quan trọng cho Nhật)

Bật tính năng draggable cho Marker tạm thời.

UX: User kéo Marker từ giữa block nhà (Google default) ra đúng cổng trường/cổng nhà -> Lấy toạ độ chính xác (lat, lng).

2.3. CRUD Operations

Form Thêm mới:

Nhập tên, chọn Category (Home, Work, Public, Private...).

Upload ảnh (lưu vào Supabase Storage).

Logic hiển thị Marker:

Marker Nhà 🏠 (Icon riêng).

Marker Công ty 🏢 (Icon riêng).

Marker Trường 🏫 (Màu theo loại: Xanh, Vàng, Tím...).

Edit/Delete: Chức năng sửa thông tin và xóa địa điểm.

✅ Kết quả (Deliverable): Bạn có thể tạo bản đồ cá nhân với Nhà, Công ty và các Trường học xung quanh. Vị trí chính xác từng mét.

🚦 PHASE 3: INTELLIGENT ROUTING (Tính toán Lộ trình)
Mục tiêu: Trả lời câu hỏi "Đi từ Nhà/Công ty đến trường này mất bao lâu?".

3.1. Origin Selector (Chọn điểm xuất phát)

Tạo Dropdown/Radio ở đầu Sidebar: "Tính từ đâu?".

Logic: Tự động lọc các địa điểm có category là Home hoặc Work để nạp vào Dropdown này.

3.2. Batch Calculation (Distance Matrix)

Viết Composable useRouteCalculator.

Logic: Lấy toạ độ Origin đã chọn -> Gọi API Distance Matrix tới tất cả các School.

Loại trừ: Không tính khoảng cách từ Nhà đến Nhà hoặc Công ty đến Công ty.

Display: Hiển thị thời gian (phút) và khoảng cách (km) ngay trên Card của từng trường trong Sidebar.

3.3. Visual Routing (Directions Service)

Sự kiện: Click vào một trường cụ thể.

Action: Gọi API Directions -> Vẽ đường line màu xanh nối từ Origin đang chọn đến Trường đó.

Panel Info: Hiện chi tiết các bước đi (nếu cần).

✅ Kết quả (Deliverable): Dashboard hiển thị thời gian di chuyển hàng loạt. Click vào trường nào thấy đường đi tới trường đó.

📊 PHASE 4: HOKATSU ANALYTICS (So sánh & Xếp hạng)
Mục tiêu: Quản lý dữ liệu chuyên sâu để ra quyết định nộp hồ sơ (Hokatsu).

4.1. Ranking System

UI: Input nhập số thứ tự nguyện vọng (1, 2, 3...) cho từng trường.

Sort: Nút "Sắp xếp theo nguyện vọng" để đẩy trường ưng ý lên đầu list.

Visual: Hiển thị số Badge (❶, ❷...) trên Marker bản đồ.

4.2. Capacity & Vacancy Manager (JSONB)

UI nhập liệu dạng bảng (Matrix):

Cột: 0 tuổi, 1 tuổi, 2 tuổi...

Hàng: Tổng chỉ tiêu (Teiin) & Số chỗ trống (Aki).

Logic: Tính tổng chỉ tiêu tự động. Highlight màu đỏ nếu Aki = 0.

4.3. Detailed Comparison Fields

Form nhập chi tiết: Giờ mở cửa, Giờ làm thêm, Tuổi nhận trẻ (57 ngày/6 tháng).

Tags System: Checkbox các tiện ích (Mang bỉm về, Có chỗ để xe đẩy, Có sân chơi...).

✅ Kết quả (Deliverable): Biến App thành công cụ quản lý hồ sơ Hokatsu. So sánh được trường nào còn chỗ, trường nào phù hợp nhất để điền đơn.

📱 PHASE 5: UX REFINEMENT (Tối ưu Trải nghiệm)
Mục tiêu: Tiện dụng khi đi thực địa (dùng trên điện thoại).

5.1. Mobile Responsiveness

Chuyển Sidebar thành Drawer (Menu trượt từ dưới lên hoặc từ trái sang) trên mobile.

Tối ưu vùng bấm (Touch targets) cho ngón tay cái.

5.2. Advanced Filters

Bộ lọc: "Chỉ hiện trường Công lập", "Chỉ hiện trường còn slot", "Ẩn các trường Rank thấp".

5.3. Data Backup

Tính năng "Export JSON": Tải toàn bộ data về máy tính để lưu trữ dự phòng.
