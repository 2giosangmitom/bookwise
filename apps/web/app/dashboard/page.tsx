'use client';

import { getTotalLoans } from '@/lib/api/loan';
import { useAuthContext } from '@/contexts/Auth';
import { ReadFilled, WarningFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Skeleton, Space, Typography } from 'antd';
import { getKPopularCategories } from '@/lib/api/category';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const { accessToken } = useAuthContext();
  const { data: totalActiveLoans, isPending: isActiveLoansLoading } = useQuery({
    queryKey: ['totalActiveLoans'],
    queryFn: () => getTotalLoans(accessToken, 'BORROWED')
  });
  const { data: totalOverdueLoans, isPending: isOverdueLoansLoading } = useQuery({
    queryKey: ['totalOverdueLoans'],
    queryFn: () => getTotalLoans(accessToken, 'OVERDUE')
  });
  const { data: kPopularCategories, isPending: isKPopularCategoriesLoading } = useQuery({
    queryKey: ['kPopularCategories'],
    queryFn: () => getKPopularCategories(accessToken, 5)
  });

  return (
    <>
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

      <div className="mt-8">
        <Row gutter={16}>
          <Col span={16}>
            <Card>Placeholder for chart</Card>
          </Col>
          <Col span={8}>
            <Card>
              <Title level={4}>Popular Categories</Title>
              {isKPopularCategoriesLoading ? (
                <Skeleton active />
              ) : (
                <div className="w-full">
                  {kPopularCategories ? (
                    kPopularCategories.data.map((category) => (
                      <div key={category.category_id}>
                        <p>{category.name}</p>
                        <div className="w-full bg-neutral-200 rounded">
                          <div
                            className="bg-blue-400 h-2 rounded hover:bg-blue-500 transition-all mb-4"
                            title={`${category.loan_count} loans`}
                            style={{
                              width: `${(category.loan_count / kPopularCategories.meta.total_loans) * 100}%`
                            }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No data available.</div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
