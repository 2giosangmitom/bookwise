export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-between min-h-screen">
      <div className="bg-[url('/images/library-with-books.jpg')] bg-cover bg-center inset-0 pt-10 pl-10 w-1/2 relative before:absolute before:left-0 before:top-0 before:w-full before:h-full before:bg-gray-900/80 hidden md:block">
        <div className="absolute flex gap-x-4 z-10">
          <div className="bg-blue-600 shadow-xl p-2 rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo.svg" alt="Logo" width={20} height={20} />
          </div>
          <span className="font-bold text-white text-lg">BookWise</span>
        </div>
        <div className="absolute text-white bottom-32 left-10 z-10 max-w-1/2">
          <h1 className="text-5xl font-bold leading-tight">Your gateway to knowledge</h1>
          <p className="mt-6">
            Access a world of academic resources with BookWise, your trusted university library management system.
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 md:m-10 lg:m-20 m-4">{children}</div>
    </div>
  );
}
