import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { RotateCcw, ChevronDown } from 'lucide-react';
import apiClient from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

export interface Resource {
  id: number;
  type: string;
  title: string;
  url: string | null;
  source?: string;
  durationMinutes?: number;
}

export interface DrawerData {
  title: string;
  content: string;
  statusId: number | null;
  status: string;
  resources: Resource[];
}

interface ResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  data: DrawerData | null;
  roadmapSkillId?: number | null;
  onStatusChange?: (roadmapSkillId: number, statusId: number | null) => void;
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

const ROADMAP_URL_PREFIX = '@roadmap:';

const getRoadmapTitleFromResourceUrl = (url?: string | null) => {
  const trimmedUrl = url?.trim() || '';

  if (!trimmedUrl.toLowerCase().startsWith(ROADMAP_URL_PREFIX)) {
    return null;
  }

  const cleanTitle = trimmedUrl
    .slice(ROADMAP_URL_PREFIX.length)
    .trim()
    .toLowerCase();

  return cleanTitle || null;
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
  roadmapSkillId,
  onStatusChange 
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStatusId = data?.statusId || null;

  const handleStatusChange = async (statusId: number) => {
    if (!roadmapSkillId) return;

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/progress/skills/${roadmapSkillId}`, { statusId });
      console.log(`🛑 Status changed to ${statusId} for roadmap skill ${roadmapSkillId}`);
      onStatusChange?.(roadmapSkillId, statusId);
    } catch (error: any) {
      console.error("🛑 API Error:", error);
      alert(error.response?.data?.message || "Lỗi khi cập nhật trạng thái!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!roadmapSkillId) return;

    setIsSubmitting(true);
    try {
      await apiClient.delete(`/progress/skills/${roadmapSkillId}`);
      console.log(`🛑 Status reset for roadmap skill ${roadmapSkillId}`);
      onStatusChange?.(roadmapSkillId, null);
    } catch (error: any) {
      console.error("🛑 API Error:", error);
      alert(error.response?.data?.message || "Lỗi khi reset trạng thái!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResourceClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    resource: Resource,
  ) => {
    const cleanTitle = getRoadmapTitleFromResourceUrl(resource.url);

    if (!resource.url) {
      event.preventDefault();
      return;
    }

    if (!cleanTitle) {
      return;
    }

    event.preventDefault();
    navigate(`/roadmaps/${encodeURIComponent(cleanTitle)}`);
    onClose();
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
        <div className="flex flex-col border-b-4 border-black bg-[#131b2e]">
          {/* Main Header Top */}
          <div className="flex items-start justify-between gap-3 px-5 py-4">
            <h2 className="flex-1 min-w-0 text-lg font-black text-white tracking-tight leading-snug break-words capitalize">
              {isLoading ? <Skeleton className="h-7 w-48 bg-[#171f33]" /> : data?.title}
            </h2>
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="flex-shrink-0 text-[#bcc9cd] hover:text-white hover:bg-black/20 font-black text-lg h-9 w-9 p-0 flex items-center justify-center rounded-sm border-2 border-transparent hover:border-black transition-all"
              aria-label="Close drawer"
            >
              ✕
            </Button>
          </div>

          {/* Brutalist Controller Section */}
          {data && roadmapSkillId && (
            <div className="px-5 pb-5 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Select Status Dropdown - Glass Style */}
              <div className="relative flex-1 group">
                <select
                  value={currentStatusId || ''}
                  onChange={(e) => handleStatusChange(Number(e.target.value))}
                  disabled={isSubmitting}
                  className={`w-full appearance-none bg-black/20 backdrop-blur-md border border-white/10 px-4 py-2.5 font-bold text-white text-xs uppercase tracking-wider shadow-lg focus:outline-none transition-all cursor-pointer disabled:opacity-80 ${isSubmitting ? 'border-cyan-500/50' : ''}`}
                >
                  <option value="" disabled className="bg-[#131b2e]">
                    {isSubmitting 
                      ? 'Saving Status...' 
                      : currentStatusId === 1 ? 'Current: COMPLETED'
                      : currentStatusId === 2 ? 'Current: IN PROGRESS'
                      : currentStatusId === 3 ? 'Current: SKIPPED'
                      : 'Update Status'}
                  </option>
                  <option value="1" className="bg-[#131b2e] font-bold text-cyan-400">Completed</option>
                  <option value="2" className="bg-[#131b2e] font-bold text-amber-500">In Progress</option>
                  <option value="3" className="bg-[#131b2e] font-bold text-slate-400">Skipped</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-white/20 pl-2">
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/70 stroke-[3]" />
                  )}
                </div>
              </div>

              {/* Reset Button - Red Glass Style */}
              <button
                onClick={handleReset}
                disabled={isSubmitting || !currentStatusId}
                title="Reset progress"
                className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 flex items-center justify-center shadow-lg transition-all duration-500 hover:bg-red-500/20 hover:rotate-180 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group"
              >
                <RotateCcw className={`w-5 h-5 stroke-[3] ${isSubmitting ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
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
                  {data.resources.map((res) => {
                    const cleanRoadmapTitle = getRoadmapTitleFromResourceUrl(res.url);
                    const href = cleanRoadmapTitle
                      ? `/roadmaps/${encodeURIComponent(cleanRoadmapTitle)}`
                      : res.url || '#';

                    return (
                    <a 
                      key={res.id} 
                      href={href}
                      target={cleanRoadmapTitle || !res.url ? undefined : '_blank'}
                      rel={cleanRoadmapTitle || !res.url ? undefined : 'noopener noreferrer'}
                      onClick={(event) => handleResourceClick(event, res)}
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
                    );
                  })}
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
        
      </div>
    </>
  );
};
