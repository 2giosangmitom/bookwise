import { type NotificationInstance } from 'antd/es/notification/interface';

export function openNotificationWithIcon(
  api: NotificationInstance,
  type: 'success' | 'info' | 'warning' | 'error',
  title: string,
  description: string
) {
  api[type]({
    title,
    description,
    placement: 'bottomRight'
  });
}
