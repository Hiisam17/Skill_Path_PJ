/**
 * ProgressSyncProvider & useProgressSync Hook
 * ─────────────────────────────────────────────
 * React Context wrapper cho Background Batch Sync.
 * Tự động khởi động sync khi user đã đăng nhập và dừng khi logout.
 *
 * Cách sử dụng:
 * 1. Wrap app với <ProgressSyncProvider> (bên trong AuthProvider).
 * 2. Gọi useProgressSync() để truy cập enqueue, flush, và trạng thái sync.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  startProgressSync,
  stopProgressSync,
  enqueueProgressChange,
  flushProgressQueue,
  getPendingCount,
  getLastFlushedTime,
} from '@/services/progressSyncService';

// ───── CONTEXT TYPES ─────

interface ProgressSyncContextType {
  /**
   * Thêm một thay đổi tiến độ vào hàng đợi.
   * Sẽ được đồng bộ lên server ở cycle tiếp theo (mỗi 60 giây).
   */
  enqueue: (roadmapSkillId: number, statusId: number | null) => void;

  /**
   * Flush ngay lập tức (không chờ interval).
   * Dùng khi cần đồng bộ ngay, ví dụ trước khi navigate sang trang khác.
   */
  flushNow: () => Promise<boolean>;

  /** Số lượng thay đổi đang chờ trong queue. */
  pendingCount: number;

  /** Thời điểm flush thành công gần nhất (ISO string hoặc null). */
  lastFlushedAt: string | null;

  /** Sync đang chạy hay không. */
  isSyncActive: boolean;
}

const ProgressSyncContext = createContext<ProgressSyncContextType | undefined>(
  undefined,
);

// ───── PROVIDER ─────

interface ProgressSyncProviderProps {
  children: ReactNode;
}

export const ProgressSyncProvider = ({ children }: ProgressSyncProviderProps) => {
  const { isAuthenticated } = useAuth();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastFlushedAt, setLastFlushedAt] = useState<string | null>(null);
  const [isSyncActive, setIsSyncActive] = useState<boolean>(false);
  const syncStartedRef = useRef(false);

  // Khởi động / Dừng sync dựa trên trạng thái đăng nhập
  useEffect(() => {
    if (isAuthenticated && !syncStartedRef.current) {
      startProgressSync();
      syncStartedRef.current = true;
      setIsSyncActive(true);

      // Cập nhật trạng thái ban đầu
      setPendingCount(getPendingCount());
      setLastFlushedAt(getLastFlushedTime());
    }

    return () => {
      if (syncStartedRef.current) {
        stopProgressSync();
        syncStartedRef.current = false;
        setIsSyncActive(false);
      }
    };
  }, [isAuthenticated]);

  // Polling nhẹ để cập nhật pendingCount cho UI (mỗi 5 giây)
  useEffect(() => {
    if (!isSyncActive) return;

    const pollId = setInterval(() => {
      setPendingCount(getPendingCount());
      setLastFlushedAt(getLastFlushedTime());
    }, 5_000);

    return () => clearInterval(pollId);
  }, [isSyncActive]);

  const enqueue = useCallback(
    (roadmapSkillId: number, statusId: number | null) => {
      enqueueProgressChange(roadmapSkillId, statusId);
      setPendingCount(getPendingCount());
    },
    [],
  );

  const flushNow = useCallback(async (): Promise<boolean> => {
    const result = await flushProgressQueue();
    setPendingCount(getPendingCount());
    setLastFlushedAt(getLastFlushedTime());
    return result;
  }, []);

  const value: ProgressSyncContextType = {
    enqueue,
    flushNow,
    pendingCount,
    lastFlushedAt,
    isSyncActive,
  };

  return (
    <ProgressSyncContext.Provider value={value}>
      {children}
    </ProgressSyncContext.Provider>
  );
};

// ───── HOOK ─────

/**
 * Hook truy cập Background Batch Sync.
 *
 * @throws Error nếu sử dụng ngoài ProgressSyncProvider.
 *
 * @example
 * ```tsx
 * const { enqueue, flushNow, pendingCount } = useProgressSync();
 *
 * // Khi user thay đổi trạng thái skill
 * enqueue(roadmapSkillId, statusId);
 *
 * // Khi cần đồng bộ ngay
 * await flushNow();
 * ```
 */
export const useProgressSync = (): ProgressSyncContextType => {
  const context = useContext(ProgressSyncContext);
  if (!context) {
    throw new Error(
      'useProgressSync must be used within a ProgressSyncProvider',
    );
  }
  return context;
};
