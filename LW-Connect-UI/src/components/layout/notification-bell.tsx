'use client';

import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { useState } from 'react';
import { NotificationList } from './notification-list';

export function NotificationBell() {
  const [showList, setShowList] = useState(false);

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => apiService.get('/notifications/unread/count'),
    refetchInterval: 30000, // Poll every 30s
  });

  const count = countData?.count || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setShowList(!showList)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {showList && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowList(false)}
          />
          <div className="absolute right-0 mt-2 z-50">
            <NotificationList onClose={() => setShowList(false)} />
          </div>
        </>
      )}
    </div>
  );
}
