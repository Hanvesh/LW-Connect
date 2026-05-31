'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiService.get('/notifications'),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiService.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiService.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  if (isLoading) {
    return (
      <div className="w-96 bg-white rounded-lg shadow-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const notificationList = notifications || [];

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg max-h-[500px] overflow-hidden flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {notificationList.some((n: any) => !n.is_read) && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notificationList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notificationList.map((notification: any) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-indigo-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
