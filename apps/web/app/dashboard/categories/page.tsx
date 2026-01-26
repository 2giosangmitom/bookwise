import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CategoriesPage() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold">Categories</h2>
      <Card>
        <CardHeader>
          <CardTitle>Categories (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>Manage categories here.</CardContent>
      </Card>
    </div>
  );
}
