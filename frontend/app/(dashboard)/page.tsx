import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KPIS = [
  { label: "Products tracked", value: "—" },
  { label: "Low-stock items", value: "—" },
  { label: "Open purchase orders", value: "—" },
  { label: "Active suppliers", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
