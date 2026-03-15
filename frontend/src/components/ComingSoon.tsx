import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Construction className="h-16 w-16 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-center">
            Tính năng này đang được phát triển và sẽ sớm ra mắt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
