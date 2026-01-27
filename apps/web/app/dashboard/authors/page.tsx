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
import { Plus } from "lucide-react";
import { functional, HttpError } from "@bookwise/sdk";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { API_CONNECTION } from "@/lib/constants";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { DatePicker } from "@/components/date-picker";
import z from "zod";
import { useFetchApiContext } from "@/contexts/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/data-table";
import { formatDate } from "@/lib/utils";

const createAuthorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  biography: z.string().min(1, "Biography is required"),
  slug: z.string().min(1, "Slug is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  dateOfDeath: z.string(),
});

export default function AuthorsPage() {
  const fetchApi = useFetchApiContext();
  const findAuthorsQuery = useQuery({
    queryKey: ["authors"],
    queryFn: () =>
      fetchApi((accessToken) =>
        functional.api.author.getAllAuthors({
          ...API_CONNECTION,
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        }),
      ),
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
      try {
        await fetchApi(async (accessToken) =>
          functional.api.author.createAuthor(
            {
              ...API_CONNECTION,
              headers: {
                authorization: `Bearer ${accessToken}`,
              },
            },
            {
              ...value,
              dateOfDeath: value.dateOfDeath || null,
            },
          ),
        );
        toast.success("Author created successfully", {
          position: "top-center",
        });
      } catch (error) {
        toast.error("Failure", {
          description: error instanceof HttpError ? error.message : "Unknown error occurred",
          position: "top-center",
        });
      }
    },
  });

  const columns: ColumnDef<Awaited<ReturnType<typeof functional.api.author.getAllAuthors>>["data"][0]>[] = [
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
      cell: ({ row }) => {
        return formatDate(new Date(row.getValue("dateOfBirth")));
      },
    },
    {
      accessorKey: "dateOfDeath",
      header: "Date of death",
      cell: ({ row }) => {
        return formatDate(new Date(row.getValue("dateOfDeath")));
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl">Author</h1>

        <Dialog>
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
                          onChange={(date) => field.handleChange(date ? date.toISOString() : "")}
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
                          onChange={(date) => field.handleChange(date ? date.toISOString() : "")}
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
      <DataTable columns={columns} data={findAuthorsQuery.data?.data ?? []} className="mt-4" />
    </div>
  );
}
