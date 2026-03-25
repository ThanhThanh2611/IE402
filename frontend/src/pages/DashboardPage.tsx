import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useApiQuery, formatVND } from "@/lib/hooks";
import type { DashboardOverview, BuildingOccupancy, MonthlyRevenue } from "@/types";
import {
  Building2,
  Home,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui";

function occupancyColor(rate: number): string {
  if (rate >= 80) return "#16a34a";
  if (rate >= 60) return "#0ea5e9";
  if (rate >= 40) return "#f59e0b";
  return "#ef4444";
}

export default function DashboardPage() {
  const { data: overview, loading: loadingOverview } =
    useApiQuery<DashboardOverview>("/dashboard/overview");
  const { data: occupancy, loading: loadingOccupancy } =
    useApiQuery<BuildingOccupancy[]>("/dashboard/occupancy");
  const { data: revenue, loading: loadingRevenue } =
    useApiQuery<MonthlyRevenue[]>(
      `/dashboard/revenue-by-month?year=${new Date().getFullYear()}`,
    );

  const stats = overview
    ? [
        {
          label: "Tổng tòa nhà",
          value: overview.totalBuildings,
          icon: Building2,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          label: "Tổng căn hộ",
          value: overview.totalApartments,
          icon: Home,
          color: "text-indigo-500",
          bg: "bg-indigo-500/10",
        },
        {
          label: "Đã cho thuê",
          value: overview.rentedApartments,
          icon: TrendingUp,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        },
        {
          label: "Hợp đồng đang hoạt động",
          value: overview.activeContracts,
          icon: FileText,
          color: "text-violet-500",
          bg: "bg-violet-500/10",
        },
      ]
    : [];

  const monthNames = [
    "", "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
    "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
  ];

  const occupancyListData = useMemo(() => {
    return (occupancy ?? [])
      .map((b) => ({
        name: b.buildingName,
        rate: Math.round(b.occupancyRate * 100),
        totalApartments: b.totalApartments,
        rentedApartments: b.rentedApartments,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [occupancy]);

  const revenueChartData = useMemo(() => {
    const byMonth = new Map<number, number>();
    for (const item of revenue ?? []) {
      byMonth.set(item.month, Number(item.revenue) || 0);
    }

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return {
        name: monthNames[month],
        revenue: byMonth.get(month) ?? 0,
      };
    });
  }, [revenue]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingOverview
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="glass glow-primary-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tỷ lệ lấp đầy theo tòa nhà</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOccupancy ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {occupancyListData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có dữ liệu tỷ lệ lấp đầy.</p>
                ) : (
                  occupancyListData.map((item) => (
                    <div key={item.name} className="space-y-1 rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-medium" title={item.name}>
                          {item.name}
                        </p>
                        <p
                          className="shrink-0 text-sm font-semibold"
                          style={{ color: occupancyColor(item.rate) }}
                        >
                          {item.rate}%
                        </p>
                      </div>

                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${item.rate}%`,
                            backgroundColor: occupancyColor(item.rate),
                          }}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {item.rentedApartments}/{item.totalApartments} căn đã thuê
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
            {!loadingOccupancy && (
              <p className="mt-2 text-xs text-muted-foreground">
                Danh sách đã sắp xếp theo tỷ lệ lấp đầy giảm dần.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Doanh thu theo tháng ({new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {loadingRevenue ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tickMargin={8} />
                  <YAxis
                    width={64}
                    tickMargin={6}
                    tickFormatter={(v: number) => formatVND(v).replace("₫", "")}
                  />
                  <Tooltip
                    formatter={(value) => [formatVND(Number(value ?? 0)), "Doanh thu"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)", r: 4 }}
                    activeDot={{ r: 6, fill: "var(--color-primary)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Rate Number */}
      {overview && (
        <Card className="glass glow-primary-sm">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Tỷ lệ lấp đầy tổng thể
                </p>
                <p className="text-3xl font-bold text-primary tracking-tight">
                  {Math.round(overview.occupancyRate * 100)}%
                </p>
              </div>

              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.round(overview.occupancyRate * 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
