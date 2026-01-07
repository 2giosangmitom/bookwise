'use client';

import PublicHeader from '../_components/Header';
import { Card, Typography, Flex } from 'antd';

const { Title, Paragraph } = Typography;

export default function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicHeader />
      <main style={{ flex: 1, padding: '64px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card>
            <Title level={2}>About BookWise</Title>
            <Flex vertical gap={16}>
              <Paragraph>
                BookWise is a modern university library management system designed to empower students and faculty with
                seamless access to knowledge resources.
              </Paragraph>
              <Paragraph>
                Our platform provides comprehensive tools for managing book catalogs, tracking loans, and facilitating
                academic research through our extensive collection of books, journals, and digital resources.
              </Paragraph>
              <Title level={4}>Our Mission</Title>
              <Paragraph>
                To support academic excellence by providing accessible, efficient, and user-friendly library services
                that meet the evolving needs of our university community.
              </Paragraph>
            </Flex>
          </Card>
        </div>
      </main>
    </div>
  );
}
