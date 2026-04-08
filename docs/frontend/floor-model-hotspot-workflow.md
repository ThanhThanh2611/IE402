# Quy trình chuẩn bị model tầng 3D và hotspot cho trang `/buildings/:id`

## Mục đích

Tài liệu này dùng cho task làm dữ liệu và cấu hình để màn hình chi tiết tòa nhà hoạt động đúng ở chế độ:

- `3D tổng quan`
- `Mặt sàn theo tầng`
- hotspot `door`
- hotspot `elevator`
- hotspot `stairs`

Mục tiêu cuối cùng là:

1. chọn được từng tầng
2. xem được model riêng của tầng
3. thấy đúng vị trí thang máy, cầu thang, cửa căn hộ
4. bấm vào cửa để mở căn hộ
5. bấm vào thang máy hoặc cầu thang để chuyển tầng

---

## 1. Trang này đang hoạt động theo logic nào

Trang [BuildingDetailPage.tsx](D:\Workspace\IE402\frontend\src\pages\BuildingDetailPage.tsx) có 2 chế độ:

- `3D tổng quan`
  - dùng `buildings.model3dUrl`
- `Mặt sàn theo tầng`
  - dùng `floors.model3dUrl`
  - nếu chưa có model tầng nhưng có hotspot local thì sẽ dùng scene thử nghiệm để test hotspot

Điều này có nghĩa là:

- upload model cho `building` chỉ phục vụ xem toàn cảnh
- muốn `Mặt sàn theo tầng` render model thật thì phải có `floors.model3dUrl`

---

## 2. Một hotspot cần có các giá trị gì

Mỗi hotspot là một bản ghi trong bảng `navigation_nodes`.

Các trường quan trọng nhất cho phần render:

| Trường | Bắt buộc | Ý nghĩa |
|---|---|---|
| `floorId` | Có | Hotspot thuộc tầng nào |
| `nodeType` | Có | Loại hotspot: `door`, `elevator`, `stairs`, `junction` |
| `label` | Nên có | Tên dễ đọc trên UI |
| `location` | Có | Tọa độ GIS/PostGIS của node |
| `localX` | Có với hotspot render | Tọa độ local X trong scene 3D của tầng |
| `localY` | Có với hotspot render | Tọa độ local Y trong scene 3D của tầng |
| `localZ` | Có với hotspot render | Tọa độ local Z trong scene 3D của tầng |
| `meshRef` | Nên có | Tên marker/object trong model hoặc tên quy ước để dễ map |
| `metadata` | Không bắt buộc | Dữ liệu phụ |

Nếu muốn hotspot hiện và bấm được trên model tầng, tối thiểu cần:

- `nodeType`
- `floorId`
- `localX`
- `localY`
- `localZ`

---

## 3. Ý nghĩa từng loại hotspot

### `door`

Dùng để biểu diễn cửa căn hộ hoặc cửa phòng.

Khi bấm vào:

- FE sẽ cố mở popup căn hộ
- nếu node đó map tới `apartmentId` thì có thể đi thẳng tới căn hộ tương ứng

Nên dùng khi:

- muốn bấm trực tiếp vào căn hộ từ model tầng

### `elevator`

Dùng cho thang máy.

Khi bấm vào:

- FE tìm tất cả các tầng reachable qua graph `edgeType = elevator`
- hiện popup chọn tầng

Nên dùng khi:

- muốn nhảy nhiều tầng bằng cùng một trục thang máy

### `stairs`

Dùng cho thang bộ.

Khi bấm vào:

- FE tìm tất cả các tầng reachable qua graph `edgeType = stairs`
- hiện danh sách tầng đích

### `junction`

Dùng cho sảnh, nút giao, hành lang trung tâm.

Hiện tại FE chưa gán hành động tương tác riêng mạnh cho `junction`, nhưng rất hữu ích để:

- mô hình hóa graph navigation
- nối các `door`, `elevator`, `stairs`

---

## 4. Khi nào cần `meshRef`

`meshRef` không bắt buộc để hotspot render theo cách hiện tại, vì FE đang dùng trực tiếp `localX/localY/localZ`.

Tuy nhiên nên có `meshRef` vì:

- dễ truy vết hotspot thuộc object nào trong Blender/model
- dễ đồng bộ giữa team data và team FE
- là nền để sau này map click trực tiếp từ mesh sang node

Ví dụ quy ước đặt tên:

```text
HOTSPOT_ELEVATOR_F5_A
HOTSPOT_STAIRS_F5_A
HOTSPOT_DOOR_APT_24
HOTSPOT_DOOR_APT_25
```

---

## 5. Quan hệ giữa hotspot và graph navigation

Một hotspot chưa đủ để chuyển tầng. Cần cả `navigation_edges`.

Ví dụ đúng cho thang máy:

- tầng 4 có node `elevator`
- tầng 5 có node `elevator`
- tầng 6 có node `elevator`
- giữa chúng có các edge:
  - `edgeType = elevator`

FE hiện đang duyệt toàn bộ chuỗi node cùng loại, nên một thang máy có thể đi đến tất cả các tầng đã được nối bằng edge tương ứng.

Tương tự cho cầu thang:

- node type là `stairs`
- edge type là `stairs`

---

## 6. Chuẩn bị model tầng trong Blender

### Mục tiêu dữ liệu

Một model tầng dùng tốt cho trang này nên có:

- đúng mặt sàn của 1 tầng
- thấy được vị trí cửa căn hộ
- thấy được lõi thang máy
- thấy được cầu thang bộ
- origin ổn định
- scale không bị lệch

### Cách làm cơ bản

1. Mở Blender
2. Import model tầng hoặc vẽ lại mặt sàn
3. Chỉ giữ nội dung của đúng 1 tầng
4. Dọn scene:
   - bỏ object thừa
   - apply transform
   - kiểm tra trục tọa độ
5. Đặt `Origin` của model ở vị trí dễ quản lý

Khuyến nghị:

- đặt origin gần tâm tầng hoặc lõi giao thông
- dùng cùng một quy ước origin cho tất cả các tầng của cùng một tòa nhà

### Apply transform

Trong Blender:

1. chọn object
2. `Ctrl + A`
3. chọn `All Transforms`

Làm bước này để:

- tránh scale ẩn
- tránh sai local coordinate sau khi export

---

## 7. Cách đánh dấu hotspot trong Blender

Cách dễ nhất là thêm `Empty` làm marker.

### Quy trình

1. Mở model tầng
2. `Shift + A`
3. chọn `Empty`
4. đặt marker vào vị trí mong muốn
5. đổi tên marker theo quy ước

Ví dụ:

```text
HOTSPOT_ELEVATOR_F5_A
HOTSPOT_STAIRS_F5_A
HOTSPOT_DOOR_APT_24
HOTSPOT_DOOR_APT_25
```

### Marker nào nên tạo

Tối thiểu nên có:

- 1 marker cho mỗi thang máy
- 1 marker cho mỗi cầu thang
- 1 marker cho mỗi cửa căn hộ cần bấm

Nếu tầng có 10 căn hộ và 2 lõi giao thông:

- 10 marker `door`
- 1 marker `elevator`
- 1 marker `stairs`

---

## 8. Lấy `localX`, `localY`, `localZ` từ Blender như nào

### Cách thủ công dễ nhất

1. Chọn `Empty` marker
2. Mở panel `Item`
3. đọc `Location`

Ví dụ:

```text
X = -4.5
Y = 0.6
Z = -7.5
```

Thì nhập vào node:

```json
{
  "localX": -4.5,
  "localY": 0.6,
  "localZ": -7.5
}
```

### Lưu ý về trục

Trục đang dùng trên FE là theo scene Three.js của model sau khi load.

Trong thực tế:

- nếu model export từ Blender sang `.glb` ổn định
- và bạn không đổi transform lung tung sau export

thì local position của marker đọc trong Blender thường có thể dùng trực tiếp.

Tuy nhiên cần test thật trên web vì:

- khác biệt trục `up axis`
- xoay scene khi export
- scale lúc import/export

có thể làm vị trí lệch.

### Cách kiểm tra nhanh trên web

1. upload model tầng
2. mở `/buildings/:id`
3. chọn tầng tương ứng
4. sửa `localX/localY/localZ` của hotspot trên UI manager
5. tinh chỉnh tới khi marker nằm đúng vị trí

Quy trình thực tế tốt nhất là:

- lấy số ban đầu từ Blender
- sau đó fine-tune trực tiếp trên web

---

## 9. Cách map `door` với căn hộ

Muốn bấm hotspot cửa và mở đúng căn hộ thì node `door` nên map được tới `apartment`.

Hiện trong hệ thống, cách map đang bám theo `apartments.entryNodeId`.

Tức là:

1. tạo `navigation_node` loại `door`
2. gán node đó cho `apartment.entryNodeId`

Khi đó graph trả thêm:

- `apartmentId`
- `apartmentCode`

và FE có thể bấm vào hotspot để mở chi tiết căn hộ tương ứng.

---

## 10. Dữ liệu tối thiểu để một tầng hoạt động tốt

Cho một tầng bất kỳ, để experience ổn định nên có:

### Bắt buộc

- một bản ghi `floor`
- `floors.model3dUrl`
- các `navigation_nodes` với `localX/localY/localZ`

### Nên có

- `door` cho từng căn hộ
- `elevator`
- `stairs`
- `meshRef`
- `label`

### Muốn chuyển tầng tốt

- các `navigation_edges` liên tầng đúng loại:
  - `elevator`
  - `stairs`

### Muốn mở căn hộ đúng

- mỗi căn hộ có `entryNodeId` trỏ tới node `door`

---

## 11. Quy trình làm task chuẩn từ đầu đến cuối

### Bước 1. Chuẩn bị floor model

- vẽ hoặc import model của đúng 1 tầng trong Blender
- dọn scene
- apply transform
- đặt origin ổn định

### Bước 2. Tạo marker hotspot

- thêm `Empty` cho:
  - cửa từng căn
  - thang máy
  - cầu thang
- đặt tên marker theo convention

### Bước 3. Export model

Khuyến nghị:

- export `.glb`

Vì:

- chỉ là 1 file
- ít lỗi asset hơn `.gltf`
- upload lên hệ thống dễ hơn

### Bước 4. Upload model tầng

Trên trang `/buildings/:id`:

1. chọn tầng
2. dùng ô `Upload model tầng`
3. upload file `.glb`

Sau bước này, `floors.model3dUrl` phải có giá trị.

### Bước 5. Tạo hoặc cập nhật node hotspot

Với mỗi marker:

- nhập `nodeType`
- nhập `label`
- nhập `localX/localY/localZ`
- nhập `meshRef`
- nhập `metadata` nếu cần

Có thể làm bằng:

- API `POST /api/navigation/nodes`
- API `PUT /api/navigation/nodes/:id`
- hoặc UI manager ở trang chi tiết tòa nhà

Trên UI hiện đã có:

- nút `Thêm hotspot`
- chọn `node type`
- nhập `lng/lat/z`
- nhập `localX/localY/localZ`
- nhập `meshRef`
- nhập `metadata`

### Bước 6. Nối graph

Tạo `navigation_edges`:

- `hallway` cho cùng tầng
- `elevator` cho chuỗi node thang máy
- `stairs` cho chuỗi node cầu thang

### Bước 7. Gán cửa với căn hộ

Gán `apartments.entryNodeId` tới node `door` tương ứng.

### Bước 8. Test trên web

Checklist:

1. vào `/buildings/:id`
2. chọn `Mặt sàn theo tầng`
3. đổi các tầng
4. kiểm tra model tầng có render không
5. kiểm tra hotspot có nằm đúng chỗ không
6. bấm `door` xem popup căn hộ
7. bấm `elevator` và `stairs` xem có hiện danh sách tầng đích không

---

## 12. Ví dụ dữ liệu mẫu cho một tầng

### Ví dụ node thang máy

```json
{
  "floorId": 8,
  "nodeType": "elevator",
  "label": "Thang máy A - Tầng 5",
  "lng": 106.7001,
  "lat": 10.7381,
  "z": 15,
  "localX": -4.5,
  "localY": 0.6,
  "localZ": -7.5,
  "meshRef": "HOTSPOT_ELEVATOR_F5_A",
  "metadata": {
    "shaft": "A"
  }
}
```

### Ví dụ node cửa căn hộ

```json
{
  "floorId": 8,
  "nodeType": "door",
  "label": "Cửa căn A-501",
  "lng": 106.7002,
  "lat": 10.7382,
  "z": 15,
  "localX": 6.2,
  "localY": 0.6,
  "localZ": 8.4,
  "meshRef": "HOTSPOT_DOOR_APT_24",
  "metadata": {
    "apartmentCode": "A-501"
  }
}
```

### Ví dụ edge thang máy

```json
{
  "startNodeId": 101,
  "endNodeId": 121,
  "edgeType": "elevator",
  "distance": "3.50",
  "travelTime": "8.00",
  "isAccessible": true
}
```

---

## 13. Các lỗi hay gặp

### Upload model tầng xong mà vẫn hiện scene thử nghiệm

Nguyên nhân thường là:

- file được upload vào `building`, không phải `floor`
- `floors.model3dUrl` vẫn đang `null`

### Upload `.gltf` nhưng model không hiện

Nguyên nhân thường là:

- `.gltf` đang tham chiếu `scene.bin` hoặc `textures/...`
- nhưng các file phụ không được upload kèm

Khuyến nghị:

- ưu tiên `.glb`

### Hotspot hiện sai vị trí

Nguyên nhân thường là:

- chưa apply transform trong Blender
- origin của model không ổn định
- local coordinate lấy sai object
- model bị xoay hoặc scale lại sau export

### Bấm cửa không ra căn hộ

Nguyên nhân thường là:

- node `door` chưa map tới `apartment.entryNodeId`

### Bấm thang máy không chuyển được nhiều tầng

Nguyên nhân thường là:

- thiếu edge `elevator`
- chuỗi node giữa các tầng chưa được nối hết

---

## 14. Khuyến nghị cho team

Để tránh lệch dữ liệu giữa team model và team code, nên thống nhất:

- 1 convention đặt tên marker
- 1 quy ước origin cho tất cả tầng của cùng tòa nhà
- ưu tiên `.glb`
- 1 checklist test sau mỗi lần import model

Gợi ý convention:

```text
HOTSPOT_ELEVATOR_F{floor}_{shaft}
HOTSPOT_STAIRS_F{floor}_{shaft}
HOTSPOT_DOOR_APT_{apartmentId}
```

---

## 15. Tài liệu liên quan

- [map-gis.md](D:\Workspace\IE402\docs\frontend\map-gis.md)
- [navigation.md](D:\Workspace\IE402\docs\api\navigation.md)
- [floors.md](D:\Workspace\IE402\docs\api\floors.md)
- [buildings.md](D:\Workspace\IE402\docs\api\buildings.md)
