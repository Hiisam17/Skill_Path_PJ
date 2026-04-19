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
  article: 'bg-blue-50 text-blue-700 border-blue-200',
  feed: 'bg-orange-50 text-orange-700 border-orange-200',
  book: 'bg-green-50 text-green-700 border-green-200',
  official: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  video: 'bg-red-50 text-red-700 border-red-200',
  opensource: 'bg-slate-100 text-slate-700 border-slate-300',
  roadmap: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  course: 'bg-purple-50 text-purple-700 border-purple-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200',
};

/** Returns the badge class for a given resource type, defaulting if unrecognized. */
const getBadgeStyle = (type?: string) => {
  const normalizedType = type?.toLowerCase().trim() || 'default';
  return badgeStyles[normalizedType] || badgeStyles.default;
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
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white border-l-4 border-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b-2 border-slate-100 bg-white">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight truncate pr-4">
            {isLoading ? <Skeleton className="h-8 w-48" /> : data?.title}
          </h2>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-bold text-xl h-10 w-10 p-0 flex items-center justify-center rounded-full transition-colors"
            aria-label="Close drawer"
          >
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-slate-200" />
                <Skeleton className="h-4 w-[90%] bg-slate-200" />
                <Skeleton className="h-4 w-[80%] bg-slate-200" />
              </div>
              <Skeleton className="h-8 w-40 bg-slate-200 mt-8" />
              <div className="space-y-4">
                <Skeleton className="h-28 w-full rounded-xl bg-slate-200" />
                <Skeleton className="h-28 w-full rounded-xl bg-slate-200" />
              </div>
            </div>
          ) : data && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
              
              {/* Content area uses prose styling for future Markdown support. */}
              {data.content && (
                <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 mb-10 leading-relaxed whitespace-pre-wrap">
                  {data.content}
                </div>
              )}

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Reference Materials
                </h3>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
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
                      className="block group outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-xl"
                    >
                      <Card className="p-5 border-2 border-slate-200 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-slate-900 group-hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] bg-white flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
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
                          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                            {res.source && <span>📍 {res.source}</span>}
                            {res.durationMinutes && <span>⏱ {res.durationMinutes} min</span>}
                          </div>
                        )}
                      </Card>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="text-4xl mb-3">📚</div>
                  <h4 className="text-slate-900 font-bold mb-1">No resources yet</h4>
                  <p className="text-sm text-slate-500">Resources for this topic are being prepared.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Sticky Footer for Action Button */}
        {data && skillId && (
          <div className="p-5 border-t-2 border-slate-100 bg-white">
            <button 
          onClick={handleToggleComplete}
          disabled={isSubmitting}
          className={`
            w-full border-4 border-black font-black uppercase py-3 text-lg transition-all
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            hover:-translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,1)]
            ${isCompleted 
              ? 'bg-slate-200 text-slate-800 hover:bg-red-400 hover:text-black' // Style khi đã xong (di chuột vào hiện màu đỏ cảnh báo hủy)
              : 'bg-[#3b82f6] text-white hover:bg-blue-600' // Style khi chưa xong (màu xanh dương)
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