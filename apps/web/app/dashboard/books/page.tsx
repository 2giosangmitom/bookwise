'use client';

import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function BooksPage() {
  return (
    <Card>
      <Title level={3}>Books Management</Title>
      <Paragraph type="secondary">This page is under development. You will be able to manage books here.</Paragraph>
    </Card>
  );
}
