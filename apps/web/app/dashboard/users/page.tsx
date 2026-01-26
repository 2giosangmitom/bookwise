import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold">Users</h2>
      <Card>
        <CardHeader>
          <CardTitle>Users (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>List and manage users here.</CardContent>
      </Card>
    </div>
  );
}
