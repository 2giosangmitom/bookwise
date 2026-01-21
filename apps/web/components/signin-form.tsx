"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { NotebookPen } from "lucide-react";
import { Input } from "./ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Button } from "./ui/button";
import Link from "next/link";
import { functional, HttpError } from "@bookwise/sdk";
import { API_CONNECTION } from "@/lib/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const signUpFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signUpFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await functional.api.auth.signin(API_CONNECTION, value);
        toast.success("Signed in successfully", {
          position: "top-center",
        });
        router.push("/");
      } catch (error) {
        toast.error("Failure", {
          description:
            error instanceof HttpError
              ? error.status === 401
                ? "Invalid email or password"
                : error.message
              : "Something went wrong",
          position: "top-center",
        });
      }
    },
  });

  return (
    <Card className="w-full max-w-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <CardHeader className="text-center">
        <NotebookPen className="mx-auto mb-4 h-10 w-10" />
        <CardTitle>Welcome to Bookwise</CardTitle>
        <CardDescription>Sign in to your Bookwise account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="signin-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="email@domain.com"
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      type="password"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Password"
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Field>
          <Button type="submit" form="signin-form" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </Field>
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
