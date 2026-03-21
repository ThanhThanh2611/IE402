import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full glass glow-primary-sm">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="rounded-2xl bg-primary/10 p-5">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-muted-foreground text-center">
            Tính năng này đang được phát triển và sẽ sớm ra mắt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
