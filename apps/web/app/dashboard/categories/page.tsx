"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, PenBox, Search } from "lucide-react";
import { functional, HttpError } from "@bookwise/sdk";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { API_CONNECTION } from "@/lib/constants";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import z from "zod";
import { useFetchApiContext } from "@/contexts/fetch-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncer } from "@tanstack/react-pacer";
import { Spinner } from "@/components/ui/spinner";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

const updateCategorySchema = createCategorySchema.extend({ id: z.string() });

export default function CategoriesPage() {
  const fetchApi = useFetchApiContext();
  const queryClient = useQueryClient();

  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false);
  const [updateCategoryDialogOpen, setUpdateCategoryDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const findCategoriesQuery = useQuery({
    queryKey: ["categories", page, limit, search],
    queryFn: () =>
      fetchApi((accessToken) =>
        functional.api.category.getAllCategories(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          {
            page,
            limit,
            search: search || undefined,
          },
        ),
      ),
  });

  const handleSearch = useDebouncer(
    (value) => {
      setPage(1);
      setSearch(value);
    },
    { wait: 500 },
    (state) => ({ isPending: state.isPending }),
  );

  const createCategoryMutation = useMutation({
    mutationFn: (category: Parameters<typeof functional.api.category.createCategory>[1]) =>
      fetchApi((accessToken) =>
        functional.api.category.createCategory(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          category,
        ),
      ),
    onSuccess: async () => {
      toast.success("Category created successfully", { position: "top-center" });
      setCreateCategoryDialogOpen(false);
      createCategoryForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) =>
      fetchApi((accessToken) =>
        functional.api.category.deleteCategory(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          categoryId,
        ),
      ),
    onSuccess: async () => {
      toast.success("Category deleted successfully", { position: "top-center" });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: { id: string } & Parameters<typeof functional.api.category.updateCategory>[2]) =>
      fetchApi((accessToken) =>
        functional.api.category.updateCategory(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          data.id,
          {
            name: data.name,
            slug: data.slug,
          },
        ),
      ),
    onSuccess: async () => {
      toast.success("Category updated successfully", { position: "top-center" });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setUpdateCategoryDialogOpen(false);
      updateCategoryForm.reset();
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const updateCategoryForm = useForm({
    defaultValues: { id: "", name: "", slug: "" },
    validators: { onSubmit: updateCategorySchema },
    onSubmit: async ({ value }) => updateCategoryMutation.mutate(value),
  });

  const columns: ColumnDef<Awaited<ReturnType<typeof functional.api.category.getAllCategories>>["data"][0]>[] = useMemo(
    () => [
      {
        id: "#",
        header: "#",
        cell: ({ row }) => {
          return (page - 1) * limit + row.index + 1;
        },
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "slug",
        header: "Slug",
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => {
          return (
            <div className="flex gap-x-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  const cat = row.original;
                  updateCategoryForm.setFieldValue("id", cat.id);
                  updateCategoryForm.setFieldValue("name", cat.name);
                  updateCategoryForm.setFieldValue("slug", cat.slug);
                  setUpdateCategoryDialogOpen(true);
                }}
              >
                <PenBox />
              </Button>
              <Button
                variant="destructive"
                size="icon-sm"
                onClick={() => deleteCategoryMutation.mutate(row.original.id)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit],
  );

  const fallbackData = useMemo(() => [], []);

  const table = useReactTable({
    data: findCategoriesQuery.data?.data ?? fallbackData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: findCategoriesQuery.data?.meta.total ?? 0,
  });

  const createCategoryForm = useForm({
    defaultValues: { name: "", slug: "" },
    validators: { onSubmit: createCategorySchema },
    onSubmit: async ({ value }) => createCategoryMutation.mutate(value),
  });

  return (
    <div>
      <Dialog open={updateCategoryDialogOpen} onOpenChange={setUpdateCategoryDialogOpen}>
        <form
          id="update-category-form"
          onSubmit={(e) => {
            e.preventDefault();
            updateCategoryForm.handleSubmit();
          }}
        >
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Update Category</DialogTitle>
              <DialogDescription>Update category details</DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <updateCategoryForm.Field name="name">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Category name"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updateCategoryForm.Field>

              <updateCategoryForm.Field name="slug">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Slug</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="category-slug"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updateCategoryForm.Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <Button type="submit" form="update-category-form" disabled={updateCategoryForm.state.isSubmitting}>
                {updateCategoryForm.state.isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Category</h1>

        <Dialog open={createCategoryDialogOpen} onOpenChange={setCreateCategoryDialogOpen}>
          <form
            id="create-category-form"
            onSubmit={(e) => {
              e.preventDefault();
              createCategoryForm.handleSubmit();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus />
                New Category
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>New Category</DialogTitle>
                <DialogDescription>Create a new category</DialogDescription>
              </DialogHeader>

              <FieldGroup>
                <createCategoryForm.Field name="name">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Name</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Category name"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createCategoryForm.Field>

                <createCategoryForm.Field name="slug">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Slug</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="category-slug"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createCategoryForm.Field>
              </FieldGroup>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                <Button type="submit" form="create-category-form" disabled={createCategoryForm.state.isSubmitting}>
                  {createCategoryForm.state.isSubmitting ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </div>

      {/* Data */}
      <InputGroup className="mt-4">
        <InputGroupInput placeholder="Search..." onChange={(e) => handleSearch.maybeExecute(e.target.value)} />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <div className="rounded border mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {findCategoriesQuery.isPending || handleSearch.state.isPending ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <div className="flex items-center justify-center h-full w-full">
                    <Spinner className="size-10" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No categories found</EmptyTitle>
                      <EmptyDescription>Get started by creating a new category.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-x-4 mt-4">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={findCategoriesQuery.data ? page >= Math.ceil(findCategoriesQuery.data.meta.total / limit) : true}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>

        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            setLimit(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Limit</SelectLabel>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
