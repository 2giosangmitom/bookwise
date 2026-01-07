'use client';

import { Card, Col, Flex, Input, Row, Tag, Typography, Spin, theme } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicHeader from './_components/Header';
import { useQuery } from '@tanstack/react-query';
import { getNewBooks } from '@/lib/api/book';

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;

export default function Home() {
  const { token } = useToken();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: newBooksData, isLoading } = useQuery({
    queryKey: ['newBooks'],
    queryFn: () => getNewBooks()
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />

      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
          color: 'white',
          padding: '80px 24px',
          textAlign: 'center'
        }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', fontSize: 48, marginBottom: 16 }}>
            Unlock Knowledge
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 32 }}>
            Explore millions of books, articles, journals, and digital resources to empower your academic journey.
          </Paragraph>

          <Input.Search
            size="large"
            placeholder="Search for books by title, author, ISBN..."
            enterButton="Search"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ maxWidth: 600 }}
          />
        </div>
      </section>

      {/* Fresh on the Shelves */}
      <section style={{ padding: '64px 24px', background: token.colorBgContainer }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
            <Title level={2}>Fresh on the Shelves</Title>
            <Text type="secondary">Explore the latest additions to our library collection</Text>
          </Flex>

          {isLoading ? (
            <Flex justify="center" style={{ padding: '48px 0' }}>
              <Spin size="large" />
            </Flex>
          ) : (
            <Row gutter={[24, 24]}>
              {newBooksData?.data?.map((book) => (
                <Col xs={24} sm={12} md={8} lg={6} key={book.book_id}>
                  <Card
                    hoverable
                    cover={
                      book.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt={book.title} src={book.image_url} style={{ height: 280, objectFit: 'cover' }} />
                      ) : (
                        <div
                          style={{
                            height: 280,
                            background: token.colorBgTextHover,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                          <Text type="secondary">No Image</Text>
                        </div>
                      )
                    }
                    styles={{ body: { padding: 16 } }}>
                    <Title level={5} ellipsis={{ rows: 2 }} style={{ marginBottom: 8, minHeight: 48 }}>
                      {book.title}
                    </Title>
                    {book.authors && book.authors.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                        {book.authors.map((a) => a.name).join(', ')}
                      </Text>
                    )}
                    <Flex gap={4} wrap style={{ marginTop: 8 }}>
                      {book.available_copies > 0 ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          {book.available_copies} Available
                        </Tag>
                      ) : (
                        <Tag icon={<CloseCircleOutlined />} color="error">
                          Not Available
                        </Tag>
                      )}
                    </Flex>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </section>
    </div>
  );
}
