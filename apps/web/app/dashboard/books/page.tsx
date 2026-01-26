import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BooksPage() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold">Books</h2>
      <Card>
        <CardHeader>
          <CardTitle>Books (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>Manage library books here.</CardContent>
      </Card>
    </div>
  );
}
