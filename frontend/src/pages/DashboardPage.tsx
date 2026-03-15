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
        },
        {
          label: "Tổng căn hộ",
          value: overview.totalApartments,
          icon: Home,
        },
        {
          label: "Đã cho thuê",
          value: overview.rentedApartments,
          icon: TrendingUp,
        },
        {
          label: "Hợp đồng đang hoạt động",
          value: overview.activeContracts,
          icon: FileText,
        },
      ]
    : [];

  const monthNames = [
    "", "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
    "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingOverview
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Occupancy Rate */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ lấp đầy theo tòa nhà</CardTitle>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="Tỷ lệ (%)" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>
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
                  <CartesianGrid strokeDasharray="3 3" />
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
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Rate Number */}
      {overview && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Tỷ lệ lấp đầy tổng thể
                </p>
                <p className="text-3xl font-bold text-primary">
                  {Math.round(overview.occupancyRate * 100)}%
                </p>
              </div>
              <div className="h-4 flex-1 rounded-full bg-muted overflow-hidden">
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
