# PLAN-furniture-lock-rotation.md

Kế hoạch sửa lỗi chức năng khóa nội thất (furniture item lock), đồng bộ góc xoay (rotation) và kích thước thực tế (scale) của nội thất giữa giao diện 2D/3D, Form nhập liệu và Database.

---

## 1. Phân tích nguyên nhân & Hiện trạng

### Lỗi 1: Khóa item nhưng vẫn thay đổi được vị trí
- **2D Workspace (`ApartmentDetailPage.tsx`)**:
  - Thẻ `<button>` biểu diễn item 2D được đặt `draggable={editMode}` mà không kiểm tra `item.isLocked`. Do đó, người dùng vẫn kéo thả được item bị khóa.
  - Hàm `handleWorkspaceDrop` khi nhận sự kiện kéo thả item không kiểm tra xem item đó có bị khóa hay không trước khi gọi API cập nhật vị trí.
- **3D Workspace (`ApartmentScene.tsx`)**:
  - Component `FurnitureNode` hiển thị công cụ `TransformControls` (dịch chuyển/xoay 3D) dựa trên điều kiện `selected && !readOnly` mà không kiểm tra `item.isLocked`. Do đó, người dùng vẫn dời và xoay được item đã khóa trên 3D.
  - Các hàm đồng bộ vị trí 3D (`handleItemMove3D`, `handleItemRotate3D`) ở `ApartmentDetailPage.tsx` không chặn cập nhật khi item bị khóa.

### Lỗi 2: Không lưu / Mất vị trí xoay (Rotation) sau khi load lại trang
- **Sự bất đồng bộ về đơn vị góc xoay**:
  - **Form Modal**: Người dùng nhập giá trị Độ (Degrees, ví dụ `90`). Khi bấm "Lưu", gửi trực tiếp giá trị này (Degrees) lên DB.
  - **Seed Data**: Dữ liệu mẫu gán `rotationZ: "90"` (Degrees).
  - **3D Scene (`ApartmentScene.tsx`)**:
    - Trục xoay nằm ngang trên sàn nhà trong Three.js (up-axis là Y) sử dụng Radians.
    - Hiện tại, group 3D chỉ render theo trục Y: `rotation={[0, rotY, 0]}` với `rotY = Number(item.rotationY) || 0`, hoàn toàn bỏ qua `rotationX` và `rotationZ`.
    - Khi người dùng xoay 3D, `TransformControls` xoay quanh trục Y bằng Radians. Khi nhả chuột, frontend gửi giá trị Radians này (ví dụ `1.571` thay vì `90`) lên DB.
  - **Hệ quả**:
    - Nếu người dùng lưu từ Form (Degrees: `90`), Three.js hiểu là `90` Radians (xoay lung tung).
    - Nếu người dùng xoay từ 3D, hệ thống lưu Radians (`1.571`). Khi load lại trang, Three.js hiển thị đúng 90 độ, nhưng mở Form Modal lên chỉnh sửa thì Form lại hiển thị `"1.571"` thay vì `"90"`. Người dùng lưu lại Form sẽ lưu đè giá trị này.
    - Seed data lưu `rotationZ: "90"`. Do Three.js bỏ qua trục Z và chỉ đọc trục Y, giường chính không xoay đúng như dữ liệu mẫu (luôn có góc xoay bằng 0).

### Vấn đề 3: Tỷ lệ (Scale) chưa được áp dụng và đồng bộ đơn vị đo thực tế (mét)
- Hiện tại, các trường `scaleX`, `scaleY`, `scaleZ` trong database hoàn toàn bị bỏ qua khi render 3D. Giao diện 3D chỉ vẽ mô hình với kích thước gốc của file `.glb` hoặc kích thước mặc định từ catalog, không áp dụng các thông số scale của item cụ thể.
- Người dùng mong muốn **1 đơn vị scale tương ứng với 1 mét** trong thực tế. Ví dụ, nếu item có `scaleX = 1.5`, `scaleY = 0.8`, `scaleZ = 1.2` thì kích thước thực tế hiển thị trên 3D của Sofa/Giường phải dài đúng 1.5m, cao đúng 0.8m và sâu đúng 1.2m để phù hợp nhất với diện tích căn phòng (vốn cũng được tính bằng mét).

---

## 2. Giải pháp đề xuất

Chúng ta thống nhất:
- Sử dụng **Độ (Degrees)** làm đơn vị chuẩn để lưu trữ góc xoay (`rotationX`, `rotationY`, `rotationZ`) trong Database và trao đổi qua API. Quy đổi sang Radians ở component 3D khi render.
- Sử dụng **Mét (Meters)** làm đơn vị đo thực tế cho các trường tỷ lệ (`scaleX`, `scaleY`, `scaleZ`).

### A. Xử lý lỗi Khóa item (Furniture Lock)
1. **Frontend - 2D Workspace (`ApartmentDetailPage.tsx`)**:
   - Chỉ cho phép kéo thả item 2D khi chưa bị khóa: `draggable={editMode && !item.isLocked}`.
   - Thay đổi cursor CSS tương ứng chỉ thành `cursor-grab` khi item chưa bị khóa.
   - Hiển thị biểu tượng ổ khóa nhỏ kế bên nhãn item nếu bị khóa.
   - Trong `handleWorkspaceDrop`: Nếu `payload.itemId` tương ứng với một item bị khóa, chặn không cho cập nhật và hiển thị `toast.error("Nội thất này đã bị khóa, không thể di chuyển!")`.
2. **Frontend - 3D Workspace (`ApartmentScene.tsx` & `ApartmentDetailPage.tsx`)**:
   - Trong `ApartmentScene.tsx` (Component `FurnitureNode`):
     - Ẩn `TransformControls` nếu item bị khóa: `selected && !readOnly && !item.isLocked`.
     - Ẩn các nút điều khiển "DỜI" và "XOAY" trên Html label nếu item bị khóa.
     - Hiển thị thêm biểu tượng hoặc nhãn `[Khóa]` kế bên tên item để nhận biết.
   - Trong `ApartmentDetailPage.tsx`:
     - Chặn gọi API cập nhật vị trí/xoay trong `handleItemMove3D` và `handleItemRotate3D` nếu item tương ứng có `isLocked === true`.

### B. Xử lý lỗi Đồng bộ góc xoay (Rotation)
1. **Frontend - 3D Workspace (`ApartmentScene.tsx`)**:
   - Quy đổi góc xoay từ Degrees (DB) sang Radians khi render:
     ```typescript
     const rotX = (Number(item.rotationX) || 0) * Math.PI / 180;
     const rotY = (Number(item.rotationY) || 0) * Math.PI / 180;
     const rotZ = (Number(item.rotationZ) || 0) * Math.PI / 180;
     ```
     Và áp dụng cho group 3D: `rotation={[rotX, rotY, rotZ]}`.
   - Cập nhật state khởi tạo `liveRotationY` sang Radians:
     ```typescript
     const [liveRotationY, setLiveRotationY] = useState<number>(((Number(item.rotationY) || 0) * Math.PI) / 180);
     ```
   - Trong `TransformControls` -> `onMouseUp` (khi người dùng xoay 3D):
     Đổi góc xoay từ Radians sang Degrees trước khi gọi `onItemRotate`:
     ```typescript
     } else if (transformMode === "rotate" && onItemRotate) {
       const snap = Math.PI / 12; // 15 độ
       const snappedRotYRad = Math.round(newRot.y / snap) * snap;
       const snappedRotYDeg = Math.round((snappedRotYRad * 180) / Math.PI);
       onItemRotate(item.id, snappedRotYDeg); // Gửi số Degrees lên API
       setLiveRotationY(snappedRotYRad);
     }
     ```
2. **Backend - Seed Data (`backend/src/db/seed.ts`)**:
   - Sửa đổi các item nội thất có góc xoay trong file seed. Cụ thể, đổi `rotationZ: "90"` thành `rotationY: "90"` đối với "Giường chính" vì trong Three.js, xoay trên mặt sàn là xoay quanh trục Y.

### C. Áp dụng kích thước thực tế (Scale = Meters)
1. **Frontend - Chuẩn hóa mô hình 3D trong `ApartmentScene.tsx`**:
   - Cập nhật component `GltfModel` để tự động chuẩn hóa kích thước của bất kỳ file model `.glb`/`.gltf` nào về `1m x 1m x 1m` bằng cách đo Bounding Box khi tải xong, sau đó nhân với các giá trị `scaleX`, `scaleY`, `scaleZ` từ DB (đóng vai trò là mét).
   - Tự động dịch chuyển điểm đáy của model về `y = 0` để model luôn đặt khớp trên mặt sàn bất kể pivot gốc của file thiết kế nằm ở đâu.
     ```typescript
     function GltfModel({ url, scaleX, scaleY, scaleZ }: { url: string; scaleX: number; scaleY: number; scaleZ: number }) {
       const { scene } = useGLTF(url);
       const normalizedScene = useMemo(() => {
         const clone = scene.clone();
         const box = new THREE.Box3().setFromObject(clone);
         const size = new THREE.Vector3();
         box.getSize(size);
         
         const sizeX = size.x || 1;
         const sizeY = size.y || 1;
         const sizeZ = size.z || 1;
         
         clone.scale.set(scaleX / sizeX, scaleY / sizeY, scaleZ / sizeZ);
         
         const newBox = new THREE.Box3().setFromObject(clone);
         const center = new THREE.Vector3();
         newBox.getCenter(center);
         
         clone.position.x -= center.x;
         clone.position.z -= center.z;
         clone.position.y -= newBox.min.y;
         
         return clone;
       }, [scene, scaleX, scaleY, scaleZ]);

       return <primitive object={normalizedScene} />;
     }
     ```
2. **Frontend - Áp dụng scale cho mesh mặc định**:
   - Nếu vật thể không có model và hiển thị hình hộp mặc định, thay vì dùng `defaultWidth/Height/Depth` từ catalog, ta dùng trực tiếp `scaleX`, `scaleY`, `scaleZ` làm kích thước hình hộp:
     `<boxGeometry args={[scaleX, scaleY, scaleZ]} />` đặt tại vị trí `position={[0, scaleY/2, 0]}`.
3. **Frontend - Nhãn HTML 3D**:
   - Thay đổi chiều cao đặt nhãn HTML từ `h + 0.4` thành `scaleY + 0.4` để nhãn luôn hiển thị phía trên đỉnh của vật thể tương ứng với chiều cao thực tế.

---

## 3. Kế hoạch triển khai & Phân công tác nhân

### Tác nhân thực hiện: `@orchestrator`

### Các bước chi tiết:
- **Bước 1**: Sửa đổi `frontend/src/components/apartment/ApartmentScene.tsx` để tích hợp logic chuẩn hóa model 3D theo kích thước thực tế (mét) thông qua `scaleX`, `scaleY`, `scaleZ`, áp dụng xoay 3 trục theo Degrees/Radians, và vô hiệu hóa TransformControls khi item bị khóa.
- **Bước 2**: Sửa đổi `frontend/src/pages/ApartmentDetailPage.tsx` để chặn kéo thả 2D khi item bị khóa, hiển thị UI ổ khóa, chặn API cập nhật khi item bị khóa.
- **Bước 3**: Cập nhật file seed `backend/src/db/seed.ts` đổi `rotationZ: "90"` sang `rotationY: "90"` cho các item giường. Chạy lại lệnh seed database `npm run db:seed` để đồng bộ dữ liệu mẫu chuẩn.
- **Bước 4**: Kiểm tra và chạy thử ứng dụng để xác nhận.

---

## 4. Kế hoạch kiểm thử (Verification Plan)

### Kiểm thử thủ công:
1. **Kiểm tra chức năng Khóa**:
   - Khóa "Tủ quần áo" -> Xác nhận không di chuyển được trên 2D (cursor không đổi, chặn kéo thả) và 3D (không hiện TransformControls, có nhãn ổ khóa).
2. **Kiểm tra chức năng Xoay**:
   - Xoay "Giường chính" trên 3D -> F5 -> Xác nhận hướng xoay được giữ nguyên. Sửa trong modal Form -> Nhập `45` độ -> Xác nhận hiển thị đúng 45 độ trên 3D.
3. **Kiểm tra kích thước (Scale = Meters)**:
   - Sửa một item bất kỳ (ví dụ "Bàn làm việc"), nhập Scale X = 2, Scale Y = 0.75, Scale Z = 1.
   - Xác nhận trên 3D: Vật thể hiển thị với chiều dài 2m (chiếm 2 ô lưới 1m x 1m), cao đúng 0.75m và sâu 1m.
   - Nhãn HTML của vật thể hiển thị ngay phía trên đỉnh ở độ cao 0.75m + 0.4m.
