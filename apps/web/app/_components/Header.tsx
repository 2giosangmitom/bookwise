'use client';

import { useAuthContext } from '@/contexts/Auth';
import { Button, Dropdown, Flex, Typography, theme } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/api/auth';
import { message } from 'antd';

const { Text } = Typography;
const { useToken } = theme;

export default function PublicHeader() {
  const { user } = useAuthContext();
  const { token } = useToken();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSignOut = async () => {
    try {
      await signOut();
      messageApi.success('Signed out successfully');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
      }
    }
  };

  const userMenuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardOutlined />,
      onClick: () => router.push('/dashboard')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'signout',
      label: 'Sign Out',
      icon: <LogoutOutlined />,
      onClick: handleSignOut
    }
  ];

  return (
    <>
      {contextHolder}
      <header
        style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
        <Flex
          justify="space-between"
          align="center"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 64
          }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Flex align="center" gap={8}>
              <Image src="/icons/logo.svg" alt="BookWise Logo" width={32} height={32} />
              <Text
                strong
                style={{
                  fontSize: 20,
                  color: token.colorText
                }}>
                BookWise
              </Text>
            </Flex>
          </Link>

          {/* Navigation & Auth */}
          <Flex gap={16} align="center">
            <Link href="/catalog" style={{ color: token.colorText, textDecoration: 'none' }}>
              Catalog
            </Link>
            <Link href="/books" style={{ color: token.colorText, textDecoration: 'none' }}>
              Books
            </Link>
            <Link href="/about" style={{ color: token.colorText, textDecoration: 'none' }}>
              About
            </Link>

            {user ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <Button type="text" icon={<UserOutlined />}>
                  <Text style={{ marginRight: 4 }}>
                    {user.name}
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                      ({user.role})
                    </Text>
                  </Text>
                  <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>
            ) : (
              <Flex gap={8}>
                <Link href="/signin">
                  <Button type="default">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button type="primary">Sign Up</Button>
                </Link>
              </Flex>
            )}
          </Flex>
        </Flex>
      </header>
    </>
  );
}
