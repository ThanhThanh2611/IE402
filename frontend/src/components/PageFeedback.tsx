import { AlertCircle, Inbox, RefreshCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent } from "@/components/ui";

type PageErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
  compact?: boolean;
};

type EmptyStateProps = {
  title?: string;
  description: string;
};

export function PageErrorState({
  title = "Không thể tải dữ liệu",
  description,
  onRetry,
  compact = false,
}: PageErrorStateProps) {
  if (compact) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{description}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title = "Chưa có dữ liệu",
  description,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
