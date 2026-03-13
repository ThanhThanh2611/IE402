# Payments API

Base URL: `/api/payments`

---

## Danh sách thanh toán

```
GET /api/payments
```

**Query params:**

| Param | Type | Mô tả |
|-------|------|-------|
| contractId | number | Lọc theo hợp đồng |

**Ví dụ:**

```
GET /api/payments?contractId=1
```

**Response:** `200`

```json
[
  {
    "id": 1,
    "contractId": 1,
    "amount": "8000000.00",
    "paymentDate": "2025-02-01",
    "status": "paid",
    "note": "Tháng 2/2025",
    "createdAt": "2025-02-01T00:00:00.000Z"
  }
]
```

---

## Chi tiết thanh toán

```
GET /api/payments/:id
```

**Response:** `200` - Object thanh toán

**Lỗi:** `404` - Không tìm thấy

---

## Thêm thanh toán

```
POST /api/payments
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| contractId | number | Yes | ID hợp đồng |
| amount | number | Yes | Số tiền (VND) |
| paymentDate | string | Yes | Ngày thanh toán (YYYY-MM-DD) |
| status | string | No | `paid` (mặc định), `pending`, `overdue` |
| note | string | No | Ghi chú |

**Response:** `201` - Object thanh toán đã tạo

---

## Cập nhật thanh toán

```
PUT /api/payments/:id
```

**Body:** Các field cần cập nhật

**Response:** `200` - Object thanh toán đã cập nhật

**Lỗi:** `404` - Không tìm thấy

---

## Xóa thanh toán

```
DELETE /api/payments/:id
```

**Response:** `200`

```json
{ "message": "Đã xóa thanh toán" }
```

**Lỗi:** `404` - Không tìm thấy
