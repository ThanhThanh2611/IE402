import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
  Input,
  Label,
} from "@/components/ui";
import { useApiQuery, formatVND } from "@/lib/hooks";
import { PageErrorState } from "@/components/PageFeedback";
import type {
  DashboardOverview,
  BuildingOccupancy,
  MonthlyRevenue,
  MapSnapshotFeatureCollection,
  OccupancyHistoryPoint,
} from "@/types";
import {
  Building2,
  CalendarRange,
  Home,
  FileText,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui";

const TOP_OCCUPANCY_ITEMS = 8;

function occupancyColor(rate: number): string {
  if (rate >= 80) return "#16a34a";
  if (rate >= 60) return "#0ea5e9";
  if (rate >= 40) return "#f59e0b";
  return "#ef4444";
}

function truncateBuildingName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 16)}...` : name;
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatMonthLabel(month: string): string {
  const [year, rawMonth] = month.split("-");
  const monthNumber = Number(rawMonth);
  if (!year || Number.isNaN(monthNumber)) return month;
  return `T${monthNumber}/${year}`;
}

type RevenueSummary = {
  totalRevenue: string;
  totalPayments: number;
};

const MONTH_NAMES = [
  "", "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
];


function AnimatedNumber({ value, formatter }: { value: number; formatter?: (v: number) => string }) {
  const [current, setCurrent] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 800; // 0.8s
    const startValue = prevValueRef.current;
    const endValue = value;

    if (startValue === endValue) {
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuad
      const easedProgress = progress * (2 - progress);
      const currentValue = Math.round(easedProgress * (endValue - startValue) + startValue);
      
      setCurrent(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(endValue);
        prevValueRef.current = endValue;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  return <span>{formatter ? formatter(current) : current}</span>;
}

export default function DashboardPage() {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [fromDate, setFromDate] = useState(toDateInputValue(defaultFrom));
  const [toDate, setToDate] = useState(toDateInputValue(now));
  const [snapshotDate, setSnapshotDate] = useState(toDateInputValue(now));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const { data: overview, loading: loadingOverview, error: overviewError, refetch: refetchOverview } =
    useApiQuery<DashboardOverview>("/dashboard/overview");
  const { data: occupancy, loading: loadingOccupancy, error: occupancyError, refetch: refetchOccupancy } =
    useApiQuery<BuildingOccupancy[]>("/dashboard/occupancy");
  const { data: revenue, loading: loadingRevenue, error: revenueError, refetch: refetchRevenue } =
    useApiQuery<MonthlyRevenue[]>(`/dashboard/revenue-by-month?year=${selectedYear}`);
  const {
    data: revenueSummary,
    loading: loadingRevenueSummary,
    error: revenueSummaryError,
    refetch: refetchRevenueSummary,
  } =
    useApiQuery<RevenueSummary>(
      `/dashboard/revenue?from=${fromDate}&to=${toDate}`,
    );
  const {
    data: occupancyHistory,
    loading: loadingOccupancyHistory,
    error: occupancyHistoryError,
    refetch: refetchOccupancyHistory,
  } =
    useApiQuery<OccupancyHistoryPoint[]>(
      `/dashboard/occupancy-history?from=${fromDate}&to=${toDate}`,
    );
  const { data: snapshot, loading: loadingSnapshot, error: snapshotError, refetch: refetchSnapshot } =
    useApiQuery<MapSnapshotFeatureCollection>(
      `/dashboard/map-snapshot?date=${snapshotDate}`,
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



  const occupancyListData = useMemo(() => {
    return (occupancy ?? [])
      .map((b) => ({
        buildingId: b.buildingId,
        name: b.buildingName,
        shortName: truncateBuildingName(b.buildingName),
        rate: Math.round(b.occupancyRate * 100),
        totalApartments: b.totalApartments,
        rentedApartments: b.rentedApartments,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [occupancy]);

  const topOccupancyListData = useMemo(
    () => occupancyListData.slice(0, TOP_OCCUPANCY_ITEMS),
    [occupancyListData],
  );

  const revenueChartData = useMemo(() => {
    const byMonth = new Map<number, number>();
    for (const item of revenue ?? []) {
      const monthNumber = Number(item.month.split("-")[1] ?? 0);
      if (!Number.isNaN(monthNumber) && monthNumber > 0) {
        byMonth.set(monthNumber, Number(item.revenue) || 0);
      }
    }

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return {
        name: MONTH_NAMES[month],
        revenue: byMonth.get(month) ?? 0,
      };
    });
  }, [revenue]);

  const occupancyHistoryChartData = useMemo(() => {
    return (occupancyHistory ?? []).map((item) => ({
      month: item.month,
      label: formatMonthLabel(item.month),
      occupancyRatePercent: Math.round(item.occupancyRate * 1000) / 10,
      activeContracts: item.activeContracts,
      newContracts: item.newContracts,
    }));
  }, [occupancyHistory]);

  const selectedRangeLabel = useMemo(() => {
    if (!fromDate || !toDate) return null;
    return `${fromDate} -> ${toDate}`;
  }, [fromDate, toDate]);

  const snapshotSummary = useMemo(() => {
    const items = (snapshot?.features ?? [])
      .map((feature) => ({
        id: feature.properties.id,
        name: feature.properties.name,
        shortName: truncateBuildingName(feature.properties.name),
        totalApartments: feature.properties.totalApartments,
        rentedApartments: feature.properties.rentedApartments,
        availableApartments: feature.properties.availableApartments,
        occupancyRate: Math.round(Number(feature.properties.occupancyRate ?? 0) * 100),
      }))
      .sort((a, b) => b.occupancyRate - a.occupancyRate);

    const totals = items.reduce(
      (accumulator, item) => ({
        totalApartments: accumulator.totalApartments + item.totalApartments,
        rentedApartments: accumulator.rentedApartments + item.rentedApartments,
      }),
      { totalApartments: 0, rentedApartments: 0 },
    );

    return {
      items,
      totals,
      occupancyRate:
        totals.totalApartments > 0
          ? Math.round((totals.rentedApartments / totals.totalApartments) * 1000) / 10
          : 0,
    };
  }, [snapshot]);

  const topSnapshotItems = useMemo(
    () => snapshotSummary.items.slice(0, TOP_OCCUPANCY_ITEMS),
    [snapshotSummary.items],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {(overviewError || occupancyError || revenueSummaryError || revenueError || occupancyHistoryError || snapshotError) && (
        <PageErrorState
          compact
          title="Một số khối dữ liệu dashboard đang tải lỗi"
          description={
            overviewError ||
            occupancyError ||
            revenueSummaryError ||
            revenueError ||
            occupancyHistoryError ||
            snapshotError ||
            "Không thể tải dữ liệu dashboard"
          }
          onRetry={() => {
            void refetchOverview();
            void refetchOccupancy();
            void refetchRevenueSummary();
            void refetchRevenue();
            void refetchOccupancyHistory();
            void refetchSnapshot();
          }}
        />
      )}

      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Bộ lọc thời gian</CardTitle>
          </div>
          <CardDescription>
            Áp dụng cho biểu đồ lịch sử lấp đầy và tổng doanh thu trong khoảng thời gian.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="dashboard-from-date">Từ ngày</Label>
            <Input
              id="dashboard-from-date"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              max={toDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-to-date">Đến ngày</Label>
            <Input
              id="dashboard-to-date"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              min={fromDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-year">Năm doanh thu</Label>
            <Input
              id="dashboard-year"
              type="number"
              min={2020}
              max={2100}
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value || String(now.getFullYear()))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-snapshot-date">Mốc snapshot</Label>
            <Input
              id="dashboard-snapshot-date"
              type="date"
              value={snapshotDate}
              onChange={(event) => setSnapshotDate(event.target.value)}
            />
          </div>
          {selectedRangeLabel && (
            <div className="sm:col-span-2 xl:col-span-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Khoảng thời gian: {selectedRangeLabel}</Badge>
              <Badge variant="outline">Năm biểu đồ doanh thu: {selectedYear}</Badge>
              <Badge variant="outline">Snapshot: {snapshotDate}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {loadingOverview
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card
                key={stat.label}
                className="glass glow-primary-sm hover:shadow-[0_0_15px_rgba(0,87,255,0.15)] hover:border-primary/40 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold tracking-tight mt-1">
                        <AnimatedNumber value={stat.value} />
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass hover:shadow-[0_0_15px_rgba(0,87,255,0.12)] hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doanh thu trong kỳ</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {loadingRevenueSummary || !revenueSummary ? (
                    "..."
                  ) : (
                    <AnimatedNumber
                      value={Number(revenueSummary.totalRevenue) || 0}
                      formatter={formatVND}
                    />
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-[0_0_15px_rgba(0,87,255,0.12)] hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Số giao dịch đã thu</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {loadingRevenueSummary || !revenueSummary ? (
                    "..."
                  ) : (
                    <AnimatedNumber value={revenueSummary.totalPayments} />
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <FileText className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-[0_0_15px_rgba(0,87,255,0.12)] hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lấp đầy cuối kỳ</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {loadingOccupancyHistory || occupancyHistoryChartData.length === 0 ? (
                    "..."
                  ) : (
                    <AnimatedNumber
                      value={occupancyHistoryChartData[occupancyHistoryChartData.length - 1].occupancyRatePercent}
                      formatter={(v) => `${v}%`}
                    />
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-sky-500/10 p-3">
                <Activity className="h-6 w-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover:shadow-[0_0_15px_rgba(0,87,255,0.12)] hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hợp đồng mới trong kỳ</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {loadingOccupancyHistory ? (
                    "..."
                  ) : (
                    <AnimatedNumber
                      value={occupancyHistoryChartData.reduce((sum, item) => sum + item.newContracts, 0)}
                    />
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-violet-500/10 p-3">
                <CalendarRange className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
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
            ) : occupancyListData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center rounded-lg border bg-background/60 px-4 text-center">
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu tỷ lệ lấp đầy.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={330}>
                <BarChart
                  data={topOccupancyListData}
                  layout="vertical"
                  margin={{ top: 8, right: 28, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(229, 231, 235, 0.4)" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value: number) => `${value}%`}
                    tickMargin={8}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={112}
                    tickMargin={8}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value)}%`, "Tỷ lệ lấp đầy"]}
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload as (typeof topOccupancyListData)[number] | undefined;
                      if (!item) return "";
                      return `${item.name} - ${item.rentedApartments}/${item.totalApartments} căn đã thuê`;
                    }}
                  />
                  <Bar dataKey="rate" radius={[0, 8, 8, 0]} barSize={18}>
                    {topOccupancyListData.map((item) => (
                      <Cell key={item.buildingId ?? item.name} fill={occupancyColor(item.rate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {!loadingOccupancy && (
              <p className="mt-2 text-xs text-muted-foreground">
                {occupancyListData.length > TOP_OCCUPANCY_ITEMS
                  ? `Hiển thị ${TOP_OCCUPANCY_ITEMS}/${occupancyListData.length} tòa nhà có tỷ lệ cao nhất.`
                  : "Dữ liệu đã sắp xếp theo tỷ lệ lấp đầy giảm dần."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Doanh thu theo tháng ({selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {loadingRevenue ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 231, 235, 0.4)" />
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
                    strokeWidth={3}
                    dot={{ fill: "var(--color-primary)", r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Lịch sử tỷ lệ lấp đầy theo thời gian</CardTitle>
            <CardDescription>
              Theo dõi xu hướng lấp đầy và số hợp đồng đang hiệu lực trong khoảng thời gian đã chọn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Đầu kỳ</p>
                <p className="mt-1 text-xl font-semibold">
                  {occupancyHistoryChartData[0]?.occupancyRatePercent ?? 0}%
                </p>
              </div>
              <div className="rounded-lg border bg-background/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cuối kỳ</p>
                <p className="mt-1 text-xl font-semibold">
                  {occupancyHistoryChartData[occupancyHistoryChartData.length - 1]?.occupancyRatePercent ?? 0}%
                </p>
              </div>
              <div className="rounded-lg border bg-background/60 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Mốc dữ liệu</p>
                <p className="mt-1 text-xl font-semibold">{occupancyHistoryChartData.length}</p>
              </div>
            </div>
            {loadingOccupancyHistory ? (
              <Skeleton className="h-[320px] w-full" />
            ) : occupancyHistoryChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có dữ liệu lịch sử trong khoảng thời gian đã chọn.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={occupancyHistoryChartData}
                  margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(229, 231, 235, 0.4)" />
                  <XAxis dataKey="label" tickMargin={8} />
                  <YAxis
                    yAxisId="left"
                    width={56}
                    tickMargin={6}
                    domain={[0, 100]}
                    tickFormatter={(value: number) => `${value}%`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    width={56}
                    tickMargin={6}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Tỷ lệ lấp đầy") return [`${value}%`, name];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Thời gian: ${label}`}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="occupancyRatePercent"
                    name="Tỷ lệ lấp đầy"
                    stroke="var(--color-primary)"
                    fill="url(#occupancyGradient)"
                    strokeWidth={3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="activeContracts"
                    name="Hợp đồng hiệu lực"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#0ea5e9" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Snapshot occupancy theo mốc thời gian</CardTitle>
            <CardDescription>
              Chụp nhanh trạng thái lấp đầy của từng tòa nhà tại ngày {snapshotDate}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background/60 p-2.5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Lấp đầy toàn hệ thống</p>
                <p className="mt-1 text-lg font-semibold">{snapshotSummary.occupancyRate}%</p>
              </div>
              <div className="rounded-lg border bg-background/60 p-2.5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Căn đang thuê / tổng căn</p>
                <p className="mt-1 text-lg font-semibold">
                  {snapshotSummary.totals.rentedApartments}/{snapshotSummary.totals.totalApartments}
                </p>
              </div>
            </div>
            {loadingSnapshot ? (
              <Skeleton className="h-[320px] w-full" />
            ) : snapshotSummary.items.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center rounded-lg border bg-background/60 px-4 text-center">
                <p className="text-sm text-muted-foreground">Không có dữ liệu snapshot ở ngày đã chọn.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={topSnapshotItems}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 4, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(229, 231, 235, 0.4)" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value: number) => `${value}%`}
                    tickMargin={8}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={104}
                    tickMargin={8}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value)}%`, "Tỷ lệ lấp đầy"]}
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload as (typeof topSnapshotItems)[number] | undefined;
                      if (!item) return "";
                      return `${item.name} - ${item.rentedApartments} đang thuê, ${item.availableApartments} còn trống, ${item.totalApartments} tổng căn`;
                    }}
                  />
                  <Bar dataKey="occupancyRate" radius={[0, 8, 8, 0]} barSize={18}>
                    {topSnapshotItems.map((item) => (
                      <Cell key={item.id} fill={occupancyColor(item.occupancyRate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {!loadingSnapshot && snapshotSummary.items.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Snapshot {snapshotDate} · Hiển thị {topSnapshotItems.length}/{snapshotSummary.items.length} tòa nhà theo tỷ lệ lấp đầy cao nhất.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Rate Number */}
      {overview && (
        <Card className="glass glow-primary-sm hover:shadow-[0_0_15px_rgba(0,87,255,0.15)] hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Tỷ lệ lấp đầy tổng thể
                </p>
                <p className="text-3xl font-bold text-primary tracking-tight">
                  <AnimatedNumber
                    value={Math.round(overview.occupancyRate * 100)}
                    formatter={(v) => `${v}%`}
                  />
                </p>
              </div>

              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
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
