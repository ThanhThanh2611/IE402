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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Skeleton } from "@/components/ui";

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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={occupancy?.map((b) => ({
                    name: b.buildingName,
                    "Tỷ lệ (%)": Math.round(b.occupancyRate * 100),
                  }))}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="Tỷ lệ (%)" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Doanh thu theo tháng ({new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRevenue ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={revenue?.map((r) => ({
                    name: monthNames[r.month],
                    "Doanh thu": r.revenue,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(v: number) => formatVND(v).replace("₫", "")}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatVND(v), "Doanh thu"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="Doanh thu"
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
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Tỷ lệ lấp đầy tổng thể
                </p>
                <p className="text-3xl font-bold text-primary tracking-tight">
                  {Math.round(overview.occupancyRate * 100)}%
                </p>
              </div>
              <div className="h-3 flex-1 rounded-full bg-muted overflow-hidden">
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
