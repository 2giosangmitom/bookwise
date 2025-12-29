'use client';

import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  return (
    <Card>
      <Title level={5} className="m-0">
        Overview
      </Title>
      <Paragraph type="secondary" className="mt-2 mb-0">
        Use the sidebar to navigate between admin and staff tools. Sections are placeholders and will be wired up as
        features are built out.
      </Paragraph>
    </Card>
  );
}
