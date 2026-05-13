/**
 * Background Batch Sync Service
 * ─────────────────────────────
 * Thu thập các thay đổi tiến độ (progress) vào một hàng đợi (queue) trong localStorage,
 * sau đó đồng bộ hàng loạt (batch sync) lên Database mỗi 60 giây.
 *
 * Cơ chế hoạt động:
 * 1. Khi user thay đổi trạng thái skill → ghi vào queue trong localStorage (non-blocking).
 * 2. Mỗi 60 giây, một interval sẽ đọc queue và gửi toàn bộ lên backend qua POST /progress/batch-sync.
 * 3. Nếu gửi thành công → xóa queue. Nếu thất bại → giữ lại để thử lại ở cycle sau.
 * 4. Flush ngay lập tức khi user rời trang (beforeunload) hoặc chuyển tab (visibilitychange).
 */

import { api } from './api';

// ───── CONSTANTS ─────
const SYNC_QUEUE_KEY = 'progressSyncQueue';
const SYNC_INTERVAL_MS = 60_000; // 60 giây
const SYNC_LAST_FLUSHED_KEY = 'progressSyncLastFlushed';

// ───── TYPES ─────
export interface ProgressQueueItem {
  /** ID của RoadmapSkill (junction table) */
  roadmapSkillId: number;
  /** ID trạng thái mới (1=COMPLETED, 2=IN_PROGRESS, 3=SKIPPED, null=RESET) */
  statusId: number | null;
  /** Thời điểm thay đổi (ISO string) */
  changedAt: string;
}

// ───── QUEUE MANAGEMENT ─────

/**
 * Đọc queue hiện tại từ localStorage.
 * Trả về mảng rỗng nếu chưa có hoặc lỗi parse.
 */
export function getQueue(): ProgressQueueItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProgressQueueItem[];
  } catch {
    return [];
  }
}

/**
 * Ghi đè queue trong localStorage.
 */
function saveQueue(queue: ProgressQueueItem[]): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Xóa toàn bộ queue (sau khi flush thành công).
 */
function clearQueue(): void {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

/**
 * Thêm một thay đổi tiến độ vào queue.
 * Nếu cùng roadmapSkillId đã tồn tại → ghi đè (chống spam click).
 */
export function enqueueProgressChange(
  roadmapSkillId: number,
  statusId: number | null,
): void {
  const queue = getQueue();

  // Tìm và ghi đè nếu đã tồn tại
  const existingIndex = queue.findIndex(
    (item) => item.roadmapSkillId === roadmapSkillId,
  );

  const newItem: ProgressQueueItem = {
    roadmapSkillId,
    statusId,
    changedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    queue[existingIndex] = newItem;
  } else {
    queue.push(newItem);
  }

  saveQueue(queue);
}

/**
 * Lấy số lượng item đang chờ trong queue.
 */
export function getPendingCount(): number {
  return getQueue().length;
}

// ───── BATCH FLUSH ─────

/**
 * Gửi toàn bộ queue lên backend qua POST /progress/batch-sync.
 * - Nếu thành công: xóa queue + cập nhật lastFlushed timestamp.
 * - Nếu thất bại: giữ queue nguyên để thử lại ở cycle sau.
 *
 * @returns true nếu flush thành công hoặc queue rỗng, false nếu thất bại.
 */
export async function flushProgressQueue(): Promise<boolean> {
  const queue = getQueue();

  // Không có gì để sync
  if (queue.length === 0) return true;

  try {
    console.log(
      `[ProgressSync] 🔄 Đang đồng bộ ${queue.length} thay đổi lên server...`,
    );

    await api.post('/progress/batch-sync', { items: queue });

    // Flush thành công → xóa queue
    clearQueue();
    localStorage.setItem(SYNC_LAST_FLUSHED_KEY, new Date().toISOString());

    console.log(
      `[ProgressSync] ✅ Đồng bộ thành công ${queue.length} thay đổi!`,
    );
    return true;
  } catch (error) {
    console.error(
      `[ProgressSync] ❌ Đồng bộ thất bại. Giữ ${queue.length} thay đổi để thử lại.`,
      error,
    );
    return false;
  }
}

// ───── LIFECYCLE MANAGER ─────

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Handler cho sự kiện visibilitychange.
 * Flush ngay khi user chuyển tab hoặc minimize trình duyệt.
 */
function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    flushProgressQueue();
  }
}

/**
 * Handler cho sự kiện beforeunload.
 * Sử dụng sendBeacon để đảm bảo request được gửi ngay cả khi trang đang đóng.
 */
function handleBeforeUnload(): void {
  const queue = getQueue();
  if (queue.length === 0) return;

  // Sử dụng navigator.sendBeacon cho reliability khi trang đóng
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('access_token');

  const blob = new Blob(
    [JSON.stringify({ items: queue })],
    { type: 'application/json' },
  );

  // sendBeacon không hỗ trợ custom headers (Bearer token),
  // nên fallback sang fetch keepalive nếu cần auth
  if (token) {
    try {
      fetch(`${apiBaseUrl}/progress/batch-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: queue }),
        keepalive: true, // Đảm bảo request sống sót khi trang đóng
      });
    } catch {
      // Fallback to sendBeacon (không có auth header)
      navigator.sendBeacon(`${apiBaseUrl}/progress/batch-sync`, blob);
    }
  } else {
    navigator.sendBeacon(`${apiBaseUrl}/progress/batch-sync`, blob);
  }

  clearQueue();
}

/**
 * Khởi động Background Batch Sync.
 * - Thiết lập interval chạy mỗi 60 giây.
 * - Đăng ký event listeners cho visibilitychange và beforeunload.
 */
export function startProgressSync(): void {
  // Tránh khởi động trùng lặp
  if (intervalId !== null) return;

  console.log('[ProgressSync] 🚀 Khởi động Background Batch Sync (interval: 60s)');

  // Interval chính: flush mỗi 60 giây
  intervalId = setInterval(() => {
    flushProgressQueue();
  }, SYNC_INTERVAL_MS);

  // Event listeners cho edge cases
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
}

/**
 * Dừng Background Batch Sync.
 * - Xóa interval.
 * - Gỡ event listeners.
 * - Flush lần cuối trước khi dừng.
 */
export function stopProgressSync(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('beforeunload', handleBeforeUnload);

  // Flush lần cuối
  flushProgressQueue();

  console.log('[ProgressSync] 🛑 Đã dừng Background Batch Sync.');
}

/**
 * Lấy thời điểm flush thành công gần nhất.
 */
export function getLastFlushedTime(): string | null {
  return localStorage.getItem(SYNC_LAST_FLUSHED_KEY);
}
