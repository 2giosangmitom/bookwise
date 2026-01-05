'use client';

import { createAuthor, deleteAuthor, getAuthors, updateAuthor, uploadAuthorImage } from '@/lib/api/author';
import { Author, GetAuthorsResponse } from '@/lib/api/types';
import { useAuthContext } from '@/contexts/Auth';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
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
  DatePicker,
  Upload,
  UploadFile,
  GetProp,
  UploadProps,
  Image
} from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';
import dayjs, { type Dayjs } from 'dayjs';

const { Title, Paragraph } = Typography;

interface AuthorFormField {
  name: string;
  short_biography: string;
  biography: string;
  date_of_birth: Dayjs | null;
  date_of_death: Dayjs | null;
  nationality: string | null;
  slug: string;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function AuthorsPage() {
  const { accessToken } = useAuthContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm<AuthorFormField>();
  const [editForm] = Form.useForm<AuthorFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingAuthorSlug, setUploadingAuthorSlug] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

  const { data: authors, isLoading } = useQuery({
    queryKey: ['authors', page, limit, debouncedSearchTerm],
    queryFn: (): Promise<GetAuthorsResponse> =>
      getAuthors(accessToken, { page, limit, searchTerm: debouncedSearchTerm })
  });

  const deleteAuthorMutation = useMutation({
    mutationFn: (authorId: string) => deleteAuthor(accessToken, authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      messageApi.success('Author deleted successfully');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const createAuthorMutation = useMutation({
    mutationFn: (data: {
      name: string;
      short_biography: string;
      biography: string;
      date_of_birth: string | null;
      date_of_death: string | null;
      nationality: string | null;
      slug: string;
    }) => createAuthor(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      messageApi.success('Author created successfully');
      setCreateModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const updateAuthorMutation = useMutation({
    mutationFn: (data: {
      authorId: string;
      name: string;
      short_biography: string;
      biography: string;
      date_of_birth: string | null;
      date_of_death: string | null;
      nationality: string | null;
      slug: string;
    }) => {
      const { authorId, ...authorData } = data;
      return updateAuthor(accessToken, authorId, authorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      messageApi.success('Author updated successfully');
      setEditModalOpen(false);
      setEditingAuthor(null);
      editForm.resetFields();
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const uploadAuthorImageMutation = useMutation({
    mutationFn: (data: { authorSlug: string; file: File }) =>
      uploadAuthorImage(accessToken, data.authorSlug, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      messageApi.success('Author image uploaded successfully');
      setIsUploadModalOpen(false);
      setUploadingAuthorSlug(null);
      setFileList([]);
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const onCreateAuthorFinish = (values: AuthorFormField) => {
    const authorData = {
      ...values,
      date_of_birth: values.date_of_birth ? values.date_of_birth.toISOString() : null,
      date_of_death: values.date_of_death ? values.date_of_death.toISOString() : null
    };
    createAuthorMutation.mutate(authorData);
  };

  const onEditAuthorFinish = (values: AuthorFormField) => {
    if (editingAuthor) {
      const authorData = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth.toISOString() : null,
        date_of_death: values.date_of_death ? values.date_of_death.toISOString() : null
      };
      updateAuthorMutation.mutate({ authorId: editingAuthor.author_id, ...authorData });
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    editForm.setFieldsValue({
      name: author.name,
      short_biography: author.short_biography,
      biography: author.biography,
      date_of_birth: author.date_of_birth ? dayjs(author.date_of_birth) : null,
      date_of_death: author.date_of_death ? dayjs(author.date_of_death) : null,
      nationality: author.nationality,
      slug: author.slug
    });
    setEditModalOpen(true);
  };

  const handleDelete = (authorId: string) => {
    Modal.confirm({
      title: 'Delete Author',
      content: 'Are you sure you want to delete this author?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteAuthorMutation.mutate(authorId)
    });
  };

  const columns: TableColumnsType<Author> = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      width: 100,
      render: (text) =>
        text ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={text} alt="Author Photo" width={50} height={50} />
        ) : (
          <p>No Image</p>
        )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 200
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      width: 200
    },
    {
      title: 'Nationality',
      dataIndex: 'nationality',
      width: 150,
      render: (nationality) => nationality || 'N/A'
    },
    {
      title: 'Birth Date',
      dataIndex: 'date_of_birth',
      width: 150,
      render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : 'N/A')
    },
    {
      title: 'Death Date',
      dataIndex: 'date_of_death',
      width: 150,
      render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : 'Alive')
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: (_, record) => formatDateTime(record.created_at),
      width: 180
    },
    {
      title: 'Actions',
      width: 150,
      fixed: 'right',
      dataIndex: 'actions',
      render: (_, record) => (
        <Flex gap="small">
          <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            type="primary"
            size="small"
            icon={<UploadOutlined />}
            onClick={() => {
              setUploadingAuthorSlug(record.slug);
              setIsUploadModalOpen(true);
            }}
          />
          <Button
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.author_id)}
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
            <Title level={3}>Authors Management</Title>
            <Paragraph>Manage book authors and their biographical information.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search authors by name, nationality, or slug"
              style={{ width: '40%' }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Add Author
            </Button>
          </Flex>

          {isLoading || debouncedSearchTerm !== searchTerm ? (
            <Table<Author> loading columns={columns} bordered />
          ) : (
            <Table<Author>
              columns={columns}
              dataSource={authors?.data}
              rowKey="author_id"
              bordered
              scroll={{ x: 'max-content' }}
              pagination={{
                total: authors?.meta.total,
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
        </Card>
      </Flex>

      {/* Create Modal */}
      <Modal
        title="Add New Author"
        open={isCreateModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}>
        <Form form={form} onFinish={onCreateAuthorFinish} layout="vertical">
          <Form.Item<AuthorFormField>
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input author name!' }]}>
            <Input placeholder="Enter author name" />
          </Form.Item>
          <Form.Item<AuthorFormField>
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Please input author slug!' }]}>
            <Input placeholder="Enter author slug" />
          </Form.Item>
          <Form.Item<AuthorFormField>
            label="Short Biography"
            name="short_biography"
            rules={[{ required: true, message: 'Please input short biography!' }]}>
            <Input.TextArea rows={2} placeholder="Enter a brief description" />
          </Form.Item>
          <Form.Item<AuthorFormField>
            label="Biography"
            name="biography"
            rules={[{ required: true, message: 'Please input biography!' }]}>
            <Input.TextArea rows={4} placeholder="Enter full biography" />
          </Form.Item>
          <Form.Item<AuthorFormField> label="Nationality" name="nationality">
            <Input placeholder="Enter nationality" />
          </Form.Item>
          <Form.Item<AuthorFormField> label="Date of Birth" name="date_of_birth">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item<AuthorFormField> label="Date of Death" name="date_of_death">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createAuthorMutation.isPending}>
            Create
          </Button>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Author"
        open={isEditModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingAuthor(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}>
        <Form form={editForm} onFinish={onEditAuthorFinish} layout="vertical">
          <Form.Item<AuthorFormField>
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input author name!' }]}>
            <Input placeholder="Enter author name" />
          </Form.Item>
          <Form.Item<AuthorFormField>
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Please input author slug!' }]}>
            <Input placeholder="Enter author slug" />
          </Form.Item>
          <Form.Item<AuthorFormField>
            label="Short Biography"
            name="short_biography"
            rules={[{ required: true, message: 'Please input short biography!' }]}>
            <Input.TextArea rows={2} placeholder="Enter a brief description" />
          </Form.Item>
          <Form.Item<AuthorFormField>
            label="Biography"
            name="biography"
            rules={[{ required: true, message: 'Please input biography!' }]}>
            <Input.TextArea rows={4} placeholder="Enter full biography" />
          </Form.Item>
          <Form.Item<AuthorFormField> label="Nationality" name="nationality">
            <Input placeholder="Enter nationality" />
          </Form.Item>
          <Form.Item<AuthorFormField> label="Date of Birth" name="date_of_birth">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item<AuthorFormField> label="Date of Death" name="date_of_death">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateAuthorMutation.isPending}>
            Update
          </Button>
        </Form>
      </Modal>

      {/* Upload Image Modal */}
      <Modal
        title="Upload Author Image"
        open={isUploadModalOpen}
        onCancel={() => {
          setIsUploadModalOpen(false);
          setUploadingAuthorSlug(null);
          setFileList([]);
          setPreviewImage('');
        }}
        footer={null}>
        <Upload
          maxCount={1}
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          beforeUpload={(file: FileType) => {
            setFileList([file]); // Keep only latest file
            return false; // Prevent auto upload
          }}>
          {fileList.length >= 1 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>

        {previewImage && (
          <Image
            style={{ display: 'none' }}
            alt="Preview"
            preview={{
              open: previewOpen,
              onOpenChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage('')
            }}
            src={previewImage}
          />
        )}

        <Button
          type="primary"
          className="mt-5"
          disabled={fileList.length === 0 || !uploadingAuthorSlug}
          icon={<UploadOutlined />}
          loading={uploadAuthorImageMutation.isPending}
          onClick={() => {
            const file = fileList[0]?.originFileObj;
            if (file && uploadingAuthorSlug) {
              uploadAuthorImageMutation.mutate({
                authorSlug: uploadingAuthorSlug,
                file
              });
            }
          }}
          style={{ marginTop: 16 }}>
          Upload Image
        </Button>
      </Modal>
    </>
  );
}
