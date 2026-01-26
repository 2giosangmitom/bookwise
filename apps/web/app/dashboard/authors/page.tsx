import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AuthorsPage() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold">Authors</h2>
      <Card>
        <CardHeader>
          <CardTitle>Authors (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>Manage authors here.</CardContent>
      </Card>
    </div>
  );
}
