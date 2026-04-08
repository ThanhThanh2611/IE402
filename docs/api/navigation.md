# Navigation API

Base URL: `/api/navigation`

> API quản lý mạng lưới topology (nodes & edges) của tòa nhà, phục vụ tìm đường 3D (Dijkstra/A*).
> Yêu cầu xác thực (JWT). Không yêu cầu Manager.
> Backend hiện dùng `db.execute(sql\`...\`)` cho một số query raw, nên response của `/edges?floorId=` và `/graph/:buildingId` có thể mang cấu trúc phụ thuộc driver.

---

## Nodes

### Danh sách nodes theo tầng

```
GET /api/navigation/nodes?floorId=1
```

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| floorId | number | Yes | ID tầng |

**Response:** `200` - Mảng nodes (tọa độ tách thành `lng`, `lat`, `z`)

```json
[
  {
    "id": 1,
    "floorId": 1,
    "nodeType": "junction",
    "label": "Sảnh tầng 1",
    "lng": 106.7004,
    "lat": 10.7379,
    "z": 3.5,
    "createdAt": "2026-03-26T...",
    "updatedAt": "2026-03-26T..."
  }
]
```

---

### Chi tiết node

```
GET /api/navigation/nodes/:id
```

**Response:** `200` - Node object | `404` - Không tìm thấy

---

### Tạo node

```
POST /api/navigation/nodes
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| floorId | number | Yes | ID tầng |
| nodeType | string | Yes | `door` / `elevator` / `stairs` / `junction` |
| label | string | No | Nhãn mô tả |
| lng | number | Yes | Kinh độ |
| lat | number | Yes | Vĩ độ |
| z | number | No | Cao độ (mặc định 0) |

**Response:** `201` - Node mới tạo

---

### Cập nhật node

```
PUT /api/navigation/nodes/:id
```

**Body:** Các trường tùy chọn giống POST

**Response:** `200` - Node đã cập nhật | `404`

---

### Xóa node

```
DELETE /api/navigation/nodes/:id
```

**Response:** `200` - `{ "message": "Đã xóa node" }` | `404`

---

## Edges

### Danh sách edges

```
GET /api/navigation/edges
GET /api/navigation/edges?floorId=1
```

**Query params:**

| Param | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| floorId | number | No | Lọc edges có ít nhất 1 node thuộc tầng |

**Response:** `200` - Mảng edges

```json
[
  {
    "id": 1,
    "startNodeId": 1,
    "endNodeId": 2,
    "edgeType": "hallway",
    "distance": "10.00",
    "travelTime": null,
    "isAccessible": true,
    "createdAt": "2026-03-26T...",
    "updatedAt": "2026-03-26T..."
  }
]
```

---

### Chi tiết edge

```
GET /api/navigation/edges/:id
```

**Response:** `200` - Edge object | `404`

---

### Tạo edge

```
POST /api/navigation/edges
```

**Body:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| startNodeId | number | Yes | ID node đầu |
| endNodeId | number | Yes | ID node cuối |
| edgeType | string | No | `hallway` (mặc định) / `stairs` / `elevator` |
| distance | string | Yes | Khoảng cách (m) |
| travelTime | string | No | Thời gian di chuyển (giây) |
| isAccessible | boolean | No | Mặc định `true` |

**Response:** `201` - Edge mới tạo

---

### Cập nhật edge

```
PUT /api/navigation/edges/:id
```

**Body:** Các trường tùy chọn giống POST

**Response:** `200` - Edge đã cập nhật | `404`

---

### Xóa edge

```
DELETE /api/navigation/edges/:id
```

**Response:** `200` - `{ "message": "Đã xóa edge" }` | `404`

---

## Graph Query

### Lấy toàn bộ graph của tòa nhà

```
GET /api/navigation/graph/:buildingId
```

Trả về tất cả nodes và edges thuộc tòa nhà, phục vụ thuật toán tìm đường.

**Response:** `200`

```json
{
  "nodes": "... raw query result từ postgres-js ...",
  "edges": "... raw query result từ postgres-js ..."
}
```

---

## Mô hình dữ liệu

### Node types

| Giá trị | Mô tả |
|---------|-------|
| `door` | Cửa căn hộ (terminal node) |
| `elevator` | Thang máy |
| `stairs` | Cầu thang |
| `junction` | Sảnh/điểm giao cắt |

### Edge types

| Giá trị | Mô tả |
|---------|-------|
| `hallway` | Hành lang cùng tầng |
| `stairs` | Cầu thang liên tầng |
| `elevator` | Thang máy liên tầng |
