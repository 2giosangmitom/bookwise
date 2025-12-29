'use client';

import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function AuthorsPage() {
  return (
    <Card>
      <Title level={3}>Authors Management</Title>
      <Paragraph type="secondary">This page is under development. You will be able to manage authors here.</Paragraph>
    </Card>
  );
}
