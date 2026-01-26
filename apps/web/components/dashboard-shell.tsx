"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  UserIcon,
  TagIcon,
  ArchiveIcon,
  ClipboardListIcon,
  CopyIcon,
  CalendarIcon,
  NotebookPen,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/auth";

export default function DashboardShell({ children }: React.PropsWithChildren) {
  const { auth } = useAuthContext();

  const user = auth?.user;
  const displayName = user ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}` : "Admin";
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "AD";

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar side="left" variant="sidebar" collapsible="icon" className="w-64">
          <div className="flex h-full flex-col">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2">
                <NotebookPen className="size-7 text-primary" aria-hidden />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Bookwise</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard">
                        <HomeIcon className="size-4" />
                        <span>Overview</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/users">
                        <UsersIcon className="size-4" />
                        <span>Users</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/books">
                        <BookOpenIcon className="size-4" />
                        <span>Books</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/authors">
                        <UserIcon className="size-4" />
                        <span>Authors</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/categories">
                        <TagIcon className="size-4" />
                        <span>Categories</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/publishers">
                        <ArchiveIcon className="size-4" />
                        <span>Publishers</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/loans">
                        <ClipboardListIcon className="size-4" />
                        <span>Loans</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/book-copies">
                        <CopyIcon className="size-4" />
                        <span>Book Copies</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/reservations">
                        <CalendarIcon className="size-4" />
                        <span>Reservations</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Sessions route removed */}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarSeparator />
              <div className="flex items-center justify-between gap-2 px-2">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    {user?.photoFileName ? (
                      <AvatarImage src={`/uploads/${user.photoFileName}`} alt={displayName} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">{displayName}</span>
                    <span className="text-xs text-muted-foreground">{user?.email ?? "—"}</span>
                  </div>
                </div>
                <div>
                  <Button variant="ghost" size="icon" aria-label="Logout">
                    ⎋
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1 p-6">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">New</Button>
              <ModeToggle />
              <Avatar className="size-8">AD</Avatar>
            </div>
          </header>

          <main className="min-h-[60vh]">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
