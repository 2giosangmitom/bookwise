import SigninForm from "@/components/signin-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - BookWise",
  description: "Sign in to your BookWise account.",
};

export default function SigninPage() {
  return <SigninForm />;
}
