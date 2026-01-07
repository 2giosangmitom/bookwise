'use client';

import PublicHeader from '../_components/Header';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function BooksPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      <main style={{ flex: 1, padding: '64px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card>
            <Title level={2}>Browse Books</Title>
            <Paragraph>Book browsing and discovery coming soon...</Paragraph>
          </Card>
        </div>
      </main>
    </div>
  );
}
