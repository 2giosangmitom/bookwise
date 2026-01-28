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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, PenBox, Search } from "lucide-react";
import { functional, HttpError } from "@bookwise/sdk";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { API_CONNECTION } from "@/lib/constants";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { DatePicker } from "@/components/date-picker";
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
import dayjs from "dayjs";

const createAuthorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  biography: z.string().min(1, "Biography is required"),
  slug: z.string().min(1, "Slug is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  dateOfDeath: z.string(),
});

const updateAuthorSchema = createAuthorSchema.extend({
  id: z.string(),
});

export default function AuthorsPage() {
  const fetchApi = useFetchApiContext();
  const queryClient = useQueryClient();

  const [createAuthorDialogOpen, setCreateAuthorDialogOpen] = useState(false);
  const [updateAuthorDialogOpen, setUpdateAuthorDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const findAuthorsQuery = useQuery({
    queryKey: ["authors", page, limit, search],
    queryFn: () =>
      fetchApi((accessToken) =>
        functional.api.author.getAllAuthors(
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
    {
      wait: 500,
    },
    (state) => ({ isPending: state.isPending }),
  );

  const createAuthorMutation = useMutation({
    mutationFn: (author: Parameters<typeof functional.api.author.createAuthor>[1]) =>
      fetchApi((accessToken) =>
        functional.api.author.createAuthor(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          author,
        ),
      ),
    onSuccess: async () => {
      toast.success("Author created successfully", {
        position: "top-center",
      });
      setCreateAuthorDialogOpen(false);
      createAuthorForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const deleteAuthorMutation = useMutation({
    mutationFn: (authorId: string) =>
      fetchApi((accessToken) =>
        functional.api.author.deleteAuthor(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          authorId,
        ),
      ),
    onSuccess: async () => {
      toast.success("Author deleted successfully", {
        position: "top-center",
      });
      await queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const updateAuthorMutation = useMutation({
    mutationFn: (data: { id: string } & Parameters<typeof functional.api.author.updateAuthor>[2]) =>
      fetchApi((accessToken) =>
        functional.api.author.updateAuthor(
          {
            ...API_CONNECTION,
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
          data.id,
          {
            name: data.name,
            biography: data.biography,
            slug: data.slug,
            dateOfBirth: data.dateOfBirth,
            dateOfDeath: data.dateOfDeath,
          },
        ),
      ),
    onSuccess: async () => {
      toast.success("Author updated successfully", {
        position: "top-center",
      });
      await queryClient.invalidateQueries({ queryKey: ["authors"] });
      setUpdateAuthorDialogOpen(false);
      updateAuthorForm.reset();
    },
    onError: (error) => {
      toast.error("Failure", {
        description: error instanceof HttpError ? JSON.parse(error.message).message : "Unknown error occurred",
        position: "top-center",
      });
    },
  });

  const updateAuthorForm = useForm({
    defaultValues: {
      id: "",
      name: "",
      biography: "",
      slug: "",
      dateOfBirth: "",
      dateOfDeath: "",
    },
    validators: {
      onSubmit: updateAuthorSchema,
    },
    onSubmit: async ({ value }) => {
      updateAuthorMutation.mutate({
        ...value,
        dateOfDeath: value.dateOfDeath || null,
      });
    },
  });

  const columns: ColumnDef<Awaited<ReturnType<typeof functional.api.author.getAllAuthors>>["data"][0]>[] = useMemo(
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
        accessorKey: "biography",
        header: "Biography",
      },
      {
        accessorKey: "slug",
        header: "Slug",
      },
      {
        accessorKey: "dateOfBirth",
        header: "Date of birth",
      },
      {
        accessorKey: "dateOfDeath",
        header: "Date of death",
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
                  const author = row.original;
                  updateAuthorForm.setFieldValue("id", author.id);
                  updateAuthorForm.setFieldValue("name", author.name);
                  updateAuthorForm.setFieldValue("biography", author.biography);
                  updateAuthorForm.setFieldValue("slug", author.slug);
                  updateAuthorForm.setFieldValue("dateOfBirth", author.dateOfBirth);
                  updateAuthorForm.setFieldValue("dateOfDeath", author.dateOfDeath || "");
                  setUpdateAuthorDialogOpen(true);
                }}
              >
                <PenBox />
              </Button>
              <Button variant="destructive" size="icon-sm" onClick={() => deleteAuthorMutation.mutate(row.original.id)}>
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
    data: findAuthorsQuery.data?.data ?? fallbackData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: findAuthorsQuery.data?.meta.total ?? 0,
  });

  const createAuthorForm = useForm({
    defaultValues: {
      name: "",
      biography: "",
      slug: "",
      dateOfBirth: "",
      dateOfDeath: "",
    },
    validators: {
      onSubmit: createAuthorSchema,
    },
    onSubmit: async ({ value }) => {
      createAuthorMutation.mutate({
        ...value,
        dateOfDeath: value.dateOfDeath || null,
      });
    },
  });

  return (
    <div>
      <Dialog open={updateAuthorDialogOpen} onOpenChange={setUpdateAuthorDialogOpen}>
        <form
          id="update-author-form"
          onSubmit={(e) => {
            e.preventDefault();
            updateAuthorForm.handleSubmit();
          }}
        >
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Update Author</DialogTitle>
              <DialogDescription>Update author details</DialogDescription>
            </DialogHeader>

            <FieldGroup>
              {/* Name */}
              <updateAuthorForm.Field name="name">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Author name"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updateAuthorForm.Field>

              {/* Biography */}
              <updateAuthorForm.Field name="biography">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Biography</FieldLabel>
                      <Textarea
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Author biography"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updateAuthorForm.Field>

              {/* Slug */}
              <updateAuthorForm.Field name="slug">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Slug</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="author-slug"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updateAuthorForm.Field>

              {/* Date of birth */}
              <updateAuthorForm.Field name="dateOfBirth">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  const value = field.state.value ? new Date(field.state.value) : undefined;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Date of birth</FieldLabel>
                      <DatePicker
                        value={value}
                        onChange={(date) => field.handleChange(date ? dayjs(date).format("YYYY-MM-DD") : "")}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updateAuthorForm.Field>

              {/* Date of death (optional) */}
              <updateAuthorForm.Field name="dateOfDeath">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                  const value = field.state.value ? new Date(field.state.value) : undefined;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Date of death</FieldLabel>
                      <DatePicker
                        value={value}
                        onChange={(date) => field.handleChange(date ? dayjs(date).format("YYYY-MM-DD") : "")}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </updateAuthorForm.Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <Button type="submit" form="update-author-form" disabled={updateAuthorForm.state.isSubmitting}>
                {updateAuthorForm.state.isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Author</h1>

        <Dialog open={createAuthorDialogOpen} onOpenChange={setCreateAuthorDialogOpen}>
          <form
            id="create-author-form"
            onSubmit={(e) => {
              e.preventDefault();
              createAuthorForm.handleSubmit();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus />
                New Author
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>New Author</DialogTitle>
                <DialogDescription>Create a new author</DialogDescription>
              </DialogHeader>

              <FieldGroup>
                {/* Name */}
                <createAuthorForm.Field name="name">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Name</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Author name"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createAuthorForm.Field>

                {/* Biography */}
                <createAuthorForm.Field name="biography">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Biography</FieldLabel>
                        <Textarea
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Author biography"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createAuthorForm.Field>

                {/* Slug */}
                <createAuthorForm.Field name="slug">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Slug</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="author-slug"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createAuthorForm.Field>

                {/* Date of birth */}
                <createAuthorForm.Field name="dateOfBirth">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    const value = field.state.value ? new Date(field.state.value) : undefined;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Date of birth</FieldLabel>
                        <DatePicker
                          value={value}
                          onChange={(date) => field.handleChange(date ? dayjs(date).format("YYYY-MM-DD") : "")}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createAuthorForm.Field>

                {/* Date of death (optional) */}
                <createAuthorForm.Field name="dateOfDeath">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                    const value = field.state.value ? new Date(field.state.value) : undefined;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Date of death</FieldLabel>
                        <DatePicker
                          value={value}
                          onChange={(date) => field.handleChange(date ? dayjs(date).format("YYYY-MM-DD") : "")}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </createAuthorForm.Field>
              </FieldGroup>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                <Button type="submit" form="create-author-form" disabled={createAuthorForm.state.isSubmitting}>
                  {createAuthorForm.state.isSubmitting ? "Creating..." : "Create"}
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
            {findAuthorsQuery.isPending || handleSearch.state.isPending ? (
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
                      <EmptyTitle>No authors found</EmptyTitle>
                      <EmptyDescription>Get started by creating a new author.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-x-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => {
            setPage((prev) => prev - 1);
          }}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={findAuthorsQuery.data ? page >= Math.ceil(findAuthorsQuery.data.meta.total / limit) : true}
          onClick={() => {
            setPage((prev) => prev + 1);
          }}
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
