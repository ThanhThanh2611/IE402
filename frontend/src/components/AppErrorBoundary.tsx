import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

type AppErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  resetKeys?: unknown[];
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary caught an error", error, errorInfo);
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps) {
    if (!this.state.hasError) return;
    if (!this.props.resetKeys || !prevProps.resetKeys) return;

    const hasChanged =
      this.props.resetKeys.length !== prevProps.resetKeys.length ||
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index]);

    if (hasChanged) {
      this.setState({ hasError: false });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  private handleGoDashboard = () => {
    this.setState({ hasError: false }, () => {
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle>Ứng dụng vừa gặp lỗi không mong muốn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Bạn có thể tải lại màn hình hiện tại. Nếu lỗi còn lặp lại, hãy quay về dashboard để tiếp tục thao tác.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" onClick={this.handleReset}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Thử render lại
              </Button>
              <Button onClick={this.handleGoDashboard}>
                <Home className="mr-2 h-4 w-4" />
                Về dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
