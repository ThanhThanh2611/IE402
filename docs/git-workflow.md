# Quy trình Git

## Quy tắc vàng

> **KHÔNG BAO GIỜ code trực tiếp trên nhánh `main`.**
>
> Mọi thay đổi phải đi qua nhánh riêng → Pull Request → review → merge.

---

## 1. Tạo nhánh mới

Luôn checkout từ `main` mới nhất:

```bash
git checkout main
git pull origin main
git checkout -b <tên-nhánh>
```

### Quy tắc đặt tên nhánh

Format: `<loại>/<mô-tả-ngắn>`

| Loại | Khi nào dùng | Ví dụ |
|---|---|---|
| `feature/` | Làm chức năng mới, use case | `feature/uc01-city-map` |
| `fix/` | Sửa bug | `fix/login-403-error` |
| `docs/` | Cập nhật tài liệu | `docs/api-contracts` |
| `refactor/` | Tái cấu trúc code | `refactor/dashboard-api` |

**Ví dụ theo Use Case:**

```bash
git checkout -b feature/uc01-05-map-gis
git checkout -b feature/uc06-09-3d-model
git checkout -b feature/uc14-17-apartment-crud
git checkout -b feature/uc18-21-contracts
git checkout -b feature/uc22-25-dashboard
git checkout -b feature/uc26-31-user-management
```

---

## 2. Commit

### Quy tắc đặt tên commit

Format: `<loại>: <mô tả ngắn gọn>`

| Loại | Ý nghĩa |
|---|---|
| `feat` | Thêm chức năng mới |
| `fix` | Sửa bug |
| `docs` | Cập nhật tài liệu |
| `style` | Sửa format, CSS (không thay đổi logic) |
| `refactor` | Tái cấu trúc code (không thêm/sửa chức năng) |
| `chore` | Cập nhật config, dependencies |

### Ví dụ

```bash
# Tốt
git commit -m "feat: hiển thị bản đồ GIS với marker tòa nhà"
git commit -m "feat: thêm form tạo hợp đồng thuê"
git commit -m "fix: sửa lỗi không load được danh sách căn hộ"
git commit -m "docs: cập nhật API documentation cho buildings"
git commit -m "style: chỉnh layout sidebar responsive"
git commit -m "refactor: tách component BuildingCard"

# Không tốt
git commit -m "update"
git commit -m "fix bug"
git commit -m "done"
git commit -m "abc"
```

### Lưu ý

- Viết tiếng Việt hoặc tiếng Anh đều được, nhưng **thống nhất** trong 1 nhánh
- Mô tả ngắn gọn, nói rõ **làm gì**, không chỉ nói "sửa" hay "cập nhật"
- Commit thường xuyên, mỗi commit là 1 thay đổi có ý nghĩa (không gom tất cả vào 1 commit khổng lồ)

---

## 3. Đẩy nhánh lên remote

```bash
git push -u origin <tên-nhánh>
```

Ví dụ:

```bash
git push -u origin feature/uc01-05-map-gis
```

---

## 4. Tạo Pull Request

Tạo PR trên GitHub, điền đầy đủ:

- **Title**: mô tả ngắn gọn nhánh làm gì
- **Description**: liệt kê các thay đổi chính, UC liên quan

Ví dụ:

```
Title: Hiển thị bản đồ GIS và vị trí tòa nhà (UC01-05)

## Thay đổi
- Tích hợp MapLibre GL JS hiển thị bản đồ
- Load marker tòa nhà từ API GeoJSON
- Thêm bộ lọc theo quận/huyện, giá thuê
- Hiển thị popup thông tin khi click marker

## UC liên quan
- UC01: Hiển thị bản đồ thành phố
- UC02: Hiển thị vị trí tòa nhà
- UC03: Lọc tòa nhà
- UC05: Chọn tòa nhà
```

---

## 5. Cập nhật code từ main (Rebase)

Khi `main` có code mới (người khác đã merge PR), cần rebase nhánh của mình:

```bash
# Đang ở nhánh của mình
git fetch origin
git rebase origin/main
```

Nếu có **conflict**:

```bash
# 1. Sửa conflict trong các file được báo
# 2. Stage các file đã sửa
git add <file-đã-sửa>

# 3. Tiếp tục rebase
git rebase --continue
```

Nếu muốn hủy rebase (quá nhiều conflict, muốn làm lại):

```bash
git rebase --abort
```

Sau khi rebase xong, push lại nhánh:

```bash
git push --force-with-lease
```

> **Dùng `--force-with-lease`** thay vì `--force` để an toàn hơn (sẽ dừng lại nếu remote có commit mà mình chưa pull).

### Khi nào cần rebase?

- Trước khi tạo PR
- Khi PR báo conflict với `main`
- Khi muốn lấy code mới từ `main` về nhánh mình

---

## 6. Merge PR

- Sau khi review xong → **Merge** PR trên GitHub
- Dùng **Squash and merge** hoặc **Rebase and merge** (không dùng merge commit)
- Sau khi merge → xóa nhánh trên remote

---

## Tóm tắt quy trình

```
main ─────────────────────────────────────────── ← không code ở đây
  │
  ├─ checkout -b feature/uc01-05-map-gis
  │    ├─ commit: "feat: thêm bản đồ GIS"
  │    ├─ commit: "feat: load marker tòa nhà"
  │    ├─ rebase origin/main (nếu main có code mới)
  │    ├─ push -u origin feature/uc01-05-map-gis
  │    └─ Tạo Pull Request → Review → Merge
  │
  ├─ checkout -b feature/uc06-09-3d-model
  │    ├─ commit: "feat: render mô hình 3D"
  │    └─ ...
  │
  └─ ...
```

---

## Lệnh hay dùng

| Lệnh | Mục đích |
|---|---|
| `git status` | Xem trạng thái file |
| `git log --oneline -10` | Xem 10 commit gần nhất |
| `git branch` | Xem nhánh hiện tại |
| `git branch -a` | Xem tất cả nhánh (local + remote) |
| `git stash` | Cất tạm thay đổi chưa commit |
| `git stash pop` | Lấy lại thay đổi đã cất |
| `git diff` | Xem thay đổi chưa stage |
| `git fetch origin` | Lấy thông tin mới từ remote (không merge) |
