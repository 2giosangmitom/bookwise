'use client';

import { Form, Input, Button, notification, type FormProps } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import NextLink from 'next/link';
import { useState } from 'react';
import { openNotificationWithIcon } from '@/utils/notification';
import { signIn } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/apiClient';

// Type for form fields
type FieldType = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm<FieldType>();

  // Handle form submission
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      setLoading(true);
      const response = await signIn(values);
      openNotificationWithIcon(api, 'success', 'Success', response.message);
    } catch (error) {
      console.error('Error during sign in:', error);

      if (error instanceof ApiError) {
        openNotificationWithIcon(api, 'error', 'Error', error.message);
      } else {
        openNotificationWithIcon(api, 'error', 'Error', 'An unexpected error occurred. Please try again later.');
      }
    } finally {
      form.resetFields();
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        layout="vertical"
        name="signin_form"
        onFinish={onFinish}
        form={form}
        autoComplete="off"
        validateTrigger="onBlur">
        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Invalid email format' }
          ]}>
          <Input prefix={<MailOutlined />} placeholder="Your email" disabled={loading} />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Your password" disabled={loading} />
        </Form.Item>

        <Button type="primary" htmlType="submit" className="w-full mt-2" loading={loading}>
          Sign In
        </Button>
      </Form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?
        <NextLink href="/signup">
          <Button type="link">Sign up</Button>
        </NextLink>
      </p>
    </>
  );
}
