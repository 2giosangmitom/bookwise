'use client';

import { createLocation, deleteLocation, getLocations, updateLocation } from '@/lib/api/location';
import { Location, GetLocationsResponse } from '@/lib/api/types';
import { useAuthContext } from '@/contexts/Auth';
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
  InputNumber
} from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';

const { Title, Paragraph } = Typography;

interface LocationFormField {
  room: string;
  floor: number;
  shelf: number;
  row: number;
}

export default function LocationsPage() {
  const { accessToken } = useAuthContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [createForm] = Form.useForm<LocationFormField>();
  const [editForm] = Form.useForm<LocationFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch locations with search and pagination
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ['locations', page, limit, debouncedSearchTerm],
    queryFn: (): Promise<GetLocationsResponse> =>
      getLocations(accessToken, {
        page,
        limit,
        room: debouncedSearchTerm
      })
  });

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: (locationId: string) => deleteLocation(accessToken, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      messageApi.success('Location deleted successfully');
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: (data: LocationFormField) => createLocation(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      messageApi.success('Location created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: (data: LocationFormField & { locationId: string }) =>
      updateLocation(accessToken, data.locationId, {
        room: data.room,
        floor: data.floor,
        shelf: data.shelf,
        row: data.row
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      messageApi.success('Location updated successfully');
      setEditModalOpen(false);
      setEditingLocation(null);
    },
    onError: (error) => {
      messageApi.error(error.message);
    }
  });

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    editForm.setFieldsValue({
      room: location.room,
      floor: location.floor,
      shelf: location.shelf,
      row: location.row
    });
    setEditModalOpen(true);
  };

  const handleDelete = (locationId: string) => {
    Modal.confirm({
      title: 'Delete Location',
      content: 'Are you sure you want to delete this location?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteLocationMutation.mutate(locationId)
    });
  };

  const onCreateFinish = (values: LocationFormField) => {
    createLocationMutation.mutate(values);
  };

  const onEditFinish = (values: LocationFormField) => {
    if (editingLocation) {
      updateLocationMutation.mutate({ ...values, locationId: editingLocation.location_id });
    }
  };

  const columns: TableColumnsType<Location> = [
    {
      title: 'Location ID',
      dataIndex: 'location_id',
      width: 150
    },
    {
      title: 'Room',
      dataIndex: 'room',
      width: 150
    },
    {
      title: 'Floor',
      dataIndex: 'floor',
      width: 100
    },
    {
      title: 'Shelf',
      dataIndex: 'shelf',
      width: 100
    },
    {
      title: 'Row',
      dataIndex: 'row',
      width: 100
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: (_, record) => formatDateTime(record.created_at),
      width: 160
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      render: (_, record) => formatDateTime(record.updated_at),
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
            onClick={() => handleDelete(record.location_id)}
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
            <Title level={3}>Locations Management</Title>
            <Paragraph>Manage library locations including rooms, floors, shelves, and rows.</Paragraph>
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search by room name"
              style={{ width: '40%' }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Add Location
            </Button>
          </Flex>

          {isLoading || debouncedSearchTerm !== searchTerm ? (
            <Table<Location> loading columns={columns} bordered />
          ) : (
            <Table<Location>
              columns={columns}
              dataSource={locationsData?.data}
              rowKey="location_id"
              bordered
              scroll={{ x: 'max-content' }}
              pagination={{
                total: locationsData?.meta.total,
                pageSize: limit,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                current: page,
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
        title="Add New Location"
        open={isCreateModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}>
        <Form form={createForm} onFinish={onCreateFinish} layout="vertical">
          <Form.Item<LocationFormField>
            label="Room"
            name="room"
            rules={[{ required: true, message: 'Please input room name!' }]}>
            <Input placeholder="Enter room name (e.g., Main Hall, Archive)" />
          </Form.Item>
          <Form.Item<LocationFormField>
            label="Floor"
            name="floor"
            rules={[{ required: true, message: 'Please input floor number!' }]}>
            <InputNumber placeholder="Enter floor number" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item<LocationFormField>
            label="Shelf"
            name="shelf"
            rules={[{ required: true, message: 'Please input shelf number!' }]}>
            <InputNumber placeholder="Enter shelf number" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item<LocationFormField>
            label="Row"
            name="row"
            rules={[{ required: true, message: 'Please input row number!' }]}>
            <InputNumber placeholder="Enter row number" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createLocationMutation.isPending}>
            Create
          </Button>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Location"
        open={isEditModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingLocation(null);
          editForm.resetFields();
        }}
        footer={null}>
        <Form form={editForm} onFinish={onEditFinish} layout="vertical">
          <Form.Item<LocationFormField>
            label="Room"
            name="room"
            rules={[{ required: true, message: 'Please input room name!' }]}>
            <Input placeholder="Enter room name (e.g., Main Hall, Archive)" />
          </Form.Item>
          <Form.Item<LocationFormField>
            label="Floor"
            name="floor"
            rules={[{ required: true, message: 'Please input floor number!' }]}>
            <InputNumber placeholder="Enter floor number" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item<LocationFormField>
            label="Shelf"
            name="shelf"
            rules={[{ required: true, message: 'Please input shelf number!' }]}>
            <InputNumber placeholder="Enter shelf number" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item<LocationFormField>
            label="Row"
            name="row"
            rules={[{ required: true, message: 'Please input row number!' }]}>
            <InputNumber placeholder="Enter row number" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateLocationMutation.isPending}>
            Update
          </Button>
        </Form>
      </Modal>
    </>
  );
}
