import SignUpForm from "@/components/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - BookWise",
  description: "Create a new account on BookWise to manage your reading list.",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
