import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import apiClient from '@/lib/axios';

export interface Resource {
  id: number;
  type: string;
  title: string;
  url: string;
  source?: string;
  durationMinutes?: number;
}

export interface DrawerData {
  title: string;
  content: string;
  isCompleted: boolean;
  resources: Resource[];
}

interface ResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  data: DrawerData | null;
  skillId?: number | null;
  onCompleteSuccess?: (skillId: number, newStatus: boolean) => void;
}

/** Maps resource type names to their visual badge styles. */
const badgeStyles: Record<string, string> = {
  article: 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/30',
  feed: 'bg-[#ffb873]/10 text-[#ffb873] border-[#ffb873]/30',
  book: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30',
  official: 'bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/30',
  video: 'bg-[#f472b6]/10 text-[#f472b6] border-[#f472b6]/30',
  opensource: 'bg-[#bcc9cd]/10 text-[#bcc9cd] border-[#bcc9cd]/30',
  roadmap: 'bg-[#ffb873]/10 text-[#ffb873] border-[#ffb873]/30',
  course: 'bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/30',
  default: 'bg-[#3d494c]/20 text-[#bcc9cd] border-[#3d494c]/50',
};

/** Maps resource type to emoji icon for quick visual recognition. */
const resourceIcons: Record<string, string> = {
  article: '📄',
  feed: '📡',
  book: '📚',
  official: '🏛️',
  video: '🎬',
  opensource: '💻',
  roadmap: '🗺️',
  course: '🎓',
  default: '🔗',
};

/** Returns the badge class for a given resource type, defaulting if unrecognized. */
const getBadgeStyle = (type?: string) => {
  const normalizedType = type?.toLowerCase().trim() || 'default';
  return badgeStyles[normalizedType] || badgeStyles.default;
};

/** Returns the emoji icon for a given resource type. */
const getResourceIcon = (type?: string) => {
  const normalizedType = type?.toLowerCase().trim() || 'default';
  return resourceIcons[normalizedType] || resourceIcons.default;
};

/**
 * Slide-over drawer displaying learning resources and details for a roadmap node.
 *
 * @param props.isOpen - Controls drawer visibility.
 * @param props.onClose - Callback when the drawer should close.
 * @param props.isLoading - Whether data is being fetched.
 * @param props.data - The content and resource list to display.
 */
export const ResourceDrawer: React.FC<ResourceDrawerProps> = ({
  isOpen,
  onClose,
  isLoading,
  data,
  skillId,
  // Đổi tên callback một chút (tùy chọn) hoặc giữ nguyên, 
  // nhưng ta cần truyền thêm tham số thứ 2 là boolean (trạng thái mới)
  onCompleteSuccess 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Lấy trạng thái hiện tại từ data truyền vào
  const isCompleted = !!data?.isCompleted;

  const handleToggleComplete = async () => {
    if (!skillId) {
      alert("LỖI: Không tìm thấy skillId!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCompleted) {
        // LUỒNG 1: HỦY HOÀN THÀNH (BẤM NHẦM)
        // Lưu ý: Sửa lại URL hoặc Method (DELETE/POST) cho khớp với Backend NestJS của bạn
        const url = `/progress/skills/${skillId}/complete`; 
        await apiClient.delete(url); // Ví dụ dùng DELETE để xóa progress
        
        console.log("🛑 Đã HỦY hoàn thành skill:", skillId);
        onCompleteSuccess?.(skillId, false); // Truyền false để báo thẻ Cha tắt màu xanh
        
      } else {
        // LUỒNG 2: ĐÁNH DẤU HOÀN THÀNH
        const url = `/progress/skills/${skillId}/complete`; 
        await apiClient.post(url);
        
        console.log("🛑 Đã ĐÁNH DẤU hoàn thành skill:", skillId);
        onCompleteSuccess?.(skillId, true); // Truyền true để báo thẻ Cha bật màu xanh
      }
    } catch (error: any) {
      console.error("🛑 LỖI API:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu tiến độ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !data && !isLoading) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#0b1326]/60 z-[100] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0b1326] border-l border-[#3d494c]/50 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#3d494c]/50 bg-[#131b2e]">
          <h2 className="flex-1 min-w-0 text-lg font-bold text-white tracking-tight leading-snug break-words capitalize">
            {isLoading ? <Skeleton className="h-7 w-48 bg-[#171f33]" /> : data?.title}
          </h2>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="flex-shrink-0 text-[#bcc9cd] hover:text-[#4cd7f6] hover:bg-[#171f33] font-bold text-lg h-8 w-8 p-0 flex items-center justify-center rounded-full transition-colors"
            aria-label="Close drawer"
          >
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-[#171f33]" />
                <Skeleton className="h-4 w-[90%] bg-[#171f33]" />
                <Skeleton className="h-4 w-[80%] bg-[#171f33]" />
              </div>
              <Skeleton className="h-8 w-40 bg-[#171f33] mt-8" />
              <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded-xl bg-[#171f33]" />
                <Skeleton className="h-28 w-full rounded-xl bg-[#171f33]" />
              </div>
            </div>
          ) : data && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
              
              {/* Content area uses prose styling for future Markdown support. */}
              {data.content && (
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-[#bcc9cd] mb-10 leading-relaxed whitespace-pre-wrap">
                  {data.content}
                </div>
              )}

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#dae2fd] flex items-center gap-2">
                  Reference Materials
                </h3>
                <Badge variant="secondary" className="bg-[#171f33] text-[#4cd7f6] border border-[#4cd7f6]/20 font-bold px-3 py-1 rounded-full">
                  {data.resources?.length || 0} items
                </Badge>
              </div>

              {data.resources?.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {data.resources.map((res) => (
                    <a 
                      key={res.id} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group outline-none focus-visible:ring-2 focus-visible:ring-[#4cd7f6] rounded-xl"
                    >
                      <Card className="p-3 border border-[#3d494c]/40 bg-[#171f33] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#4cd7f6]/50 group-hover:shadow-[0_4px_15px_rgba(76,215,246,0.15)] flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-sm text-[#dae2fd] group-hover:text-[#4cd7f6] transition-colors line-clamp-2 leading-snug mt-0.5">
                            <span className="mr-1.5">{getResourceIcon(res.type)}</span>
                            {res.title}
                          </h4>
                          
                          <Badge 
                            variant="outline" 
                            className={`uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 whitespace-nowrap border ${getBadgeStyle(res.type)}`}
                          >
                            {res.type}
                          </Badge>
                        </div>
                        
                        {(res.source || res.durationMinutes) && (
                          <div className="flex items-center gap-3 text-xs font-medium text-[#bcc9cd]">
                            {res.source && <span>📍 {res.source}</span>}
                            {res.durationMinutes && <span>⏱ {res.durationMinutes} min</span>}
                          </div>
                        )}
                      </Card>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-[#171f33] rounded-2xl border border-dashed border-[#3d494c]">
                  <div className="text-4xl mb-3">📚</div>
                  <h4 className="text-[#dae2fd] font-bold mb-1">No resources yet</h4>
                  <p className="text-sm text-[#bcc9cd]">Resources for this topic are being prepared.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Sticky Footer for Action Button */}
        {data && skillId && (
          <div className="p-5 border-t border-[#3d494c]/50 bg-[#0b1326]">
            <button 
          onClick={handleToggleComplete}
          disabled={isSubmitting}
          className={`
            w-full font-bold rounded-xl py-3 text-sm transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            ${isCompleted 
              ? 'bg-[#171f33] text-[#bcc9cd] border border-[#3d494c] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50' 
              : 'bg-gradient-to-r from-[#4cd7f6] to-[#06b6d4] text-[#003640] hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(76,215,246,0.35)]'
            }
          `}
        >
          {isSubmitting 
            ? 'Đang xử lý...' 
            : (isCompleted ? 'Đã học xong (Bấm để hủy)' : 'Đánh dấu hoàn thành')
          }
        </button>
          </div>
        )}
      </div>
    </>
  );
};