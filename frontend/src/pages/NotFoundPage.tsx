import { Link } from "react-router-dom";
import { Compass, Home, MapPinned } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">404</p>
            <CardTitle className="text-2xl">Không tìm thấy màn hình bạn đang mở</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-sm text-muted-foreground">
            Liên kết có thể đã sai, màn hình đã được đổi route hoặc bạn đang truy cập vào một địa chỉ không tồn tại.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
              <Home className="mr-2 h-4 w-4" />
              Về dashboard
            </Link>
            <Link to="/map" className={cn(buttonVariants({ variant: "outline" }))}>
              <MapPinned className="mr-2 h-4 w-4" />
              Mở bản đồ GIS
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
