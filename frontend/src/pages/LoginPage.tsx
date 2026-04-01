import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, validateForm, type LoginInput } from "@/lib/validators";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/components/ui";
import { toast } from "sonner";
import { Globe } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateForm<LoginInput>(loginSchema, form);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Đăng nhập thành công");
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] relative overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(0,87,255,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(99,102,241,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(139,92,246,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <Card className="w-full max-w-md relative z-10 bg-white/4 backdrop-blur-xl border-white/8 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-5">
            <div className="rounded-2xl bg-primary/20 p-4 glow-primary">
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white tracking-tight">
            GIS Apartment
          </CardTitle>
          <p className="text-sm text-white/40">
            Đăng nhập để tiếp tục
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">
                Username
              </Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                placeholder="Nhập username"
                className="bg-white/6 border-white/1 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Nhập mật khẩu"
                className="bg-white/6 border-white/1 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full glow-primary font-medium tracking-wide"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
