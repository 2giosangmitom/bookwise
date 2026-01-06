# Web App Coding Instructions

This document provides strict, long-term AI coding instructions for the Next.js web application in the BookWise monorepo.

## Purpose & Scope

This is the frontend web application for the BookWise library management system. It provides user authentication, dashboard for staff/admin operations, and user-facing features.

## Tech Stack

- **Framework**: Next.js 16.x with App Router
- **React**: React 19.x with Server Components by default
- **UI Library**: Ant Design 6.x
- **State Management**: Zustand for client-side global state
- **Data Fetching**: TanStack Query 5.x for server state
- **Styling**: Tailwind CSS 4.x + Ant Design theming
- **HTTP Client**: Custom fetch wrapper with auto token refresh

## Architecture & Folder Conventions

```
app/
├── layout.tsx              # Root layout (Server Component)
├── page.tsx                # Home page
├── globals.css             # Global styles
├── _components/            # App-level shared components
│   ├── AuthProvider.tsx    # Client Component for auth context
│   └── QueryProvider.tsx   # Client Component for TanStack Query
├── (auth)/                 # Auth route group
│   ├── layout.tsx          # Auth layout
│   ├── signin/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
└── dashboard/              # Protected dashboard routes
    ├── layout.tsx          # Dashboard layout with sidebar
    ├── page.tsx
    ├── _components/        # Dashboard-specific components
    ├── books/
    ├── book-clones/
    ├── categories/
    └── ...
contexts/
└── Auth.ts                 # Auth context definition
lib/
├── constants.ts            # App constants
├── api/                    # API client layer
│   ├── apiClient.ts        # Fetch wrapper with token refresh
│   ├── types.ts            # API response types
│   ├── auth.ts             # Auth API functions
│   ├── book.ts             # Book API functions
│   └── ...
└── middleware.ts           # Route protection helpers (if exists)
stores/
└── useTokenStore.ts        # Zustand store for access token
utils/
├── datetime.ts             # Date formatting utilities
└── notification.ts         # Notification helpers
public/
├── icons/
└── images/
```

## Next.js App Router Rules

### Server vs Client Components

1. **Server Components are the default**. Only add `'use client'` when necessary.
2. Use `'use client'` ONLY when the component:
   - Uses React hooks (`useState`, `useEffect`, `useContext`, etc.)
   - Uses browser APIs (`window`, `document`, `localStorage`)
   - Uses event handlers (`onClick`, `onChange`, etc.)
   - Uses TanStack Query hooks (`useQuery`, `useMutation`)
   - Uses Zustand stores (`useTokenStore`)
   - Uses Ant Design interactive components (`Form`, `Modal`, `Table`, etc.)

3. Keep Server Components for:
   - Layout components with static content
   - Page components that only render children
   - Metadata exports
   - Data fetching at the page level (when possible)

### Page Structure

```tsx
// Server Component page (default)
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title - BookWise',
  description: 'Page description'
};

export default function PageName() {
  return <ClientComponent />;
}
```

```tsx
// Client Component for interactive content
'use client';

import { useQuery } from '@tanstack/react-query';
import useTokenStore from '@/stores/useTokenStore';

export default function ClientComponent() {
  const accessToken = useTokenStore((state) => state.accessToken);
  // Component logic
}
```

### Layouts

1. Use route groups `(groupName)` for shared layouts without URL impact
2. Dashboard layout wraps all `/dashboard/*` routes
3. Auth layout wraps all auth routes `(auth)/*`

### Data Fetching Boundaries

1. **Root Layout**: Prefetch user data and access token on server

   ```tsx
   // In layout.tsx (Server Component)
   const cookieStore = await cookies();
   const refreshResponse = await fetchApi<RefreshTokenResponse>('/auth/refresh-token', {
     method: 'POST',
     headers: { cookie: cookieStore.toString() }
   });
   ```

2. **Client Components**: Use TanStack Query for data fetching
   ```tsx
   const { data, isLoading } = useQuery({
     queryKey: ['books', page, searchTerm],
     queryFn: () => getBooks(accessToken, { page, limit: 10, searchTerm })
   });
   ```

## API Communication

### API Client Layer

ALL API calls MUST go through `lib/api/` functions:

```typescript
// lib/api/book.ts
import { fetchApiWithAutoRefresh } from './apiClient';
import { GetBooksResponse } from './types';

export function getBooks(accessToken: string | null, query?: { page?: number; limit?: number; searchTerm?: string }) {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 10;
  const searchTerm = query?.searchTerm ? `&searchTerm=${encodeURIComponent(query.searchTerm)}` : '';

  return fetchApiWithAutoRefresh<GetBooksResponse>(
    `/staff/book?limit=${limit}&page=${page}${searchTerm}`,
    accessToken,
    { method: 'GET' }
  );
}
```

### Fetch Wrapper

Use `fetchApiWithAutoRefresh` for authenticated requests:

- Automatically attaches Bearer token
- Handles 401/403 by attempting token refresh
- Throws `ApiError` with status code on failure

Use `fetchApi` for unauthenticated requests (e.g., server-side refresh).

### Type Definitions

Define all API response types in `lib/api/types.ts`:

```typescript
export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type Book = {
  book_id: string;
  title: string;
  // ... other fields
};

export type GetBooksResponse = {
  message: string;
  data: Book[];
  meta: { total: number };
};
```

## State Management

### Access Token (Zustand)

```typescript
// stores/useTokenStore.ts
import { create } from 'zustand';

const useTokenStore = create<{
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token })
}));

export default useTokenStore;
```

Usage in components:

```tsx
const accessToken = useTokenStore((state) => state.accessToken);
```

### User Context

```tsx
// contexts/Auth.ts
import { createContext, useContext } from 'react';

const AuthContext = createContext<{ user: User | null }>({ user: null });

function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
```

### TanStack Query

QueryClient is configured in `_components/QueryProvider.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
});
```

## UI Patterns with Ant Design

### Page Structure

```tsx
'use client';

import { Button, Card, Flex, Table, Typography, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function ResourcePage() {
  const [messageApi, contextHolder] = message.useMessage();
  const accessToken = useTokenStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['resources', page],
    queryFn: () => getResources(accessToken, { page, limit: 10 })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResource(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      messageApi.success('Deleted successfully');
    },
    onError: (error) => messageApi.error(error.message)
  });

  return (
    <>
      {contextHolder}
      <Flex>
        <Card style={{ width: '100%' }}>
          <Title level={3}>Resources</Title>
          <Paragraph>Description here.</Paragraph>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Input prefix={<SearchOutlined />} placeholder="Search..." />
            <Button type="primary" icon={<PlusOutlined />}>
              Add
            </Button>
          </Flex>

          <Table
            dataSource={data?.data}
            loading={isLoading}
            rowKey="resource_id"
            pagination={{
              current: page,
              total: data?.meta?.total,
              pageSize: 10,
              onChange: setPage
            }}
          />
        </Card>
      </Flex>
    </>
  );
}
```

### Delete Confirmation

ALWAYS use `Modal.confirm` for destructive actions:

```tsx
const handleDelete = (id: string) => {
  Modal.confirm({
    title: 'Delete Resource',
    content: 'Are you sure you want to delete this resource?',
    okText: 'Delete',
    okType: 'danger',
    onOk: () => deleteMutation.mutate(id)
  });
};
```

### Forms with Modals

```tsx
const [form] = Form.useForm<FormFields>();
const [isModalOpen, setModalOpen] = useState(false);

const createMutation = useMutation({
  mutationFn: (data: FormFields) => createResource(accessToken, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
    messageApi.success('Created successfully');
    setModalOpen(false);
    form.resetFields();
  }
});

<Modal
  title="Create Resource"
  open={isModalOpen}
  onCancel={() => {
    setModalOpen(false);
    form.resetFields();
  }}
  footer={null}>
  <Form form={form} onFinish={createMutation.mutate} layout="vertical">
    <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input name!' }]}>
      <Input />
    </Form.Item>
    <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
      Create
    </Button>
  </Form>
</Modal>;
```

### Select with Search

Use the object-based `showSearch` API (not deprecated props):

```tsx
<Select
  placeholder="Type to search"
  loading={isLoading}
  showSearch={{
    onSearch: setSearchTerm,
    filterOption: false
  }}
  options={
    data?.data?.map((item) => ({
      label: item.name,
      value: item.id
    })) || []
  }
/>
```

### Condition Tags with Colors

```tsx
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

<Tag color={getConditionColor(record.condition)}>{record.condition}</Tag>;
```

## Coding Rules

### TypeScript

1. Use strict TypeScript
2. Define explicit types for form fields and state
3. Use path aliases: `@/` maps to project root
4. Import types with `import type` when appropriate

### React Patterns

1. Use functional components exclusively
2. Use `useState` for local UI state
3. Use `useQuery`/`useMutation` for server state
4. Use debounced search with `useDebounce` from `@uidotdev/usehooks`:

   ```tsx
   const [searchTerm, setSearchTerm] = useState('');
   const debouncedSearchTerm = useDebounce(searchTerm, 500);

   const { data } = useQuery({
     queryKey: ['items', page, debouncedSearchTerm],
     queryFn: () => getItems(accessToken, { searchTerm: debouncedSearchTerm })
   });
   ```

### Error Handling

1. Use `messageApi.error()` for user-facing errors
2. Handle loading states with `isLoading` from queries
3. Show skeleton/loading state while data is being fetched:
   ```tsx
   {
     isLoading ? <Spin size="large" /> : <Content />;
   }
   ```

### Date Formatting

Use utility function from `utils/datetime.ts`:

```tsx
import { formatDateTime } from '@/utils/datetime';

render: (_, record) => formatDateTime(record.created_at);
```

## Forbidden Actions

1. ❌ Making API calls directly with `fetch()` outside of `lib/api/` layer
2. ❌ Using `'use client'` in components that don't need it
3. ❌ Storing access tokens in localStorage (use Zustand store)
4. ❌ Using deprecated Ant Design props (`onSearch` directly on Select)
5. ❌ Skipping confirmation dialogs for delete operations
6. ❌ Using `any` type without explicit justification
7. ❌ Defining API response types outside of `lib/api/types.ts`
8. ❌ Using raw `console.log` in production code
9. ❌ Mutating state directly instead of using setters
10. ❌ Creating components without proper TypeScript types

## Example: Complete CRUD Page

```tsx
'use client';

import { createCategory, deleteCategory, getCategories, updateCategory } from '@/lib/api/category';
import { Category, GetCategoriesResponse } from '@/lib/api/types';
import useTokenStore from '@/stores/useTokenStore';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { Button, Card, Flex, Form, Input, Modal, Table, Typography, type TableColumnsType, message } from 'antd';
import { useState } from 'react';
import { formatDateTime } from '@/utils/datetime';

const { Title, Paragraph } = Typography;

interface CategoryFormField {
  name: string;
}

export default function CategoriesPage() {
  const accessToken = useTokenStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [createForm] = Form.useForm<CategoryFormField>();
  const [editForm] = Form.useForm<CategoryFormField>();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', page, debouncedSearchTerm],
    queryFn: (): Promise<GetCategoriesResponse> =>
      getCategories(accessToken, { page, limit: 10, searchTerm: debouncedSearchTerm || undefined })
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormField) => createCategory(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      messageApi.success('Category created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (error) => messageApi.error(error.message)
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormField & { categoryId: string }) =>
      updateCategory(accessToken, data.categoryId, { name: data.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      messageApi.success('Category updated successfully');
      setEditModalOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => messageApi.error(error.message)
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      messageApi.success('Category deleted successfully');
    },
    onError: (error) => messageApi.error(error.message)
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    editForm.setFieldsValue({ name: category.name });
    setEditModalOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    Modal.confirm({
      title: 'Delete Category',
      content: 'Are you sure you want to delete this category?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteMutation.mutate(categoryId)
    });
  };

  const columns: TableColumnsType<Category> = [
    { title: 'Name', dataIndex: 'name', width: 200 },
    { title: 'Slug', dataIndex: 'slug', width: 200 },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: (_, record) => formatDateTime(record.created_at),
      width: 160
    },
    {
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <Flex gap="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.category_id)} />
        </Flex>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <Flex>
        <Card style={{ width: '100%' }}>
          <Title level={3}>Categories Management</Title>
          <Paragraph>Manage book categories.</Paragraph>

          <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search categories..."
              style={{ width: 300 }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Add Category
            </Button>
          </Flex>

          <Table
            columns={columns}
            dataSource={categoriesData?.data}
            loading={isLoading || debouncedSearchTerm !== searchTerm}
            rowKey="category_id"
            pagination={{
              current: page,
              total: categoriesData?.meta?.total,
              pageSize: 10,
              onChange: setPage
            }}
          />
        </Card>
      </Flex>

      {/* Create Modal */}
      <Modal
        title="Create Category"
        open={isCreateModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}>
        <Form form={createForm} onFinish={createMutation.mutate} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input category name!' }]}>
            <Input placeholder="Enter category name" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
            Create
          </Button>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Category"
        open={isEditModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingCategory(null);
          editForm.resetFields();
        }}
        footer={null}>
        <Form
          form={editForm}
          onFinish={(values) => updateMutation.mutate({ ...values, categoryId: editingCategory!.category_id })}
          layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input category name!' }]}>
            <Input placeholder="Enter category name" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
            Update
          </Button>
        </Form>
      </Modal>
    </>
  );
}
```
