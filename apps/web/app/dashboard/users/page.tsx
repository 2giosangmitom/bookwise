'use client';

import { getUsers, updateUser } from '@/lib/api/user';
import { User, GetUsersResponse } from '@/lib/api/types';
import useTokenStore from '@/stores/useTokenStore';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import {
  Card,
  Flex,
  Input,
  Table,
  Typography,
  type TableColumnsType,
  Select,
  Tag,
  Button,
  Modal,
  Form,
  message
} from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';

const { Title, Paragraph } = Typography;

interface UserFormField {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  password?: string;
}

export default function UsersPage() {
  const accessToken = useTokenStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ADMIN' | 'LIBRARIAN' | 'MEMBER' | undefined>(undefined);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormField>();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', page, limit, debouncedSearchTerm, roleFilter],
    queryFn: (): Promise<GetUsersResponse> =>
      getUsers(accessToken, {
        page,
        limit,
        searchTerm: debouncedSearchTerm || undefined,
        role: roleFilter
      })
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: string; userData: UserFormField }) =>
      updateUser(accessToken, data.userId, data.userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      messageApi.success('User updated successfully');
      setEditModalOpen(false);
      form.resetFields();
    },
    onError: (error: Error) => {
      messageApi.error(error.message);
    }
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      password: undefined
    });
    setEditModalOpen(true);
  };

  const onEditUserFinish = (values: UserFormField) => {
    if (!editingUser) return;

    // Filter out undefined values and password if empty
    const userData: UserFormField = {};
    if (values.name !== undefined && values.name !== editingUser.name) userData.name = values.name;
    if (values.email !== undefined && values.email !== editingUser.email) userData.email = values.email;
    if (values.role !== undefined && values.role !== editingUser.role) userData.role = values.role;
    if (values.password && values.password.trim() !== '') userData.password = values.password;

    // Only update if there are changes
    if (Object.keys(userData).length === 0) {
      messageApi.info('No changes detected');
      return;
    }

    updateUserMutation.mutate({ userId: editingUser.user_id, userData });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'LIBRARIAN':
        return 'blue';
      case 'MEMBER':
        return 'green';
      default:
        return 'default';
    }
  };

  const columns: TableColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 250
    },
    {
      title: 'Role',
      dataIndex: 'role',
      width: 120,
      render: (role: string) => <Tag color={getRoleColor(role)}>{role}</Tag>
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
      width: 100,
      dataIndex: 'actions',
      render: (_, record) => (
        <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <Flex>
        <Card style={{ width: '100%' }}>
          <div>
            <Title level={3}>Users Management</Title>
            <Paragraph>Manage and monitor all users in the system.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" gap="middle" style={{ marginBottom: 16 }} wrap="wrap">
            <Flex gap="small" style={{ flex: 1, minWidth: '300px' }}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search by email or name"
                style={{ width: '250px' }}
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
              <Select
                placeholder="Filter by role"
                style={{ width: '150px' }}
                allowClear
                onChange={(value) => setRoleFilter(value)}
                value={roleFilter}
                options={[
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Librarian', value: 'LIBRARIAN' },
                  { label: 'Member', value: 'MEMBER' }
                ]}
              />
            </Flex>
          </Flex>

          {isLoading || debouncedSearchTerm !== searchTerm ? (
            <Table<User> loading columns={columns} bordered />
          ) : (
            <Table<User>
              columns={columns}
              dataSource={users?.data}
              rowKey="user_id"
              bordered
              scroll={{ x: 'max-content' }}
              pagination={{
                total: users?.meta.total,
                pageSize: limit,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                current: page,
                onChange: (page, pageSize) => {
                  setPage(page);
                  if (pageSize !== limit) {
                    setLimit(pageSize);
                    setPage(1);
                  }
                },
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
            />
          )}

          <Modal
            title="Edit User"
            open={isEditModalOpen}
            onCancel={() => {
              setEditModalOpen(false);
              form.resetFields();
            }}
            footer={null}>
            <Form form={form} onFinish={onEditUserFinish} layout="vertical">
              <Form.Item<UserFormField>
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input user name!' }]}>
                <Input placeholder="Enter user name" />
              </Form.Item>
              <Form.Item<UserFormField>
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input user email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}>
                <Input placeholder="Enter user email" />
              </Form.Item>
              <Form.Item<UserFormField>
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Please select user role!' }]}>
                <Select
                  placeholder="Select user role"
                  options={[
                    { label: 'Admin', value: 'ADMIN' },
                    { label: 'Librarian', value: 'LIBRARIAN' },
                    { label: 'Member', value: 'MEMBER' }
                  ]}
                />
              </Form.Item>
              <Form.Item<UserFormField>
                label="Password"
                name="password"
                help="Leave blank to keep current password"
                rules={[{ min: 6, message: 'Password must be at least 6 characters!' }]}>
                <Input.Password placeholder="Enter new password (optional)" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={updateUserMutation.isPending}>
                Update
              </Button>
            </Form>
          </Modal>
        </Card>
      </Flex>
    </>
  );
}
