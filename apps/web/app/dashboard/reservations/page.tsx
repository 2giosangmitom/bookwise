import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ReservationsPage() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold">Reservations</h2>
      <Card>
        <CardHeader>
          <CardTitle>Reservations (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>Manage reservations here.</CardContent>
      </Card>
    </div>
  );
}
