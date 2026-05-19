# Hướng Dẫn Cập Nhật Use Cases & Mô Tả ERD - Checkpoint 4

---

## 1. Cập Nhật Phần 2.7 - Use Case Diagram

### 1.1 Cập Nhật Phần 2.7.3 - Danh Sách Use Cases

**Vị trí**: Section "2.7.3 Danh sách Use Cases của hệ thống"

**Hiện tại**: 27 use cases (UC01-UC27)

**Thêm 2 use cases mới**:

#### UC28: Tạo Template từ Layout Hiện Tại

```
UC ID:          UC28
Tên:            Tạo template từ layout hiện tại
Diễn viên:      Manager
Mô tả ngắn:     Manager chọn layout hoàn chỉnh, lưu thành template có tên 
                để tái sử dụng cho các căn hộ cùng loại
Mục tiêu:       Tạo template layout để giảm lặp lại công việc quản lý
                bố cục nội thất cho các căn hộ tương tự
Pre-condition:  - Manager đã đăng nhập
                - Căn hộ có ít nhất 1 layout hoàn chỉnh (có items)
                - Layout này được chọn trong danh sách layouts
Post-condition: Template được lưu vào database
                Template có trạng thái `is_published = FALSE`
Flow chính:
  1. Manager xem danh sách layouts của căn hộ
  2. Manager chọn 1 layout và click "Lưu thành template"
  3. System mở dialog nhập thông tin:
     - Tên template (bắt buộc)
     - Mô tả template (tùy chọn)
  4. Manager nhập tên + mô tả, click "Tạo template"
  5. System xác thực tên (không trùng với template khác trong tòa nhà)
  6. System lưu template vào database:
     - Ghi nhận source_layout_id = layout.id
     - Ghi nhận created_by_id = manager.id
     - Đặt is_published = FALSE (mặc định)
  7. System hiển thị thông báo thành công
Flow ngoại lệ:
  - E1: Tên template trùng trong tòa nhà
    → System cảnh báo "Tên template đã tồn tại"
  - E2: Layout không có items
    → System cảnh báo "Layout không có items nội thất"
Mối quan hệ: Liên quan đến UC17 (Quản lý layout)
```

#### UC29: Áp Dụng Template Tạo Layout Mới

```
UC ID:          UC29
Tên:            Áp dụng template tạo layout mới
Diễn viên:      Manager
Mô tả ngắn:     Manager chọn template layout → tạo layout mới cho căn hộ 
                bằng cách copy tất cả items từ template
Mục tiêu:       Nhanh chóng khởi tạo layout mới cho căn hộ cùng loại
                bằng cách tái sử dụng template đã lưu
Pre-condition:  - Manager đã đăng nhập
                - Căn hộ chưa có layout (hoặc Manager muốn tạo thêm)
                - Tòa nhà có ít nhất 1 published template (is_published=TRUE)
Post-condition: Layout mới được tạo
                Tất cả items từ template được copy vào layout mới
                Layout có trạng thái mặc định `status = 'draft'`
Flow chính:
  1. Manager vào chi tiết căn hộ
  2. Ở phần "Layouts nội thất", Manager click button "Từ template"
  3. System mở dialog "Áp dụng template":
     - Dropdown chọn template (chỉ show templates có is_published=TRUE)
     - Input field nhập tên layout mới (bắt buộc)
  4. Manager chọn template và nhập tên layout, click "Áp dụng"
  5. System xác thực:
     - Template tồn tại
     - Tên layout không trùng (trong căn hộ)
  6. System lấy source_layout_id từ template
  7. System tạo layout mới:
     - INSERT vào furniture_layouts với apartmentId, name, status='draft'
  8. System copy tất cả items từ source layout:
     - SELECT items FROM furniture_items WHERE layoutId = source_layout_id
     - INSERT items vào furniture_items với layoutId = layout_mới.id
     - Giữ nguyên position, rotation, scale, spaceId
  9. System đóng dialog, refresh danh sách layouts
  10. System hiển thị thông báo "Áp dụng template thành công"
Flow ngoại lệ:
  - E1: Tên layout trùng trong căn hộ
    → System cảnh báo "Tên layout đã tồn tại"
  - E2: Template được xóa sau khi Manager chọn
    → System cảnh báo "Template không còn tồn tại"
  - E3: Source layout không có items
    → System vẫn tạo layout rỗng (không items)
Mối quan hệ: Liên quan đến UC17 (Quản lý layout), UC28 (Tạo template)
```

---

### 1.2 Cập Nhật Phần 2.7.2 - Danh Sách Actors

**Vị trí**: Section "2.7.2 Danh sách Actors"

**Hiện tại**: 2 Actors (User, Manager)

**Không cần thêm Actor mới** - cả UC28 & UC29 đều thuộc **Manager**

**Cập nhật mô tả Manager** (nếu cần):
```
Manager: 
- Có quyền quản lý toàn bộ dữ liệu (căn hộ, hợp đồng, người dùng, nội thất)
- Có thể tạo/áp dụng layout templates để quản lý bố cục nội thất
- Có thể tạo, chỉnh sửa, xóa template layouts cho tòa nhà
```

---

### 1.3 Cập Nhật Phần 2.7.4 - Mối Quan Hệ Giữa Các Use Cases

**Vị trí**: Section "2.7.4 Mối quan hệ giữa các Use Case"

**Thêm vào bảng mối quan hệ**:

| UC | Quan Hệ | UC Liên Quan | Mô Tả |
|-------|---------|--------------|-------|
| UC28 | <<extend>> | UC17 | Tạo template là mở rộng của quản lý layout |
| UC29 | <<use>> | UC17 | Áp dụng template sử dụng chức năng tạo layout |
| UC29 | <<use>> | UC28 | Áp dụng template cần có template từ UC28 |

**Hoặc viết bằng chữ**:
```
- UC28 (Tạo template) extends UC17 (Quản lý layout): 
  Tạo template là một chức năng mở rộng của quản lý layout
  
- UC29 (Áp dụng template) uses UC17 (Quản lý layout): 
  Khi áp dụng template, hệ thống tạo layout mới thông qua use case tạo layout
  
- UC29 (Áp dụng template) uses UC28 (Tạo template): 
  Để áp dụng template, trước đó phải có template (tạo qua UC28)
```

---

## 2. Cập Nhật Phần 2.4 - Mô Tả ERD (Bằng Chữ)

### 2.1 Cập Nhật Phần 2.4.1 - Mô Tả Tổng Quan ERD

**Vị trí**: Section "2.4.1 Mô tả tổng quan ERD"

**Thêm đoạn mới vào cuối section** (sau khi mô tả hiện tại):

```markdown
#### Bổ Sung: Thêm Thực Thể Khuôn Mẫu Layout (Furniture Layout Templates)

Ngoài các thực thể chính nêu trên, hệ thống còn bao gồm thực thể 
**furniture_layout_templates** nhằm hỗ trợ tái sử dụng bố cục nội thất:

- **Mục đích**: Lưu các khuôn mẫu (template) bố cục nội thất có thể 
  áp dụng cho nhiều căn hộ cùng loại trong cùng tòa nhà

- **Phạm vi**: Template được quản lý ở cấp tòa nhà (không chia sẻ 
  giữa các tòa nhà khác nhau)

- **Quan hệ**:
  - **1:N với buildings**: Mỗi tòa nhà có nhiều templates
  - **N:1 (optional) với furniture_layouts**: Template được tạo từ 
    1 layout gốc (sourceLayoutId), để tracking nguồn gốc
  - **N:1 với users**: Mỗi template được tạo/cập nhật bởi user cụ thể

- **Tác dụng kinh tế**:
  - Giảm lặp lại công việc: Thay vì tạo layout riêng cho mỗi căn hộ 
    cùng loại, manager tạo 1 template rồi áp dụng cho nhiều căn hộ
  - Đảm bảo nhất quán: Các căn hộ cùng loại sẽ có layout nội thất 
    giống nhau
  - Hỗ trợ quản lý chuẩn: Tòa nhà có thể định nghĩa layout chuẩn 
    cho từng loại căn hộ (1PN, 2PN+1WC, Studio, v.v.)
```

---

### 2.2 Cập Nhật Phần 2.4.4 - Các Mối Quan Hệ Trong ERD

**Vị trí**: Section "2.4.4 Các mối quan hệ trong ERD"

**Thêm đoạn mới vào cuối danh sách mối quan hệ**:

```markdown
#### Mối Quan Hệ Mới: Furniture Layout Templates

**MQH 1: Buildings (1) ← Furniture Layout Templates (N)**
- **Tên**: buildings_has_templates
- **Cardinality**: 1:N
- **Ý nghĩa**: Mỗi tòa nhà có thể có nhiều templates, nhưng mỗi 
  template thuộc về đúng 1 tòa nhà
- **Ràng buộc**: 
  - `furniture_layout_templates.building_id NOT NULL`
  - `furniture_layout_templates.building_id REFERENCES buildings.id`
- **Lý do**: Template là thực thể quản lý ở cấp tòa nhà

**MQH 2: Furniture Layouts (1) ← Furniture Layout Templates (N, optional)**
- **Tên**: furniture_layouts_as_template_source
- **Cardinality**: 1:N (optional)
- **Ý nghĩa**: Mỗi template có thể được tạo từ 1 layout gốc, nhưng 
  không bắt buộc (sourceLayoutId có thể NULL)
- **Ràng buộc**:
  - `furniture_layout_templates.source_layout_id NULL` hoặc 
  - `furniture_layout_templates.source_layout_id REFERENCES furniture_layouts.id`
- **Lý do**: Tracking nguồn gốc template, hỗ trợ quản lý

**MQH 3: Users (1) ← Furniture Layout Templates (N, created_by)**
- **Tên**: users_creates_templates
- **Cardinality**: 1:N
- **Ý nghĩa**: Mỗi template được tạo bởi 1 user (manager)
- **Ràng buộc**: 
  - `furniture_layout_templates.created_by_id REFERENCES users.id`

**MQH 4: Users (1) ← Furniture Layout Templates (N, updated_by)**
- **Tên**: users_updates_templates
- **Cardinality**: 1:N
- **Ý nghĩa**: Mỗi template được cập nhật bởi 1 user (manager)
- **Ràng buộc**: 
  - `furniture_layout_templates.updated_by_id REFERENCES users.id`
```

---

### 2.3 Cập Nhật Phần 2.4.2 - Phân Biệt Users và Tenants

**Vị trí**: Section "2.4.2 Phân biệt users và tenants"

**Cập nhật ghi chú về quyền hạn** (nếu cần):

```markdown
#### Ghi Chú Về Template Management

- **Users (Manager)** có quyền tạo/cập nhật/xóa templates
  → Được ghi nhận qua `created_by_id` và `updated_by_id` 
  trong bảng `furniture_layout_templates`

- **Tenants (Khách thuê)** không thể tạo/sửa template
  → Chỉ có thể xem các template được published (`is_published = TRUE`)
  → Dữ liệu template không liên kết trực tiếp với tenants
```

---

## 3. Cập Nhật Phần 2.5.7 - Mô Tả Chi Tiết Bảng Furniture Layouts & Templates

### 3.1 Vị Trí Cập Nhật

**Vị trí**: Section "2.5.7 Bảng furniture_layouts – Phiên bản bố cục"

**Hiện tại**: Chỉ có mô tả `furniture_layouts`

**Thêm mới**: Section 2.5.7.1 mô tả bảng `furniture_layout_templates`

---

### 3.2 Thêm Section 2.5.7.1 - Bảng Furniture Layout Templates

**Đặt sau phần mô tả furniture_layouts hiện tại**

#### 2.5.7.1 Bảng furniture_layout_templates – Khuôn Mẫu Bố Cục Nội Thất

##### Mục Đích

Lưu trữ các khuôn mẫu bố cục nội thất (layout templates) có thể tái sử dụng cho nhiều căn hộ cùng loại trong cùng một tòa nhà, giúp:
- Giảm lặp lại công việc tạo layout cho các căn hộ tương tự
- Đảm bảo tính nhất quán giữa các căn hộ cùng loại
- Hỗ trợ quản lý chuẩn layout cho từng tòa nhà

##### Phạm Vi Dữ Liệu

- **Scope**: Building-level (mỗi template thuộc 1 tòa nhà)
- **Soft Delete**: Không sử dụng (không có trường `deleted_at`)
- **Ví dụ**: "Template 1PN Studio", "Template 2PN+1WC", "Template Studio Premium"

##### Các Trường Dữ Liệu

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|-----------|----------|---------|-------|
| id | Serial | PK, NOT NULL | ID duy nhất của template |
| building_id | Integer | FK, NOT NULL | ID tòa nhà sở hữu template |
| name | VARCHAR(255) | NOT NULL | Tên template (e.g., "1PN Studio v1") |
| description | TEXT | NULL | Mô tả chi tiết về template này |
| is_published | Boolean | DEFAULT FALSE | Trạng thái công khai (chỉ published templates mới được dùng) |
| source_layout_id | Integer | FK, NULL | ID layout gốc được sao chép làm template (nullable) |
| created_by_id | Integer | FK, NULL | ID user tạo template |
| updated_by_id | Integer | FK, NULL | ID user cập nhật gần nhất |
| created_at | Timestamp | DEFAULT NOW() | Thời gian tạo |
| updated_at | Timestamp | DEFAULT NOW() | Thời gian cập nhật gần nhất |

##### Các Mối Quan Hệ

| Mối Quan Hệ | Loại | Mô Tả |
|-----------|------|-------|
| building_id → buildings.id | N:1 | Mỗi template thuộc 1 tòa nhà |
| source_layout_id → furniture_layouts.id | N:1 (optional) | Template được tạo từ layout nào (cho tracking) |
| created_by_id → users.id | N:1 | Người tạo template |
| updated_by_id → users.id | N:1 | Người cập nhật template |

##### Luồng Sử Dụng

**Tạo Template** (UC28):
1. Manager chọn 1 layout hoàn chỉnh (có đủ furniture items)
2. Click "Lưu thành template"
3. System ghi nhận: `source_layout_id = layout.id`, `is_published = FALSE`
4. Manager nhập tên + mô tả template
5. Dữ liệu được lưu vào bảng

**Áp Dụng Template** (UC29):
1. Manager chọn căn hộ mới
2. Click "Từ template" → chọn template
3. System tìm layout gốc (từ `source_layout_id`)
4. Copy tất cả items từ layout gốc → tạo layout mới cho căn hộ này
5. Các items được duplicate với tọa độ, rotation, scale, kích thước như gốc

**Quản Lý Template**:
- Manager có thể cập nhật thông tin template (name, description, publish status)
- Manager có thể xóa template (không ảnh hưởng đến layouts đã được tạo)
- Chỉ có published templates (`is_published = TRUE`) mới hiện trong dropdown "Từ template"

##### Ví Dụ Dữ Liệu

```sql
-- Template cho căn hộ 1PN Studio
INSERT INTO furniture_layout_templates (
  building_id, name, description, is_published, 
  source_layout_id, created_by_id
) VALUES (
  1, 
  'Template 1PN Studio', 
  'Khuôn mẫu bố cục tiêu chuẩn cho căn hộ 1 phòng ngủ Studio',
  TRUE, 
  42, 
  5
);

-- Template cho căn hộ 2PN + 1WC
INSERT INTO furniture_layout_templates (
  building_id, name, description, is_published, 
  source_layout_id, created_by_id
) VALUES (
  1,
  'Template 2PN+1WC',
  'Bố cục chuẩn cho căn hộ 2 phòng ngủ + 1 phòng vệ sinh',
  TRUE,
  43,
  5
);
```

##### Constraint & Rule

- **UNIQUE**: Một tòa nhà không thể có 2 template cùng tên (`UNIQUE(building_id, name)`)
- **Cascading**: Khi xóa layout gốc, `source_layout_id` không tự xóa (để preserve template history)
- **Published-Only**: Chỉ templates có `is_published = TRUE` mới được hiển thị cho người dùng sử dụng
- **Building-Scope**: Mỗi template tương ứng 1 building, không chia sẻ cross-building

##### Phân Loại Thuộc Tính (GIS Classification)

- **Spatial Attributes**: Không có (template không có thành phần không gian riêng)
- **Temporal Attributes**: `created_at`, `updated_at`, `is_published` (trạng thái có thời gian)
- **Semantic Attributes**: `name`, `description`, `is_published` (mô tả ý nghĩa)
- **Reference Attributes**: `building_id`, `source_layout_id`, `created_by_id`, `updated_by_id`

---

## 4. Kết Hợp Cập Nhật UC & ERD

### 3.1 Đảm Bảo Nhất Quán Giữa UC & ERD

**Kiểm tra các điểm sau**:

- [ ] UC28 & UC29 mô tả workflow tạo & áp dụng template
- [ ] ERD mô tả cấu trúc dữ liệu support workflows này
- [ ] Bảng `furniture_layout_templates` có đầy đủ fields cần cho UC
  - `name` (UC28 bước 3)
  - `description` (UC28 bước 3)
  - `source_layout_id` (UC29 bước 6)
  - `is_published` (UC29 bước 3)
  - `building_id` (UC29 scope)
  - `created_by_id`, `updated_by_id` (audit trail)

### 3.2 Tầm Nhìn Tổng Quát

**Trước khi finalize**:
1. **Phần 2.4** (ERD description): Giải thích cấu trúc dữ liệu template
2. **Phần 2.7** (UC): Giải thích flows tạo & áp dụng template
3. **Phần 2.5** (Bảng): Chi tiết các trường dữ liệu template
4. **Phần 2.8-2.9** (DFD/Sequence): Mô tả luồng dữ liệu & tương tác

---

## 4. Template Text Sẵn Sàng Copy-Paste

### Use Case UC28 (Markdown)

```markdown
#### UC28: Tạo Template Từ Layout Hiện Tại

| Trường | Nội Dung |
|--------|----------|
| **UC ID** | UC28 |
| **Tên** | Tạo template từ layout hiện tại |
| **Diễn viên** | Manager |
| **Mô tả ngắn** | Manager chọn layout hoàn chỉnh, lưu thành template có tên để tái sử dụng cho các căn hộ cùng loại |
| **Mục tiêu** | Tạo template layout để giảm lặp lại công việc quản lý bố cục nội thất cho các căn hộ tương tự |
| **Pre-condition** | Manager đã đăng nhập, Căn hộ có ít nhất 1 layout hoàn chỉnh có items, Layout được chọn trong danh sách |
| **Post-condition** | Template được lưu vào database với is_published = FALSE |
| **Flow chính** | 1. Manager xem danh sách layouts<br>2. Manager click "Lưu thành template"<br>3. System mở dialog nhập tên + mô tả<br>4. Manager nhập và click "Tạo template"<br>5. System xác thực tên (không trùng)<br>6. System lưu template với source_layout_id = layout.id<br>7. Hiển thị thông báo thành công |
| **Flow ngoại lệ** | E1: Tên trùng → Cảnh báo "Tên template đã tồn tại"<br>E2: Layout không có items → Cảnh báo |
| **Mối quan hệ** | Extends UC17 (Quản lý layout) |
```

### Use Case UC29 (Markdown)

```markdown
#### UC29: Áp Dụng Template Tạo Layout Mới

| Trường | Nội Dung |
|--------|----------|
| **UC ID** | UC29 |
| **Tên** | Áp dụng template tạo layout mới |
| **Diễn viên** | Manager |
| **Mô tả ngắn** | Manager chọn template layout → tạo layout mới cho căn hộ bằng copy items từ template |
| **Mục tiêu** | Nhanh chóng khởi tạo layout cho căn hộ cùng loại bằng tái sử dụng template |
| **Pre-condition** | Manager đã đăng nhập, Căn hộ chưa có layout, Tòa nhà có ít nhất 1 published template |
| **Post-condition** | Layout mới được tạo, Items được copy từ template, Layout có status = 'draft' |
| **Flow chính** | 1. Manager vào chi tiết căn hộ<br>2. Click button "Từ template"<br>3. System mở dialog với dropdown template + input tên layout<br>4. Manager chọn template, nhập tên, click "Áp dụng"<br>5. System xác thực<br>6. System lấy source_layout_id từ template<br>7. System tạo layout mới INSERT<br>8. System copy items từ source layout<br>9. System refresh danh sách layouts<br>10. Hiển thị thông báo "Áp dụng template thành công" |
| **Flow ngoại lệ** | E1: Tên trùng → Cảnh báo<br>E2: Template bị xóa → Cảnh báo<br>E3: Source layout rỗng → Tạo layout rỗng |
| **Mối quan hệ** | Uses UC17 (Quản lý layout), Uses UC28 (Tạo template) |
```
