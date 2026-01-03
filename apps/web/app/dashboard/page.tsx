'use client';

import { getTotalLoans } from '@/lib/api/loan';
import useTokenStore from '@/stores/useTokenStore';
import { ReadFilled, WarningFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton, Space, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const accessToken = useTokenStore((state) => state.accessToken);
  const { data: totalActiveLoans, isPending: isActiveLoansLoading } = useQuery({
    queryKey: ['totalActiveLoans'],
    queryFn: () => getTotalLoans(accessToken, 'BORROWED')
  });
  const { data: totalOverdueLoans, isPending: isOverdueLoansLoading } = useQuery({
    queryKey: ['totalOverdueLoans'],
    queryFn: () => getTotalLoans(accessToken, 'OVERDUE')
  });

  return (
    <Card>
      <Title level={3}>Dashboard</Title>
      <Paragraph type="secondary">Welcome back. Here&apos;s what&apos;s happening with your library today.</Paragraph>

      <Space size={36} className="mt-9">
        <Card className="relative" style={{ width: 250, height: 150, backgroundColor: 'var(--color-blue-50)' }}>
          <Title level={4}>Active Loans</Title>
          <ReadFilled className="absolute top-4 right-4 text-4xl" style={{ color: 'var(--color-blue-600)' }} />
          {isActiveLoansLoading ? (
            <Skeleton.Input style={{ width: 100 }} active />
          ) : (
            <Typography.Text style={{ fontWeight: 'bold', fontSize: '24px' }}>
              {totalActiveLoans ? totalActiveLoans.data.total_loans : 0}
            </Typography.Text>
          )}
        </Card>
        <Card className="relative" style={{ width: 250, height: 150, backgroundColor: 'var(--color-red-50)' }}>
          <Title level={4}>Overdue Loans</Title>
          <WarningFilled className="absolute top-4 right-4 text-4xl" style={{ color: 'var(--color-red-600)' }} />
          {isOverdueLoansLoading ? (
            <Skeleton.Input style={{ width: 100 }} active />
          ) : (
            <Typography.Text style={{ fontWeight: 'bold', fontSize: '24px' }}>
              {totalOverdueLoans ? totalOverdueLoans.data.total_loans : 0}
            </Typography.Text>
          )}
        </Card>
      </Space>
    </Card>
  );
}
