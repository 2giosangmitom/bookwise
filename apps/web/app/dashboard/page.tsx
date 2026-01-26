import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold">Overview</h2>
      <Card>
        <CardHeader>
          <CardTitle>Overview (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>This is the dashboard overview. Add widgets and summaries here.</CardContent>
      </Card>
    </div>
  );
}
