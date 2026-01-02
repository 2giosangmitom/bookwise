'use client';

import { useAuthContext } from '@/contexts/Auth';
import {
  BookOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ShopOutlined,
  SolutionOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Layout, Typography, Menu, Dropdown, Button, Space, Flex } from 'antd';
import NextImage from 'next/image';
import { useMemo } from 'react';
import Link from 'next/link';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/api/auth';
import useTokenStore from '@/stores/useTokenStore';

type NavItem = {
  key: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
  roles?: ('ADMIN' | 'LIBRARIAN' | 'MEMBER')[];
};

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardOutlined />
  },
  {
    key: 'books',
    label: 'Books',
    href: '/dashboard/books',
    icon: <BookOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  {
    key: 'authors',
    label: 'Authors',
    href: '/dashboard/authors',
    icon: <TeamOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  {
    key: 'publishers',
    label: 'Publishers',
    href: '/dashboard/publishers',
    icon: <ShopOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  {
    key: 'loan',
    label: 'Loan',
    href: '/dashboard/loan',
    icon: <SolutionOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  {
    key: 'categories',
    label: 'Categories',
    href: '/dashboard/categories',
    icon: <TagsOutlined />,
    roles: ['ADMIN', 'LIBRARIAN']
  },
  {
    key: 'users',
    label: 'Users',
    href: '/dashboard/users',
    icon: <TeamOutlined />,
    roles: ['ADMIN']
  }
];

export default function DashboardShell({ children }: React.PropsWithChildren) {
  const authContext = useAuthContext();
  const user = authContext.user;
  const pathname = usePathname();
  const router = useRouter();
  const setAccessToken = useTokenStore((state) => state.setAccessToken);

  const selectedKey = useMemo(() => {
    const key = navItems.find((item) => item.href === pathname)?.key;
    return key || 'dashboard';
  }, [pathname]);

  const filteredNavItems = useMemo(
    () =>
      navItems
        .filter((item) => !item.roles || item.roles.includes(user!.role))
        .map((item) => ({
          key: item.key,
          icon: item.icon,
          label: <Link href={item.href || '/dashboard'}>{item.label}</Link>
        })),
    [user]
  );

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: async () => {
        try {
          await signOut();
        } catch (error) {
          console.error('Error during sign out:', error);
        } finally {
          setAccessToken(null);
          router.push('/signin');
        }
      }
    }
  ];

  if (!user) {
    redirect('/signin');
  }

  return (
    <Layout hasSider>
      <Layout.Sider
        collapsedWidth={0}
        width={240}
        style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 1000
        }}
        className="shadow-sm"
        breakpoint="lg">
        <Flex vertical className="h-full">
          <div className="px-4 py-5 flex items-center gap-3 border-b border-gray-100">
            <div className="bg-blue-600 p-2 rounded-lg w-10 h-10 flex items-center justify-center">
              <NextImage src="/icons/logo.svg" alt="BookWise Logo" width={10} height={10} className="w-auto h-auto" />
            </div>
            <div className="leading-tight">
              <Typography.Text strong>BookWise</Typography.Text>
              <div className="text-xs text-gray-500">Admin &amp; Staff</div>
            </div>
          </div>

          <Menu mode="inline" selectedKeys={[selectedKey]} items={filteredNavItems} className="border-r-0 flex-1" />

          <div className="p-4 border-t border-gray-100">
            <Dropdown menu={{ items: userMenuItems }}>
              <Button type="text" className="w-full h-auto">
                <Space orientation="horizontal" className="w-full">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <UserOutlined />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate capitalize">{user.role.toLowerCase()}</div>
                  </div>
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Flex>
      </Layout.Sider>

      <Layout style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Layout.Content className="p-4 overflow-auto">{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
