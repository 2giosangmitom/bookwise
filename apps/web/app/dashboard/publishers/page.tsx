'use client';

import {
  createPublisher,
  deletePublisher,
  getPublishers,
  updatePublisher,
  uploadPublisherImage
} from '@/lib/api/publisher';
import { Publisher, GetPublishersResponse } from '@/lib/api/types';
import { useAuthContext } from '@/contexts/Auth';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  UploadOutlined
} from '@ant-design/icons';
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
  Upload,
  UploadFile,
  GetProp,
  UploadProps,
  Image
} from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';

const { Title, Paragraph } = Typography;

interface PublisherFormField {
  name: string;
  website: string;
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

export default function PublishersPage() {
  const { accessToken } = useAuthContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm<PublisherFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingKey, setEditingKey] = useState('');
  const [editForm] = Form.useForm<PublisherFormField>();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingPublisherSlug, setUploadingPublisherSlug] = useState<string | null>(null);
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

  const { data: publishers, isLoading } = useQuery({
    queryKey: ['publishers', page, limit, debouncedSearchTerm],
    queryFn: (): Promise<GetPublishersResponse> =>
      getPublishers(accessToken, { page, limit, searchTerm: debouncedSearchTerm })
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

  const uploadPublisherImageMutation = useMutation({
    mutationFn: (data: { publisherSlug: string; file: File }) =>
      uploadPublisherImage(accessToken, data.publisherSlug, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
      messageApi.success('Publisher image uploaded successfully');
      setIsUploadModalOpen(false);
      setUploadingPublisherSlug(null);
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

  const handleDelete = (publisherId: string) => {
    Modal.confirm({
      title: 'Delete Publisher',
      content: 'Are you sure you want to delete this publisher?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deletePublisherMutation.mutate(publisherId)
    });
  };

  const columns: TableColumnsType<Publisher> = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      width: 100,
      render: (text) =>
        text ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={text} alt="Publisher Logo" width={50} height={50} />
        ) : (
          <p>No Image</p>
        )
    },
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
              onClick={() => handleDelete(record.publisher_id)}
            />
            <Button
              type="primary"
              size="small"
              icon={<UploadOutlined />}
              onClick={() => {
                setUploadingPublisherSlug(record.slug);
                setIsUploadModalOpen(true);
              }}
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
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
            <Modal
              title="Upload Publisher Image"
              open={isUploadModalOpen}
              onCancel={() => {
                setIsUploadModalOpen(false);
                setUploadingPublisherSlug(null);
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
                disabled={fileList.length === 0 || !uploadingPublisherSlug}
                icon={<UploadOutlined />}
                loading={uploadPublisherImageMutation.isPending}
                onClick={() => {
                  const file = fileList[0]?.originFileObj;
                  if (file && uploadingPublisherSlug) {
                    uploadPublisherImageMutation.mutate({
                      publisherSlug: uploadingPublisherSlug,
                      file
                    });
                  }
                }}
                style={{ marginTop: 16 }}>
                Upload Image
              </Button>
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
              </Form>
            </div>
          )}
        </Card>
      </Flex>
    </>
  );
}
