'use client';

import { createBookClone, deleteBookClone, getBookClones, updateBookClone } from '@/lib/api/bookClone';
import { getBooks } from '@/lib/api/book';
import { BookClone, GetBookClonesResponse } from '@/lib/api/types';
import useTokenStore from '@/stores/useTokenStore';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
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
  Tag
} from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';

const { Title, Paragraph } = Typography;

interface BookCloneFormField {
  book_id: string;
  location_id: string;
  barcode: string;
  condition: string;
}

const BOOK_CONDITIONS = [
  { label: 'New', value: 'NEW' },
  { label: 'Good', value: 'GOOD' },
  { label: 'Worn', value: 'WORN' },
  { label: 'Damaged', value: 'DAMAGED' }
];

export default function BookClonesPage() {
  const accessToken = useTokenStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingClone, setEditingClone] = useState<BookClone | null>(null);
  const [createForm] = Form.useForm<BookCloneFormField>();
  const [editForm] = Form.useForm<BookCloneFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string | undefined>(undefined);
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | undefined>(undefined);
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedBookSearch = useDebounce(bookSearchTerm, 300);

  // Fetch book clones with search and pagination
  const { data: bookClonesData, isLoading } = useQuery({
    queryKey: ['bookClones', page, debouncedSearchTerm, conditionFilter, availabilityFilter],
    queryFn: (): Promise<GetBookClonesResponse> =>
      getBookClones(accessToken, {
        page,
        limit: 10,
        searchTerm: debouncedSearchTerm || undefined,
        condition: conditionFilter,
        is_available: availabilityFilter
      })
  });

  // Fetch books for the select dropdown with dynamic search
  const { data: booksData, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['books-select', debouncedBookSearch],
    queryFn: () => getBooks(accessToken, { page: 1, limit: 5, searchTerm: debouncedBookSearch }),
    enabled: bookSearchTerm.length > 0 || debouncedBookSearch === ''
  });

  // Delete book clone mutation
  const deleteBookCloneMutation = useMutation({
    mutationFn: (cloneId: string) => deleteBookClone(accessToken, cloneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClones'] });
      messageApi.success('Book clone deleted successfully');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Create book clone mutation
  const createBookCloneMutation = useMutation({
    mutationFn: (data: BookCloneFormField) => createBookClone(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClones'] });
      messageApi.success('Book clone created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Update book clone mutation
  const updateBookCloneMutation = useMutation({
    mutationFn: (data: BookCloneFormField & { cloneId: string }) =>
      updateBookClone(accessToken, data.cloneId, {
        book_id: data.book_id,
        location_id: data.location_id,
        barcode: data.barcode,
        condition: data.condition
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClones'] });
      messageApi.success('Book clone updated successfully');
      setEditModalOpen(false);
      setEditingClone(null);
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const handleEdit = (clone: BookClone) => {
    setEditingClone(clone);
    editForm.setFieldsValue({
      book_id: clone.book_id,
      location_id: clone.location_id,
      barcode: clone.barcode,
      condition: clone.condition
    });
    setEditModalOpen(true);
  };

  const handleDelete = (cloneId: string) => {
    Modal.confirm({
      title: 'Delete Book Clone',
      content: 'Are you sure you want to delete this book clone?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteBookCloneMutation.mutate(cloneId)
    });
  };

  const onCreateFinish = (values: BookCloneFormField) => {
    createBookCloneMutation.mutate(values);
  };

  const onEditFinish = (values: BookCloneFormField) => {
    if (editingClone) {
      updateBookCloneMutation.mutate({ ...values, cloneId: editingClone.book_clone_id });
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return 'green';
      case 'GOOD':
        return 'blue';
      case 'WORN':
        return 'orange';
      case 'DAMAGED':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: TableColumnsType<BookClone> = [
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
      title: 'Location',
      dataIndex: 'location_id',
      width: 120
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      width: 100,
      render: (condition: string) => <Tag color={getConditionColor(condition)}>{condition}</Tag>
    },
    {
      title: 'Availability',
      dataIndex: 'is_available',
      width: 120,
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>{available ? 'Available' : 'Unavailable'}</Tag>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: (_, record) => formatDateTime(record.created_at),
      width: 160
    },
    {
      title: 'Actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Flex gap="small">
          <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.book_clone_id)}
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
            <Title level={3}>Book Clones Management</Title>
            <Paragraph>Manage physical copies of books including condition, location, and availability.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Flex gap="middle">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search by barcode, book title, location..."
                style={{ width: 300 }}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              <Select
                placeholder="Condition"
                style={{ width: 120 }}
                allowClear
                value={conditionFilter}
                onChange={(value) => {
                  setConditionFilter(value);
                  setPage(1);
                }}
                options={[
                  { label: 'New', value: 'NEW' },
                  { label: 'Good', value: 'GOOD' },
                  { label: 'Worn', value: 'WORN' },
                  { label: 'Damaged', value: 'DAMAGED' }
                ]}
              />
              <Select
                placeholder="Availability"
                style={{ width: 130 }}
                allowClear
                value={availabilityFilter}
                onChange={(value) => {
                  setAvailabilityFilter(value);
                  setPage(1);
                }}
                options={[
                  { label: 'Available', value: true },
                  { label: 'Unavailable', value: false }
                ]}
              />
            </Flex>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Add Clone
            </Button>
          </Flex>

          {isLoading || debouncedSearchTerm !== searchTerm ? (
            <Table<BookClone> loading columns={columns} bordered />
          ) : (
            <Table<BookClone>
              columns={columns}
              dataSource={bookClonesData?.data}
              rowKey="book_clone_id"
              bordered
              scroll={{ x: 'max-content' }}
              pagination={{
                total: bookClonesData?.meta.total,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                current: page,
                onChange: (newPage) => setPage(newPage)
              }}
            />
          )}
        </Card>
      </Flex>

      {/* Create Modal */}
      <Modal
        title="Add New Book Clone"
        open={isCreateModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
          setBookSearchTerm('');
        }}
        footer={null}>
        <Form form={createForm} onFinish={onCreateFinish} layout="vertical">
          <Form.Item<BookCloneFormField>
            label="Book"
            name="book_id"
            rules={[{ required: true, message: 'Please select a book!' }]}>
            <Select
              placeholder="Type to search books"
              loading={isLoadingBooks}
              showSearch={{
                onSearch: setBookSearchTerm,
                filterOption: false
              }}
              onFocus={() => setBookSearchTerm('')}
              options={
                booksData?.data?.map((book) => ({
                  label: book.title,
                  value: book.book_id
                })) || []
              }
            />
          </Form.Item>
          <Form.Item<BookCloneFormField>
            label="Location ID"
            name="location_id"
            rules={[{ required: true, message: 'Please input location ID!' }]}>
            <Input placeholder="Enter location ID (e.g., LOC-001)" />
          </Form.Item>
          <Form.Item<BookCloneFormField>
            label="Barcode"
            name="barcode"
            rules={[{ required: true, message: 'Please input barcode!' }]}>
            <Input placeholder="Enter barcode" />
          </Form.Item>
          <Form.Item<BookCloneFormField>
            label="Condition"
            name="condition"
            rules={[{ required: true, message: 'Please select condition!' }]}>
            <Select placeholder="Select condition" options={BOOK_CONDITIONS} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createBookCloneMutation.isPending}>
            Create
          </Button>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Book Clone"
        open={isEditModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingClone(null);
          editForm.resetFields();
          setBookSearchTerm('');
        }}
        footer={null}>
        <Form form={editForm} onFinish={onEditFinish} layout="vertical">
          <Form.Item<BookCloneFormField>
            label="Book"
            name="book_id"
            rules={[{ required: true, message: 'Please select a book!' }]}>
            <Select
              placeholder="Type to search books"
              loading={isLoadingBooks}
              showSearch={{
                onSearch: setBookSearchTerm,
                filterOption: false
              }}
              onFocus={() => setBookSearchTerm('')}
              options={[
                // Include current book if editing and not already in search results
                ...(editingClone && !booksData?.data?.some((b) => b.book_id === editingClone.book_id)
                  ? [{ label: editingClone.book_title, value: editingClone.book_id }]
                  : []),
                ...(booksData?.data?.map((book) => ({
                  label: book.title,
                  value: book.book_id
                })) || [])
              ]}
            />
          </Form.Item>
          <Form.Item<BookCloneFormField>
            label="Location ID"
            name="location_id"
            rules={[{ required: true, message: 'Please input location ID!' }]}>
            <Input placeholder="Enter location ID (e.g., LOC-001)" />
          </Form.Item>
          <Form.Item<BookCloneFormField>
            label="Barcode"
            name="barcode"
            rules={[{ required: true, message: 'Please input barcode!' }]}>
            <Input placeholder="Enter barcode" />
          </Form.Item>
          <Form.Item<BookCloneFormField>
            label="Condition"
            name="condition"
            rules={[{ required: true, message: 'Please select condition!' }]}>
            <Select placeholder="Select condition" options={BOOK_CONDITIONS} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateBookCloneMutation.isPending}>
            Update
          </Button>
        </Form>
      </Modal>
    </>
  );
}
