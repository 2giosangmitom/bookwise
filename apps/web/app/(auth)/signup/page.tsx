import SignUpForm from '../_components/SignUpForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - BookWise',
  description:
    'Create your BookWise account to access a world of academic resources and manage your library efficiently.'
};

export default function SignUp() {
  return (
    <>
      <h1 className="text-4xl font-bold mb-6">Create your account</h1>
      <p className="mb-6">Join BookWise today and unlock a world of academic resources at your fingertips.</p>
      <SignUpForm />
    </>
  );
}
