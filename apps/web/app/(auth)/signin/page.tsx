import SignInForm from '../_components/SignInForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - BookWise',
  description: 'Sign in to your BookWise account to access your library and bookmarks.'
};

export default function SignIn() {
  return (
    <>
      <h1 className="text-4xl font-bold mb-6">Welcome back</h1>
      <p className="mb-6">Sign in to your BookWise account to access your library and bookmarks.</p>
      <SignInForm />
    </>
  );
}
