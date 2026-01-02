'use client';

import { createPublisher, deletePublisher, getPublishers, updatePublisher } from '@/lib/api/publisher';
import { Publisher, GetPublishersResponse } from '@/lib/api/types';
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

interface PublisherFormField {
  name: string;
  website: string;
  slug: string;
}

export default function PublishersPage() {
  const accessToken = useTokenStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm<PublisherFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingKey, setEditingKey] = useState('');
  const [editForm] = Form.useForm<PublisherFormField>();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: publishers, isLoading } = useQuery({
    queryKey: ['publishers', page, debouncedSearchTerm],
    queryFn: (): Promise<GetPublishersResponse> => getPublishers(accessToken, { page, searchTerm: debouncedSearchTerm })
  });

  const deletePublisherMutation = useMutation({
    mutationFn: (publisherId: string) => deletePublisher(accessToken, publisherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      messageApi.success('Publisher deleted successfully');
    }
  });

  const createPublisherMutation = useMutation({
    mutationFn: (data: { name: string; website: string; slug: string }) => createPublisher(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      messageApi.success('Publisher created successfully');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const updatePublisherMutation = useMutation({
    mutationFn: (data: { publisherId: string; name: string; website: string; slug: string }) =>
      updatePublisher(accessToken, data.publisherId, { name: data.name, website: data.website, slug: data.slug }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      messageApi.success('Publisher updated successfully');
      setEditingKey('');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const onCreatePublisherFinish = (values: PublisherFormField) => {
    createPublisherMutation.mutate(values);
    setCreateModalOpen(false);
    form.resetFields();
  };

  const handleEditSave = (publisherId: string) => {
    editForm.validateFields(['name', 'website', 'slug']).then((values) => {
      updatePublisherMutation.mutate({ publisherId, name: values.name, website: values.website, slug: values.slug });
    });
  };

  const columns: TableColumnsType<Publisher> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      render: (text, record) =>
        editingKey === record.publisher_id ? (
          <Form.Item name="name" style={{ margin: 0 }} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        ) : (
          text
        )
    },
    {
      title: 'Website',
      dataIndex: 'website',
      width: 250,
      render: (text, record) =>
        editingKey === record.publisher_id ? (
          <Form.Item name="website" style={{ margin: 0 }} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        ) : (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        )
    },
    {
      title: 'Slug',
      width: 200,
      dataIndex: 'slug',
      render: (text, record) =>
        editingKey === record.publisher_id ? (
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
      width: 180
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      render: (_, record) => formatDateTime(record.updated_at),
      width: 180
    },
    {
      title: 'Actions',
      width: 120,
      dataIndex: 'actions',
      render: (_, record) =>
        editingKey === record.publisher_id ? (
          <Flex gap="small">
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleEditSave(record.publisher_id)}
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
                setEditingKey(record.publisher_id);
                editForm.setFieldsValue({ name: record.name, website: record.website, slug: record.slug });
              }}
            />
            <Button
              type="primary"
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => deletePublisherMutation.mutate(record.publisher_id)}
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
            <Title level={3}>Publishers Management</Title>
            <Paragraph>Manage book publishers and their information.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search publishers by name"
              style={{ width: '25%' }}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Add Publisher
            </Button>
            <Modal
              title="Add New Publisher"
              open={isCreateModalOpen}
              onCancel={() => setCreateModalOpen(false)}
              footer={null}>
              <Form form={form} onFinish={onCreatePublisherFinish} layout="vertical">
                <Form.Item<PublisherFormField>
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: 'Please input publisher name!' }]}>
                  <Input placeholder="Enter publisher name" />
                </Form.Item>
                <Form.Item<PublisherFormField>
                  label="Website"
                  name="website"
                  rules={[{ required: true, message: 'Please input publisher website!' }]}>
                  <Input placeholder="Enter publisher website" />
                </Form.Item>
                <Form.Item<PublisherFormField>
                  label="Slug"
                  name="slug"
                  rules={[{ required: true, message: 'Please input publisher slug!' }]}>
                  <Input placeholder="Enter publisher slug" />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
              </Form>
            </Modal>
          </Flex>
          {isLoading || debouncedSearchTerm !== searchTerm ? (
            <Table<Publisher> loading columns={columns} bordered />
          ) : (
            <div>
              <Form form={editForm}>
                <Table<Publisher>
                  columns={columns}
                  dataSource={publishers?.data}
                  rowKey="publisher_id"
                  bordered
                  scroll={{ x: 'max-content' }}
                  pagination={{
                    total: publishers?.meta.total,
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
