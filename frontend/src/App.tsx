import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">
          3D GIS Apartment Management
        </h1>
        <p className="text-muted-foreground">
          Hệ thống quản lý cho thuê chung cư tích hợp bản đồ GIS 3D
        </p>
        <div className="flex gap-4 justify-center">
          <Button>Bắt đầu</Button>
          <Button variant="outline">Tìm hiểu thêm</Button>
        </div>
      </div>
    </div>
  )
}

export default App
