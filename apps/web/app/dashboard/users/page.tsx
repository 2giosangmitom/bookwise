'use client';

import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function UsersPage() {
  return (
    <Card>
      <Title level={3}>Users Management</Title>
      <Paragraph type="secondary">This page is under development. You will be able to manage users here.</Paragraph>
    </Card>
  );
}
