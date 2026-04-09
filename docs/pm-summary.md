# PM Summary

Tài liệu này dành cho PM không chuyên kỹ thuật, nhằm trả lời 4 câu hỏi:

1. Dự án hiện đã làm được đến đâu
2. Còn những việc gì chưa xong
3. Việc nào cần ưu tiên trước
4. Có thể chia việc cho team theo nhóm nào

## 1. Trạng thái hiện tại

Hệ thống hiện đã ở mức demo khá hoàn chỉnh cho phần nghiệp vụ lõi:
- login, refresh token, logout backend/frontend
- phân quyền route và phân quyền xem tenant/hợp đồng theo từng căn hộ
- bản đồ GIS, chọn tòa nhà, timeline snapshot
- mô hình 3D tòa nhà, xem tầng, căn hộ và popup thông tin
- upload model riêng cho từng tầng, quản trị hotspot indoor, edge topology và tầng ngay tại trang tòa nhà
- trang chi tiết căn hộ với dữ liệu LoD4, layout nội thất và access grant
- quản lý căn hộ, hợp đồng, tenant, thanh toán, người dùng
- dashboard có overview, revenue, occupancy history, snapshot theo mốc thời gian
- error boundary, trang 404, thông báo lỗi thân thiện hơn ở màn hình chính
- giao diện đã được polish thêm cho mobile/tablet ở các trang quan trọng

Ngoài ra:
- tài liệu frontend, backend, user guide, use case status đã được cập nhật nhiều vòng
- test backend/frontend đã vượt mức “nền tảng”, có thêm route test và page/component test
- build backend/frontend đều pass

## 2. Những việc còn lại

Các việc còn lại chủ yếu là nhóm “nâng chất lượng demo”, đặc biệt là đồ họa/render 3D và độ hoàn thiện cuối sản phẩm.

Lưu ý để PM nắm đúng phạm vi:
- nhóm việc “quản trị topology tầng, hotspot local, upload model tầng, bind cửa với căn hộ” đã xong ở mức dùng được
- phần còn thiếu lớn nhất của nhánh 3D hiện nay là `indoor 3D đúng nghĩa trong căn hộ`, chưa phải quản trị dữ liệu tòa nhà nữa

### Nhóm A - Ưu tiên cao nhất

#### 1. Hoàn thiện indoor 3D của căn hộ

Hiện trạng:
- backend đã có dữ liệu không gian, layout nội thất, furniture items
- frontend mới thao tác theo kiểu workspace 2D + dữ liệu 3D ở backend

Thiếu:
- viewer 3D trong căn hộ
- render trực quan `spaces` và `furniture items` trong scene
- kéo thả nội thất trực tiếp trong không gian 3D
- transform controls để move/rotate/scale
- snap/collision trực quan để việc bố trí “thật” hơn

Ý nghĩa với PM:
- đây là nhóm việc đồ họa nổi bật nhất của đề tài
- là phần tạo cảm giác “3D GIS Apartment Management System” đúng nghĩa, không chỉ là app CRUD có thêm model

#### 2. Nâng chất lượng render 3D và đồ họa demo

Hiện trạng:
- đã có building 3D và scene hoạt động
- build frontend có cảnh báo chunk lớn

Thiếu:
- tối ưu hiệu năng render, tách bundle/chunk cho nhóm màn hình 3D nếu cần
- polish ánh sáng, camera, vật liệu, trạng thái floor visibility
- làm ổn hơn việc map mesh căn hộ từ model thực tế
- tăng độ ổn định khi model lỗi hoặc model lớn

Ý nghĩa với PM:
- đây cũng là nhóm việc đồ họa/render, ít “nghiệp vụ” hơn nhưng ảnh hưởng rất mạnh tới cảm giác demo
- giúp sản phẩm nhìn chuyên nghiệp hơn khi trình bày

### Nhóm B - Quan trọng vừa

#### 3. E2E test cho các luồng chính

Hiện trạng:
- unit/integration test đã khá hơn trước
- chưa có E2E test chính thức

Thiếu:
- test đăng nhập -> dashboard
- test map -> building detail -> apartment detail
- test manager CRUD chính

Ý nghĩa với PM:
- giúp tự tin hơn trước demo và nghiệm thu
- hữu ích khi dự án tiếp tục thay đổi nhanh

#### 4. Tối ưu hiệu năng frontend

Hiện trạng:
- app đã build được
- bundle frontend hiện còn lớn ở bản production

Thiếu:
- code splitting/lazy loading cho màn hình 3D và màn hình nặng
- rà lại các phụ thuộc render nặng
- tối ưu trải nghiệm tải trang đầu

Ý nghĩa với PM:
- không nổi bật bằng indoor 3D, nhưng rất tốt cho độ mượt và độ ổn định khi demo

### Nhóm C - Hoàn thiện thêm nếu còn thời gian

#### 5. Dark mode hoặc theme polish

Hiện trạng:
- giao diện hiện đã ổn ở chế độ sáng

Thiếu:
- dark mode đồng bộ
- polish theme nếu team muốn tăng tính thẩm mỹ

#### 6. Audit / logging bảo mật sâu hơn

Hiện trạng:
- auth flow chính đã hoàn thiện

Thiếu:
- audit login/logout nếu muốn hệ thống “enterprise” hơn
- theo dõi sự kiện bảo mật chi tiết hơn

## 3. Thứ tự ưu tiên đề xuất

Nếu mục tiêu là tăng chất lượng demo và giá trị trình bày, nên làm theo thứ tự sau:

### Ưu tiên 1

- Indoor 3D cho căn hộ
- Nâng chất lượng render/đồ họa 3D

Lý do:
- đây là phần khác biệt nhất của đề tài
- tác động trực tiếp đến ấn tượng sản phẩm khi xem demo

### Ưu tiên 2

- E2E test cho luồng chính
- tối ưu hiệu năng frontend, đặc biệt quanh các màn hình 3D

Lý do:
- giúp sản phẩm ổn định hơn khi chuẩn bị nghiệm thu hoặc demo nhiều vòng

### Ưu tiên 3

- dark mode hoặc theme polish
- audit/logging sâu hơn

Lý do:
- tăng độ chỉn chu, nhưng không quan trọng bằng nhóm đồ họa và ổn định hệ thống

## 4. Gợi ý chia việc cho team

### Nhánh 1 - Frontend 3D / Graphics

Phù hợp cho:
- người mạnh React / Three.js / đồ họa

Việc nên giao:
- indoor 3D viewer cho căn hộ
- thao tác furniture trực tiếp trong 3D
- lighting, camera, material, floor isolation
- tối ưu render và tương tác scene

### Nhánh 2 - Frontend nghiệp vụ / UX

Phù hợp cho:
- người mạnh dashboard, layout, trải nghiệm người dùng

Việc nên giao:
- tối ưu hiệu năng frontend ngoài scene 3D
- polish UX ở các màn hình nghiệp vụ
- theme/dark mode nếu có thời gian

### Nhánh 3 - Backend / Platform

Phù hợp cho:
- người mạnh API, DB, auth, performance

Việc nên giao:
- hỗ trợ dữ liệu cho indoor 3D nếu cần mở rộng thêm endpoint
- tối ưu response cho dashboard và scene dữ liệu lớn
- audit/logging bảo mật nếu team muốn làm sâu hơn

### Nhánh 4 - QA / Testing / Demo readiness

Phù hợp cho:
- người có thể viết test và kiểm tra theo use case

Việc nên giao:
- E2E test cho luồng chính
- checklist demo
- rà lại use case theo `docs/usecase-status.md`

## 5. Kế hoạch ngắn hạn đề xuất

### Sprint 1

- indoor 3D viewer cho căn hộ
- render furniture/space trực quan trong scene

Kết quả mong đợi:
- có điểm nhấn công nghệ mạnh nhất của đề tài

### Sprint 2

- transform controls, snap/collision cơ bản
- tối ưu render và bundle cho các màn hình 3D

Kết quả mong đợi:
- scene 3D usable hơn, mượt hơn và dễ demo hơn

### Sprint 3

- E2E test cho luồng chính
- polish theme hoặc audit/logging nếu còn nguồn lực

Kết quả mong đợi:
- sản phẩm ổn định hơn trước khi chốt nghiệm thu

## 6. Kết luận cho PM

Dự án hiện không còn thiếu các luồng nghiệp vụ cốt lõi nữa. Phần cần đầu tư tiếp chủ yếu là:
- đồ họa / render 3D
- indoor 3D đúng nghĩa cho căn hộ
- độ ổn định khi demo qua E2E test và tối ưu hiệu năng

Nếu PM chỉ chọn vài việc quan trọng nhất để phân bổ nguồn lực, nên ưu tiên:
- indoor 3D căn hộ
- tối ưu và polish render 3D
- E2E test cho luồng chính
