"use client";

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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuthContext } from "@/contexts/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useMemo } from "react";
import { Separator } from "@radix-ui/react-separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardShell({ children }: React.PropsWithChildren) {
  const { auth } = useAuthContext();

  const displayName = useMemo(
    () => auth && `${auth.user.firstName}${auth.user.lastName && ` ${auth.user.lastName}`}`,
    [auth],
  );

  const sidebarItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: HomeIcon,
    },
    {
      href: "/dashboard/users",
      label: "Users",
      icon: UsersIcon,
    },
    {
      href: "/dashboard/books",
      label: "Books",
      icon: BookOpenIcon,
    },
    {
      href: "/dashboard/authors",
      label: "Authors",
      icon: UserIcon,
    },
    {
      href: "/dashboard/categories",
      label: "Categories",
      icon: TagIcon,
    },
    {
      href: "/dashboard/publishers",
      label: "Publishers",
      icon: ArchiveIcon,
    },
    {
      href: "/dashboard/loans",
      label: "Loans",
      icon: ClipboardListIcon,
    },
    {
      href: "/dashboard/book-copies",
      label: "Book Copies",
      icon: CopyIcon,
    },
    {
      href: "/dashboard/reservations",
      label: "Reservations",
      icon: CalendarIcon,
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar side="left" variant="sidebar" collapsible="icon" className="w-64">
          <div className="flex h-full flex-col">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2">
                <NotebookPen className="size-7 text-primary" aria-hidden />
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold">Bookwise</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarMenu>
                  {sidebarItems.map(({ href, label, icon: Icon }) => (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild>
                        <Link href={href}>
                          <Icon className="size-4" />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1 p-6 flex">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>

            <div className="flex items-center gap-x-4">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={auth?.user.photoFileName ?? undefined} alt="User avatar" />
                    <AvatarFallback>BW</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <div className="flex gap-4 py-2 px-3 justify-start items-center">
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={auth?.user.photoFileName ?? undefined} alt="User avatar" />
                      <AvatarFallback>BW</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-base font-medium">{displayName}</p>
                      <p className="text-sm text-muted-foreground">{auth?.user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <Separator className="h-px bg-accent" />

          <main className="min-h-[60vh] mt-10">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
