# Status History API

Base URL: `/api/status-history`

Lưu lịch sử thay đổi trạng thái căn hộ, phục vụ thống kê tỷ lệ lấp đầy theo thời gian.

> Tất cả route yêu cầu `Manager`.

---

## Lấy lịch sử trạng thái

```
GET /api/status-history
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| apartmentId | number | Lọc theo căn hộ |

**Ví dụ:**

```
GET /api/status-history?apartmentId=1
```

**Response:** `200`

> API trả lịch sử theo `changedAt` tăng dần.

```json
[
  {
    "id": 1,
    "apartmentId": 1,
    "status": "rented",
    "changedById": 1,
    "changedAt": "2025-01-15T10:00:00.000Z",
    "note": "Cho thuê theo hợp đồng #5"
  },
  {
    "id": 2,
    "apartmentId": 1,
    "status": "maintenance",
    "changedById": 1,
    "changedAt": "2025-06-01T08:00:00.000Z",
    "note": "Bảo trì định kỳ"
  }
]
```

---

## Thêm lịch sử trạng thái

```
POST /api/status-history
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| apartmentId | number | Yes | ID căn hộ |
| status | string | Yes | `available`, `rented`, `maintenance` |
| changedById | number | No | ID manager thay đổi |
| note | string | No | Ghi chú |

**Response:** `201` - Object lịch sử đã tạo
