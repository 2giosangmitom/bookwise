'use client';

import { createBook, deleteBook, getBooks, updateBook } from '@/lib/api/book';
import { getAuthors } from '@/lib/api/author';
import { getCategories } from '@/lib/api/category';
import { getPublishers } from '@/lib/api/publisher';
import { Book, GetBooksResponse } from '@/lib/api/types';
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
  DatePicker
} from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface BookFormField {
  title: string;
  description: string;
  isbn: string;
  published_at: dayjs.Dayjs;
  publisher_id: string | null;
  authors?: string[];
  categories?: string[];
}

export default function BooksPage() {
  const accessToken = useTokenStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [createForm] = Form.useForm<BookFormField>();
  const [editForm] = Form.useForm<BookFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [publisherSearchTerm, setPublisherSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const debouncedAuthorSearch = useDebounce(authorSearchTerm, 300);
  const debouncedPublisherSearch = useDebounce(publisherSearchTerm, 300);
  const debouncedCategorySearch = useDebounce(categorySearchTerm, 300);

  // Fetch books with search and pagination
  const { data: books, isLoading } = useQuery({
    queryKey: ['books', page, debouncedSearchTerm],
    queryFn: (): Promise<GetBooksResponse> => getBooks(accessToken, { page, searchTerm: debouncedSearchTerm })
  });

  // Fetch authors for the select dropdown with dynamic search
  const { data: authorsData, isLoading: isLoadingAuthors } = useQuery({
    queryKey: ['authors', debouncedAuthorSearch],
    queryFn: () => getAuthors(accessToken, { page: 1, limit: 5, searchTerm: debouncedAuthorSearch }),
    enabled: authorSearchTerm.length > 0 || debouncedAuthorSearch === ''
  });

  // Fetch categories for the select dropdown with dynamic search
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', debouncedCategorySearch],
    queryFn: () => getCategories(accessToken, { page: 1, limit: 5, searchTerm: debouncedCategorySearch }),
    enabled: categorySearchTerm.length > 0 || debouncedCategorySearch === ''
  });

  // Fetch publishers for the select dropdown with dynamic search
  const { data: publishersData, isLoading: isLoadingPublishers } = useQuery({
    queryKey: ['publishers', debouncedPublisherSearch],
    queryFn: () => getPublishers(accessToken, { page: 1, limit: 5, searchTerm: debouncedPublisherSearch }),
    enabled: publisherSearchTerm.length > 0 || debouncedPublisherSearch === ''
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: (bookId: string) => deleteBook(accessToken, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      messageApi.success('Book deleted successfully');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      isbn: string;
      published_at: string;
      publisher_id: string | null;
      authors?: string[];
      categories?: string[];
    }) => createBook(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      messageApi.success('Book created successfully');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: (data: {
      bookId: string;
      title: string;
      description: string;
      isbn: string;
      published_at: string;
      publisher_id: string | null;
      authors?: string[];
      categories?: string[];
    }) =>
      updateBook(accessToken, data.bookId, {
        title: data.title,
        description: data.description,
        isbn: data.isbn,
        published_at: data.published_at,
        publisher_id: data.publisher_id,
        authors: data.authors,
        categories: data.categories
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      messageApi.success('Book updated successfully');
      setEditModalOpen(false);
      setEditingBook(null);
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const onCreateBookFinish = (values: BookFormField) => {
    createBookMutation.mutate({
      title: values.title,
      description: values.description,
      isbn: values.isbn,
      published_at: values.published_at.toISOString(),
      publisher_id: values.publisher_id,
      authors: values.authors,
      categories: values.categories
    });
    setCreateModalOpen(false);
    createForm.resetFields();
  };

  const onEditBookFinish = (values: BookFormField) => {
    if (!editingBook) return;

    updateBookMutation.mutate({
      bookId: editingBook.book_id,
      title: values.title,
      description: values.description,
      isbn: values.isbn,
      published_at: values.published_at.toISOString(),
      publisher_id: values.publisher_id,
      authors: values.authors,
      categories: values.categories
    });
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);

    // Pre-populate search terms to load the existing selections
    if (book.categories.length > 0) {
      setCategorySearchTerm('');
    }

    editForm.setFieldsValue({
      title: book.title,
      description: book.description,
      isbn: book.isbn,
      published_at: dayjs(book.published_at),
      publisher_id: book.publisher_id,
      authors: book.authors.map((a) => a.author_id),
      categories: book.categories.map((c) => c.category_id)
    });
    setEditModalOpen(true);
  };

  const handleDelete = (bookId: string) => {
    Modal.confirm({
      title: 'Delete Book',
      content: 'Are you sure you want to delete this book?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteBookMutation.mutate(bookId)
    });
  };

  const columns: TableColumnsType<Book> = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 250,
      ellipsis: true
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      width: 150
    },
    {
      title: 'Publisher',
      dataIndex: 'publisher_name',
      width: 200,
      render: (text) => text || '-'
    },
    {
      title: 'Authors',
      dataIndex: 'authors',
      width: 200,
      render: (authors: Book['authors']) => (authors.length > 0 ? authors.map((a) => a.name).join(', ') : '-')
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      width: 200,
      render: (categories: Book['categories']) =>
        categories.length > 0 ? categories.map((c) => c.name).join(', ') : '-'
    },
    {
      title: 'Published Date',
      dataIndex: 'published_at',
      render: (_, record) => formatDateTime(record.published_at),
      width: 150
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: (_, record) => formatDateTime(record.created_at),
      width: 150
    },
    {
      title: 'Actions',
      width: 120,
      dataIndex: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Flex gap="small">
          <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.book_id)}
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
            <Title level={3}>Books Management</Title>
            <Paragraph>Manage your library collection by adding, editing, and organizing books.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search books by title, ISBN, or description"
              style={{ width: '40%' }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Add Book
            </Button>
          </Flex>

          {/* Create Book Modal */}
          <Modal
            title="Add New Book"
            open={isCreateModalOpen}
            onCancel={() => {
              setCreateModalOpen(false);
              createForm.resetFields();
            }}
            footer={null}
            width={600}>
            <Form form={createForm} onFinish={onCreateBookFinish} layout="vertical">
              <Form.Item<BookFormField>
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please input book title!' }]}>
                <Input placeholder="Enter book title" />
              </Form.Item>

              <Form.Item<BookFormField>
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input book description!' }]}>
                <TextArea rows={4} placeholder="Enter book description" />
              </Form.Item>

              <Form.Item<BookFormField>
                label="ISBN"
                name="isbn"
                rules={[{ required: true, message: 'Please input ISBN!' }]}>
                <Input placeholder="Enter ISBN" />
              </Form.Item>

              <Form.Item<BookFormField>
                label="Published Date"
                name="published_at"
                rules={[{ required: true, message: 'Please select published date!' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item<BookFormField> label="Publisher" name="publisher_id">
                <Select
                  placeholder="Type to search publishers"
                  allowClear
                  showSearch
                  filterOption={false}
                  loading={isLoadingPublishers}
                  onSearch={(value) => setPublisherSearchTerm(value)}
                  onFocus={() => setPublisherSearchTerm('')}
                  options={publishersData?.data.map((p) => ({
                    value: p.publisher_id,
                    label: p.name
                  }))}
                />
              </Form.Item>

              <Form.Item<BookFormField> label="Authors" name="authors">
                <Select
                  mode="multiple"
                  placeholder="Type to search authors"
                  showSearch
                  filterOption={false}
                  loading={isLoadingAuthors}
                  onSearch={(value) => setAuthorSearchTerm(value)}
                  onFocus={() => setAuthorSearchTerm('')}
                  notFoundContent={isLoadingAuthors ? 'Loading...' : 'No authors found'}
                  options={authorsData?.data.items.map((a) => ({
                    value: a.author_id,
                    label: a.name
                  }))}
                />
              </Form.Item>

              <Form.Item<BookFormField> label="Categories" name="categories">
                <Select
                  mode="multiple"
                  placeholder="Type to search categories"
                  showSearch
                  filterOption={false}
                  loading={isLoadingCategories}
                  onSearch={(value) => setCategorySearchTerm(value)}
                  onFocus={() => setCategorySearchTerm('')}
                  notFoundContent={isLoadingCategories ? 'Loading...' : 'No categories found'}
                  options={categoriesData?.data.map((c) => ({
                    value: c.category_id,
                    label: c.name
                  }))}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={createBookMutation.isPending}>
                Create
              </Button>
            </Form>
          </Modal>

          {/* Edit Book Modal */}
          <Modal
            title="Edit Book"
            open={isEditModalOpen}
            onCancel={() => {
              setEditModalOpen(false);
              setEditingBook(null);
              editForm.resetFields();
            }}
            footer={null}
            width={600}>
            <Form form={editForm} onFinish={onEditBookFinish} layout="vertical">
              <Form.Item<BookFormField>
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please input book title!' }]}>
                <Input placeholder="Enter book title" />
              </Form.Item>

              <Form.Item<BookFormField>
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please input book description!' }]}>
                <TextArea rows={4} placeholder="Enter book description" />
              </Form.Item>

              <Form.Item<BookFormField>
                label="ISBN"
                name="isbn"
                rules={[{ required: true, message: 'Please input ISBN!' }]}>
                <Input placeholder="Enter ISBN" />
              </Form.Item>

              <Form.Item<BookFormField>
                label="Published Date"
                name="published_at"
                rules={[{ required: true, message: 'Please select published date!' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item<BookFormField> label="Publisher" name="publisher_id">
                <Select
                  placeholder="Type to search publishers"
                  allowClear
                  showSearch
                  filterOption={false}
                  loading={isLoadingPublishers}
                  onSearch={(value) => setPublisherSearchTerm(value)}
                  onFocus={() => setPublisherSearchTerm('')}
                  options={publishersData?.data.map((p) => ({
                    value: p.publisher_id,
                    label: p.name
                  }))}
                />
              </Form.Item>

              <Form.Item<BookFormField> label="Authors" name="authors">
                <Select
                  mode="multiple"
                  placeholder="Type to search authors"
                  showSearch
                  filterOption={false}
                  loading={isLoadingAuthors}
                  onSearch={(value) => setAuthorSearchTerm(value)}
                  onFocus={() => setAuthorSearchTerm('')}
                  notFoundContent={isLoadingAuthors ? 'Loading...' : 'No authors found'}
                  options={
                    editingBook
                      ? [
                          ...editingBook.authors.map((a) => ({
                            value: a.author_id,
                            label: a.name
                          })),
                          ...(authorsData?.data.items
                            .filter((a) => !editingBook.authors.some((ea) => ea.author_id === a.author_id))
                            .map((a) => ({
                              value: a.author_id,
                              label: a.name
                            })) ?? [])
                        ]
                      : authorsData?.data.items.map((a) => ({
                          value: a.author_id,
                          label: a.name
                        }))
                  }
                />
              </Form.Item>

              <Form.Item<BookFormField> label="Categories" name="categories">
                <Select
                  mode="multiple"
                  placeholder="Type to search categories"
                  showSearch
                  filterOption={false}
                  loading={isLoadingCategories}
                  onSearch={(value) => setCategorySearchTerm(value)}
                  onFocus={() => setCategorySearchTerm('')}
                  notFoundContent={isLoadingCategories ? 'Loading...' : 'No categories found'}
                  options={
                    editingBook
                      ? [
                          ...editingBook.categories.map((c) => ({
                            value: c.category_id,
                            label: c.name
                          })),
                          ...(categoriesData?.data
                            .filter((c) => !editingBook.categories.some((ec) => ec.category_id === c.category_id))
                            .map((c) => ({
                              value: c.category_id,
                              label: c.name
                            })) ?? [])
                        ]
                      : categoriesData?.data.map((c) => ({
                          value: c.category_id,
                          label: c.name
                        }))
                  }
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={updateBookMutation.isPending}>
                Update
              </Button>
            </Form>
          </Modal>

          {isLoading || debouncedSearchTerm !== searchTerm ? (
            <Table<Book> loading columns={columns} bordered />
          ) : (
            <Table<Book>
              columns={columns}
              dataSource={books?.data}
              rowKey="book_id"
              bordered
              scroll={{ x: 'max-content' }}
              pagination={{
                total: books?.meta.total,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                current: page,
                pageSize: books?.meta.limit,
                onChange: (page) => {
                  setPage(page);
                }
              }}
            />
          )}
        </Card>
      </Flex>
    </>
  );
}
