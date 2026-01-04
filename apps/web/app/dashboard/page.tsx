'use client';

import { getTotalLoans, getLoanStatusStats } from '@/lib/api/loan';
import { getBookCloneConditionStats } from '@/lib/api/bookClone';
import { useAuthContext } from '@/contexts/Auth';
import { ReadFilled, WarningFilled, BookOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Skeleton, Typography, Spin } from 'antd';
import { getKPopularCategories, getCategoryDistribution } from '@/lib/api/category';
import DoughnutChartComponent from '@/app/_components/charts/DoughnutChart';
import BarChartComponent from '@/app/_components/charts/BarChart';

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

  const { data: loanStatusStats, isPending: isLoanStatusStatsLoading } = useQuery({
    queryKey: ['loanStatusStats'],
    queryFn: () => getLoanStatusStats(accessToken)
  });

  const { data: conditionStats, isPending: isConditionStatsLoading } = useQuery({
    queryKey: ['conditionStats'],
    queryFn: () => getBookCloneConditionStats(accessToken)
  });

  const { data: categoryDistribution, isPending: isCategoryDistributionLoading } = useQuery({
    queryKey: ['categoryDistribution'],
    queryFn: () => getCategoryDistribution(accessToken)
  });

  // Prepare data for category distribution charts
  const categories = categoryDistribution?.data ?? [];
  const totalBooks = categories.reduce((sum, cat) => sum + cat.book_count, 0);
  const categoryCount = categories.length;

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3}>Dashboard</Title>
        <Paragraph type="secondary">Welcome back. Here&apos;s what&apos;s happening with your library today.</Paragraph>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="relative h-full" style={{ backgroundColor: 'var(--color-blue-50)' }}>
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
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="relative h-full" style={{ backgroundColor: 'var(--color-red-50)' }}>
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
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="relative h-full" style={{ backgroundColor: 'var(--color-green-50)' }}>
              <Title level={4}>Total Books</Title>
              <BookOutlined className="absolute top-4 right-4 text-4xl" style={{ color: 'var(--color-green-600)' }} />
              {isCategoryDistributionLoading ? (
                <Skeleton.Input style={{ width: 100 }} active />
              ) : (
                <Typography.Text style={{ fontWeight: 'bold', fontSize: '24px' }}>{totalBooks}</Typography.Text>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card className="relative h-full" style={{ backgroundColor: 'var(--color-purple-50)' }}>
              <Title level={4}>Categories</Title>
              <AppstoreOutlined
                className="absolute top-4 right-4 text-4xl"
                style={{ color: 'var(--color-purple-600)' }}
              />
              {isCategoryDistributionLoading ? (
                <Skeleton.Input style={{ width: 100 }} active />
              ) : (
                <Typography.Text style={{ fontWeight: 'bold', fontSize: '24px' }}>{categoryCount}</Typography.Text>
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            {isLoanStatusStatsLoading ? (
              <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Spin size="large" />
              </Card>
            ) : loanStatusStats ? (
              <BarChartComponent
                title="Loan Status Distribution"
                labels={['Borrowed', 'Returned', 'Overdue']}
                datasets={[
                  {
                    label: 'Number of Loans',
                    data: [loanStatusStats.data.BORROWED, loanStatusStats.data.RETURNED, loanStatusStats.data.OVERDUE],
                    backgroundColor: '#1890ff'
                  }
                ]}
                yAxisLabel="Number of Loans"
              />
            ) : (
              <Card title="Loan Status Distribution">
                <p style={{ textAlign: 'center', color: '#999' }}>No data available</p>
              </Card>
            )}
          </Col>
          <Col xs={24} lg={12}>
            {isConditionStatsLoading ? (
              <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Spin size="large" />
              </Card>
            ) : conditionStats ? (
              <DoughnutChartComponent
                title="Book Condition Distribution"
                labels={['New', 'Good', 'Worn', 'Damaged', 'Lost']}
                datasets={[
                  {
                    label: 'Book Clones',
                    data: [
                      conditionStats.data.NEW,
                      conditionStats.data.GOOD,
                      conditionStats.data.WORN,
                      conditionStats.data.DAMAGED,
                      conditionStats.data.LOST
                    ]
                  }
                ]}
              />
            ) : (
              <Card title="Book Condition Distribution">
                <p style={{ textAlign: 'center', color: '#999' }}>No data available</p>
              </Card>
            )}
          </Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={12}>
            {isCategoryDistributionLoading ? (
              <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Spin size="large" />
              </Card>
            ) : categories.length > 0 ? (
              <BarChartComponent
                title="Category Distribution"
                labels={categories.map((cat) => cat.name)}
                datasets={[
                  {
                    label: 'Number of Books',
                    data: categories.map((cat) => cat.book_count),
                    backgroundColor: '#52c41a'
                  }
                ]}
                yAxisLabel="Number of Books"
              />
            ) : (
              <Card title="Category Distribution">
                <p style={{ textAlign: 'center', color: '#999' }}>No data available</p>
              </Card>
            )}
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Popular Categories by Loans
              </Title>
              {isKPopularCategoriesLoading ? (
                <Skeleton active />
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
                  {kPopularCategories && kPopularCategories.data.length > 0 ? (
                    kPopularCategories.data.map((category) => (
                      <div key={category.category_id} style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 500 }}>{category.name}</span>
                          <span style={{ color: '#666' }}>
                            {((category.loan_count / kPopularCategories.meta.total_loans) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '4px',
                            height: '8px',
                            overflow: 'hidden'
                          }}>
                          <div
                            style={{
                              width: `${(category.loan_count / kPopularCategories.meta.total_loans) * 100}%`,
                              backgroundColor: '#1890ff',
                              height: '100%',
                              borderRadius: '4px',
                              transition: 'all 0.3s ease'
                            }}
                            title={`${category.loan_count} loans`}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', color: '#999' }}>No data available</p>
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
