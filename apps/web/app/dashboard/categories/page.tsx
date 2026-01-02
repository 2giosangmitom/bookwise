'use client';

import { getCategories } from '@/lib/api/category';
import { Category, GetCategoriesResponse } from '@/lib/api/types';
import useTokenStore from '@/stores/useTokenStore';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Flex, Input, Table, Typography, type TableColumnsType } from 'antd';

const { Title, Paragraph } = Typography;

const columns: TableColumnsType<Category> = [
  { title: 'ID', dataIndex: 'category_id' },
  { title: 'Name', dataIndex: 'name' },
  { title: 'Slug', dataIndex: 'slug' },
  { title: 'Created At', dataIndex: 'created_at' },
  { title: 'Updated At', dataIndex: 'updated_at' },
  {
    title: 'Actions',
    dataIndex: 'actions',
    render: () => (
      <div className="flex gap-2">
        <Button type="default" icon={<EditOutlined />} />
        <Button type="primary" icon={<DeleteOutlined />} danger />
      </div>
    )
  }
];

export default function CategoriesPage() {
  const accessToken = useTokenStore((state) => state.accessToken);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: (): Promise<GetCategoriesResponse> => getCategories(accessToken)
  });

  return (
    <>
      <Flex>
        <Card style={{ width: '100%' }}>
          <div>
            <Title level={3}>Categories Management</Title>
            <Paragraph>Organize and manage book classifications to help member find books easily.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Input prefix={<SearchOutlined />} placeholder="Search categories" style={{ width: '25%' }} />
            <Button type="primary" icon={<PlusOutlined />}>
              Add Category
            </Button>
          </Flex>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div>
              {categories && categories.data.length > 0 ? (
                <Table<Category> columns={columns} dataSource={categories.data} rowKey="category_id" bordered />
              ) : (
                <div>No categories found.</div>
              )}
            </div>
          )}
        </Card>
      </Flex>
    </>
  );
}
