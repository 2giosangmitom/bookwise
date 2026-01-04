'use client';

import { createLoan, deleteLoan, getLoans, updateLoan } from '@/lib/api/loan';
import { getBookClones } from '@/lib/api/bookClone';
import { getUsers } from '@/lib/api/user';
import { Loan, GetLoansResponse, LoanStatus } from '@/lib/api/types';
import { useAuthContext } from '@/contexts/Auth';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Modal,
  Table,
  Typography,
  type TableColumnsType,
  message,
  Select,
  Tag,
  DatePicker
} from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

interface LoanFormField {
  user_id: string;
  book_clone_id: string;
  loan_date: dayjs.Dayjs;
  due_date: dayjs.Dayjs;
}

interface UpdateLoanFormField {
  loan_date: dayjs.Dayjs;
  due_date: dayjs.Dayjs;
  return_date: dayjs.Dayjs | null;
  status: LoanStatus;
}

const LOAN_STATUSES: { label: string; value: LoanStatus }[] = [
  { label: 'Borrowed', value: 'BORROWED' },
  { label: 'Returned', value: 'RETURNED' },
  { label: 'Overdue', value: 'OVERDUE' }
];

export default function LoanPage() {
  const { accessToken } = useAuthContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [createForm] = Form.useForm<LoanFormField>();
  const [editForm] = Form.useForm<UpdateLoanFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | undefined>(undefined);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [bookCloneSearchTerm, setBookCloneSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedUserSearch = useDebounce(userSearchTerm, 300);
  const debouncedBookCloneSearch = useDebounce(bookCloneSearchTerm, 300);

  // Fetch loans with search and pagination
  const { data: loansData, isLoading } = useQuery({
    queryKey: ['loans', page, limit, debouncedSearchTerm, statusFilter],
    queryFn: (): Promise<GetLoansResponse> =>
      getLoans(accessToken, {
        page,
        limit,
        search: debouncedSearchTerm || undefined,
        status: statusFilter
      })
  });

  // Fetch users for the select dropdown
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-select', debouncedUserSearch],
    queryFn: () => getUsers(accessToken, { page: 1, limit: 10, searchTerm: debouncedUserSearch }),
    enabled: userSearchTerm.length > 0 || debouncedUserSearch === ''
  });

  // Fetch book clones for the select dropdown (only available ones)
  const { data: bookClonesData, isLoading: isLoadingBookClones } = useQuery({
    queryKey: ['book-clones-select', debouncedBookCloneSearch],
    queryFn: () =>
      getBookClones(accessToken, { page: 1, limit: 10, searchTerm: debouncedBookCloneSearch, is_available: true }),
    enabled: bookCloneSearchTerm.length > 0 || debouncedBookCloneSearch === ''
  });

  // Delete loan mutation
  const deleteLoanMutation = useMutation({
    mutationFn: (loanId: string) => deleteLoan(accessToken, loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      messageApi.success('Loan deleted successfully');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Create loan mutation
  const createLoanMutation = useMutation({
    mutationFn: (data: LoanFormField) =>
      createLoan(accessToken, {
        user_id: data.user_id,
        book_clone_id: data.book_clone_id,
        loan_date: data.loan_date.toISOString(),
        due_date: data.due_date.toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['book-clones-select'] });
      messageApi.success('Loan created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Update loan mutation
  const updateLoanMutation = useMutation({
    mutationFn: (data: UpdateLoanFormField & { loanId: string }) =>
      updateLoan(accessToken, data.loanId, {
        loan_date: data.loan_date.toISOString(),
        due_date: data.due_date.toISOString(),
        return_date: data.return_date ? data.return_date.toISOString() : null,
        status: data.status
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['book-clones-select'] });
      messageApi.success('Loan updated successfully');
      setEditModalOpen(false);
      setEditingLoan(null);
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Mark as returned mutation
  const markAsReturnedMutation = useMutation({
    mutationFn: (loanId: string) =>
      updateLoan(accessToken, loanId, {
        status: 'RETURNED',
        return_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['book-clones-select'] });
      messageApi.success('Loan marked as returned');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    editForm.setFieldsValue({
      loan_date: dayjs(loan.loan_date),
      due_date: dayjs(loan.due_date),
      return_date: loan.return_date ? dayjs(loan.return_date) : null,
      status: loan.status
    });
    setEditModalOpen(true);
  };

  const handleDelete = (loanId: string) => {
    Modal.confirm({
      title: 'Delete Loan',
      content: 'Are you sure you want to delete this loan record?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteLoanMutation.mutate(loanId)
    });
  };

  const handleMarkAsReturned = (loanId: string) => {
    Modal.confirm({
      title: 'Mark as Returned',
      content: 'Are you sure you want to mark this loan as returned?',
      okText: 'Confirm',
      onOk: () => markAsReturnedMutation.mutate(loanId)
    });
  };

  const onCreateFinish = (values: LoanFormField) => {
    createLoanMutation.mutate(values);
  };

  const onEditFinish = (values: UpdateLoanFormField) => {
    if (editingLoan) {
      updateLoanMutation.mutate({ ...values, loanId: editingLoan.loan_id });
    }
  };

  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case 'BORROWED':
        return 'blue';
      case 'RETURNED':
        return 'green';
      case 'OVERDUE':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: TableColumnsType<Loan> = [
    {
      title: 'User',
      dataIndex: 'user_name',
      width: 180,
      ellipsis: true
    },
    {
      title: 'Book Title',
      dataIndex: 'book_title',
      width: 250,
      ellipsis: true
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      width: 150
    },
    {
      title: 'Loan Date',
      dataIndex: 'loan_date',
      width: 160,
      render: (_, record) => formatDateTime(record.loan_date)
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      width: 160,
      render: (_, record) => formatDateTime(record.due_date)
    },
    {
      title: 'Return Date',
      dataIndex: 'return_date',
      width: 160,
      render: (_, record) => (record.return_date ? formatDateTime(record.return_date) : '-')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (status: LoanStatus) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Flex gap="small">
          {record.status === 'BORROWED' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleMarkAsReturned(record.loan_id)}
              title="Mark as Returned"
            />
          )}
          <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.loan_id)}
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
            <Title level={3}>Loan Management</Title>
            <Paragraph>Manage book loans, track borrowing status, and handle returns.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Flex gap="middle">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search by user email, barcode..."
                style={{ width: 280 }}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              <Select
                placeholder="Status"
                style={{ width: 130 }}
                allowClear
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                options={LOAN_STATUSES}
              />
            </Flex>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Create Loan
            </Button>
          </Flex>

          {isLoading || debouncedSearchTerm !== searchTerm ? (
            <Table loading columns={columns} dataSource={[]} />
          ) : (
            <Table
              columns={columns}
              dataSource={loansData?.data}
              rowKey="loan_id"
              scroll={{ x: 1400 }}
              pagination={{
                current: page,
                pageSize: limit,
                total: loansData?.meta.total,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                onChange: (newPage, pageSize) => {
                  setPage(newPage);
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
        </Card>
      </Flex>

      {/* Create Modal */}
      <Modal
        title="Create Loan"
        open={isCreateModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
          setUserSearchTerm('');
          setBookCloneSearchTerm('');
        }}
        footer={null}
        width={500}>
        <Form form={createForm} onFinish={onCreateFinish} layout="vertical">
          <Form.Item<LoanFormField>
            label="User"
            name="user_id"
            rules={[{ required: true, message: 'Please select a user!' }]}>
            <Select
              placeholder="Type to search users by email"
              loading={isLoadingUsers}
              showSearch={{
                onSearch: setUserSearchTerm,
                filterOption: false
              }}
              onFocus={() => setUserSearchTerm('')}
              options={
                usersData?.data?.map((user) => ({
                  label: `${user.name} (${user.email})`,
                  value: user.user_id
                })) || []
              }
            />
          </Form.Item>
          <Form.Item<LoanFormField>
            label="Book Clone"
            name="book_clone_id"
            rules={[{ required: true, message: 'Please select a book clone!' }]}>
            <Select
              placeholder="Type to search available book clones"
              loading={isLoadingBookClones}
              showSearch={{
                onSearch: setBookCloneSearchTerm,
                filterOption: false
              }}
              onFocus={() => setBookCloneSearchTerm('')}
              options={
                bookClonesData?.data?.map((clone) => ({
                  label: `${clone.book_title} (${clone.barcode})`,
                  value: clone.book_clone_id
                })) || []
              }
            />
          </Form.Item>
          <Form.Item<LoanFormField>
            label="Loan Date"
            name="loan_date"
            rules={[{ required: true, message: 'Please select loan date!' }]}
            initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item<LoanFormField>
            label="Due Date"
            name="due_date"
            rules={[{ required: true, message: 'Please select due date!' }]}
            initialValue={dayjs().add(14, 'day')}>
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createLoanMutation.isPending}>
            Create
          </Button>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Loan"
        open={isEditModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingLoan(null);
          editForm.resetFields();
        }}
        footer={null}
        width={500}>
        <Form form={editForm} onFinish={onEditFinish} layout="vertical">
          <Form.Item<UpdateLoanFormField>
            label="Loan Date"
            name="loan_date"
            rules={[{ required: true, message: 'Please select loan date!' }]}>
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item<UpdateLoanFormField>
            label="Due Date"
            name="due_date"
            rules={[{ required: true, message: 'Please select due date!' }]}>
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>
          <Form.Item<UpdateLoanFormField> label="Return Date" name="return_date">
            <DatePicker style={{ width: '100%' }} showTime allowClear />
          </Form.Item>
          <Form.Item<UpdateLoanFormField>
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status!' }]}>
            <Select placeholder="Select status" options={LOAN_STATUSES} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateLoanMutation.isPending}>
            Update
          </Button>
        </Form>
      </Modal>
    </>
  );
}
