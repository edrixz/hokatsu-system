**CHI TIẾT HÀNH ĐỘNG & API COST**

| STT | User Action                                               | API                                    | Pricing Logic                                                                                        | Price (1,000 calls) |          |     |     |
| --- | --------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- | -------- | --- | --- |
|     | **Load trang Web** (F5 hoặc truy cập lần đầu)             | **Maps JavaScript API** (Dynamic Maps) | Tính 1 lần mỗi khi bản đồ hiển thị.                                                                  | ~$7.00              | Thấp     |     |     |
|     | **Gõ tìm kiếm địa chỉ** để thêm mới (Ví dụ: "Ga Shin...") | Places Autocomplete API                | Tính tiền theo "Session" (Phiên). Nếu dùng Session Token, user gõ 10 ký tự cũng chỉ tính là 1 phiên. | ~$2.83              | Rất Thấp |     |     |
