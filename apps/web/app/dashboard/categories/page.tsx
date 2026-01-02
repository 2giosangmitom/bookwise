'use client';

import { createCategory, deleteCategory, getCategories, updateCategory } from '@/lib/api/category';
import { Category, GetCategoriesResponse } from '@/lib/api/types';
import useTokenStore from '@/stores/useTokenStore';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { Button, Card, Flex, Form, Input, Modal, Table, Typography, type TableColumnsType, message } from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';

const { Title, Paragraph } = Typography;

interface CategoryFormField {
  name: string;
  slug: string;
}

export default function CategoriesPage() {
  const accessToken = useTokenStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm<CategoryFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingKey, setEditingKey] = useState('');
  const [editForm] = Form.useForm<CategoryFormField>();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', page, debouncedSearchTerm],
    queryFn: (): Promise<GetCategoriesResponse> => getCategories(accessToken, { page, searchTerm: debouncedSearchTerm })
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => deleteCategory(accessToken, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => createCategory(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      messageApi.success('Category created successfully');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: { categoryId: string; name: string; slug: string }) =>
      updateCategory(accessToken, data.categoryId, { name: data.name, slug: data.slug }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      messageApi.success('Category updated successfully');
      setEditingKey('');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const onCreateCategoryFinish = (values: CategoryFormField) => {
    createCategoryMutation.mutate(values);
    setCreateModalOpen(false);
    form.resetFields();
  };

  const handleEditSave = (categoryId: string) => {
    editForm.validateFields(['name', 'slug']).then((values) => {
      updateCategoryMutation.mutate({ categoryId, name: values.name, slug: values.slug });
    });
  };

  const columns: TableColumnsType<Category> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 250,
      render: (text, record) =>
        editingKey === record.category_id ? (
          <Form.Item name="name" style={{ margin: 0 }} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        ) : (
          text
        )
    },
    {
      title: 'Slug',
      width: 250,
      dataIndex: 'slug',
      render: (text, record) =>
        editingKey === record.category_id ? (
          <Form.Item name="slug" style={{ margin: 0 }} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        ) : (
          text
        )
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: (_, record) => formatDateTime(record.created_at),
      width: 200
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      render: (_, record) => formatDateTime(record.updated_at),
      width: 200
    },
    {
      title: 'Actions',
      width: 120,
      dataIndex: 'actions',
      render: (_, record) =>
        editingKey === record.category_id ? (
          <Flex gap="small">
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleEditSave(record.category_id)}
            />
            <Button type="default" size="small" icon={<CloseOutlined />} onClick={() => setEditingKey('')} />
          </Flex>
        ) : (
          <Flex gap="small">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingKey(record.category_id);
                editForm.setFieldsValue({ name: record.name, slug: record.slug });
              }}
            />
            <Button
              type="primary"
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => deleteCategoryMutation.mutate(record.category_id)}
            />
          </Flex>
        )
    }
  ];

  return (
    <>
      {contextHolder}
      <Flex>
        <Card style={{ width: '100%' }}>
          <div>
            <Title level={3}>Categories Management</Title>
            <Paragraph>Organize and manage book classifications to help member find books easily.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search categories"
              style={{ width: '25%' }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Add Category
            </Button>
            <Modal
              title="Add New Category"
              open={isCreateModalOpen}
              onCancel={() => setCreateModalOpen(false)}
              footer={null}>
              <Form form={form} onFinish={onCreateCategoryFinish} layout="vertical">
                <Form.Item<CategoryFormField>
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: 'Please input category name!' }]}>
                  <Input placeholder="Enter category name" />
                </Form.Item>
                <Form.Item<CategoryFormField>
                  label="Slug"
                  name="slug"
                  rules={[{ required: true, message: 'Please input category slug!' }]}>
                  <Input placeholder="Enter category slug" />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
              </Form>
            </Modal>
          </Flex>
          {isLoading || debouncedSearchTerm !== searchTerm ? (
            <Table<Category> loading columns={columns} bordered />
          ) : (
            <div>
              <Form form={editForm}>
                <Table<Category>
                  columns={columns}
                  dataSource={categories?.data}
                  rowKey="category_id"
                  bordered
                  scroll={{ x: 'max-content' }}
                  pagination={{
                    total: categories?.meta.total,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    current: page,
                    onChange: (page) => {
                      setPage(page);
                    }
                  }}
                />
              </Form>
            </div>
          )}
        </Card>
      </Flex>
    </>
  );
}
