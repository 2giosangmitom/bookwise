'use client';

import { getTotalLoans, getLoanStatusStats } from '@/lib/api/loan';
import { getBookCloneConditionStats } from '@/lib/api/bookClone';
import { useAuthContext } from '@/contexts/Auth';
import { ReadFilled, WarningFilled } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Skeleton, Typography } from 'antd';
import { getKPopularCategories } from '@/lib/api/category';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const { accessToken } = useAuthContext();
  const loanStatusChartRef = useRef<HTMLCanvasElement>(null);
  const conditionChartRef = useRef<HTMLCanvasElement>(null);
  const loanStatusChartInstance = useRef<Chart | null>(null);
  const conditionChartInstance = useRef<Chart | null>(null);

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

  // Loan Status Chart
  useEffect(() => {
    if (!loanStatusStats || !loanStatusChartRef.current) return;

    if (loanStatusChartInstance.current) {
      loanStatusChartInstance.current.destroy();
    }

    const ctx = loanStatusChartRef.current.getContext('2d');
    if (!ctx) return;

    loanStatusChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Borrowed', 'Returned', 'Overdue'],
        datasets: [
          {
            label: 'Number of Loans',
            data: [loanStatusStats.data.BORROWED, loanStatusStats.data.RETURNED, loanStatusStats.data.OVERDUE],
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Loan Status Distribution'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    return () => {
      if (loanStatusChartInstance.current) {
        loanStatusChartInstance.current.destroy();
      }
    };
  }, [loanStatusStats]);

  // Book Clone Condition Chart
  useEffect(() => {
    if (!conditionStats || !conditionChartRef.current) return;

    if (conditionChartInstance.current) {
      conditionChartInstance.current.destroy();
    }

    const ctx = conditionChartRef.current.getContext('2d');
    if (!ctx) return;

    conditionChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['New', 'Good', 'Worn', 'Damaged', 'Lost'],
        datasets: [
          {
            label: 'Book Clones',
            data: [
              conditionStats.data.NEW,
              conditionStats.data.GOOD,
              conditionStats.data.WORN,
              conditionStats.data.DAMAGED,
              conditionStats.data.LOST
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(255, 99, 132, 0.6)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Book Clone Condition Distribution'
          }
        }
      }
    });

    return () => {
      if (conditionChartInstance.current) {
        conditionChartInstance.current.destroy();
      }
    };
  }, [conditionStats]);

  return (
    <>
      <Card>
        <Title level={3}>Dashboard</Title>
        <Paragraph type="secondary">Welcome back. Here&apos;s what&apos;s happening with your library today.</Paragraph>

        <Row gutter={[16, 16]} className="mt-9">
          <Col xs={24} sm={24} md={12} lg={6}>
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
          <Col xs={24} sm={24} md={12} lg={6}>
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
        </Row>
      </Card>

      <div className="mt-8">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={16}>
            <Card>
              {isLoanStatusStatsLoading ? (
                <Skeleton active />
              ) : (
                <div style={{ height: '400px' }}>
                  <canvas ref={loanStatusChartRef}></canvas>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Card>
              <Title level={4}>Popular Categories</Title>
              {isKPopularCategoriesLoading ? (
                <Skeleton active />
              ) : (
                <div className="w-full">
                  {kPopularCategories ? (
                    kPopularCategories.data.map((category) => (
                      <div key={category.category_id}>
                        <div className="flex justify-between">
                          <p>{category.name}</p>
                          <p>{((category.loan_count / kPopularCategories.meta.total_loans) * 100).toFixed(2)}%</p>
                        </div>
                        <div className="w-full bg-neutral-200 rounded mt-1">
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
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24}>
            <Card>
              {isConditionStatsLoading ? (
                <Skeleton active />
              ) : (
                <div style={{ height: '400px' }}>
                  <canvas ref={conditionChartRef}></canvas>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
