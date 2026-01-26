import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoansPage() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold">Loans</h2>
      <Card>
        <CardHeader>
          <CardTitle>Loans (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>Manage loans here.</CardContent>
      </Card>
    </div>
  );
}
