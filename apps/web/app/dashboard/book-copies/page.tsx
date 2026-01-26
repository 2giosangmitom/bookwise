import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BookCopiesPage() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold">Book Copies</h2>
      <Card>
        <CardHeader>
          <CardTitle>Book Copies (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>Manage book copies here.</CardContent>
      </Card>
    </div>
  );
}
