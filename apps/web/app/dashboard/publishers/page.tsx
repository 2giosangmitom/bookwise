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

const createPublisherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  website: z.string().min(1, "Website is required"),
  slug: z.string().min(1, "Slug is required"),
});

const updatePublisherSchema = createPublisherSchema.extend({ id: z.string() });

export default function PublishersPage() {
  const fetchApi = useFetchApiContext();
  const queryClient = useQueryClient();

  const [createPublisherDialogOpen, setCreatePublisherDialogOpen] = useState(false);
  const [updatePublisherDialogOpen, setUpdatePublisherDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const findPublishersQuery = useQuery({
    queryKey: ["publishers", page, limit, search],
    queryFn: () =>
      fetchApi((accessToken) =>
        functional.api.publisher.getAllPublishers(
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

  const createPublisherMutation = useMutation({
    mutationFn: (publisher: Parameters<typeof functional.api.publisher.createPublisher>[1]) =>
      fetchApi((accessToken) =>
        functional.api.publisher.createPublisher(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          publisher,
        ),
      ),
    onSuccess: async () => {
      toast.success("Publisher created successfully", { position: "top-center" });
      setCreatePublisherDialogOpen(false);
      createPublisherForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["publishers"] });
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const deletePublisherMutation = useMutation({
    mutationFn: (publisherId: string) =>
      fetchApi((accessToken) =>
        functional.api.publisher.deletePublisher(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          publisherId,
        ),
      ),
    onSuccess: async () => {
      toast.success("Publisher deleted successfully", { position: "top-center" });
      await queryClient.invalidateQueries({ queryKey: ["publishers"] });
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const updatePublisherMutation = useMutation({
    mutationFn: (data: { id: string } & Parameters<typeof functional.api.publisher.updatePublisher>[2]) =>
      fetchApi((accessToken) =>
        functional.api.publisher.updatePublisher(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          data.id,
          {
            name: data.name,
            description: data.description,
            website: data.website,
            slug: data.slug,
          },
        ),
      ),
    onSuccess: async () => {
      toast.success("Publisher updated successfully", { position: "top-center" });
      await queryClient.invalidateQueries({ queryKey: ["publishers"] });
      setUpdatePublisherDialogOpen(false);
      updatePublisherForm.reset();
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const updatePublisherForm = useForm({
    defaultValues: { id: "", name: "", description: "", website: "", slug: "" },
    validators: { onSubmit: updatePublisherSchema },
    onSubmit: async ({ value }) => updatePublisherMutation.mutate(value),
  });

  const columns: ColumnDef<Awaited<ReturnType<typeof functional.api.publisher.getAllPublishers>>["data"][0]>[] =
    useMemo(
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
          accessorKey: "description",
          header: "Description",
        },
        {
          accessorKey: "website",
          header: "Website",
        },
        {
          accessorKey: "slug",
          header: "Slug",
        },
        {
          accessorKey: "photoFileName",
          header: "Photo",
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
                    const p = row.original;
                    updatePublisherForm.setFieldValue("id", p.id);
                    updatePublisherForm.setFieldValue("name", p.name);
                    updatePublisherForm.setFieldValue("description", p.description);
                    updatePublisherForm.setFieldValue("website", p.website);
                    updatePublisherForm.setFieldValue("slug", p.slug);
                    setUpdatePublisherDialogOpen(true);
                  }}
                >
                  <PenBox />
                </Button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => deletePublisherMutation.mutate(row.original.id)}
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
    data: findPublishersQuery.data?.data ?? fallbackData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: findPublishersQuery.data?.meta.total ?? 0,
  });

  const createPublisherForm = useForm({
    defaultValues: { name: "", description: "", website: "", slug: "" },
    validators: { onSubmit: createPublisherSchema },
    onSubmit: async ({ value }) => createPublisherMutation.mutate(value),
  });

  return (
    <div>
      <Dialog open={updatePublisherDialogOpen} onOpenChange={setUpdatePublisherDialogOpen}>
        <form
          id="update-publisher-form"
          onSubmit={(e) => {
            e.preventDefault();
            updatePublisherForm.handleSubmit();
          }}
        >
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Update Publisher</DialogTitle>
              <DialogDescription>Update publisher details</DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <updatePublisherForm.Field name="name">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Publisher name"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updatePublisherForm.Field>

              <updatePublisherForm.Field name="description">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Description</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Publisher description"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updatePublisherForm.Field>

              <updatePublisherForm.Field name="website">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Website</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Publisher website"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updatePublisherForm.Field>

              <updatePublisherForm.Field name="slug">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Slug</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="publisher-slug"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updatePublisherForm.Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <Button type="submit" form="update-publisher-form" disabled={updatePublisherForm.state.isSubmitting}>
                {updatePublisherForm.state.isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Publisher</h1>

        <Dialog open={createPublisherDialogOpen} onOpenChange={setCreatePublisherDialogOpen}>
          <form
            id="create-publisher-form"
            onSubmit={(e) => {
              e.preventDefault();
              createPublisherForm.handleSubmit();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus />
                New Publisher
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>New Publisher</DialogTitle>
                <DialogDescription>Create a new publisher</DialogDescription>
              </DialogHeader>

              <FieldGroup>
                <createPublisherForm.Field name="name">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Name</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Publisher name"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createPublisherForm.Field>

                <createPublisherForm.Field name="description">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Description</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Publisher description"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createPublisherForm.Field>

                <createPublisherForm.Field name="website">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Website</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Publisher website"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createPublisherForm.Field>

                <createPublisherForm.Field name="slug">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Slug</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="publisher-slug"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createPublisherForm.Field>
              </FieldGroup>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                <Button type="submit" form="create-publisher-form" disabled={createPublisherForm.state.isSubmitting}>
                  {createPublisherForm.state.isSubmitting ? "Creating..." : "Create"}
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
            {findPublishersQuery.isPending || handleSearch.state.isPending ? (
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
                      <EmptyTitle>No publishers found</EmptyTitle>
                      <EmptyDescription>Get started by creating a new publisher.</EmptyDescription>
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
          disabled={findPublishersQuery.data ? page >= Math.ceil(findPublishersQuery.data.meta.total / limit) : true}
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
