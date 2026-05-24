import React, { useState } from 'react';
import { Sparkles, AlertCircle, Briefcase, Clock, ChevronRight, Loader2, X, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export interface JobAnalysisResult {
  seniority: 'Intern' | 'Fresher' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | string;
  must_have: string[];
  nice_to_have: string[];
  experience_years: string | number;
  ai_advice: string;
  roadmapPath?: string | string[];
}

interface AIJobAnalystWidgetProps {
  jobId: number;
  onAnalyze?: (jobId: number) => Promise<JobAnalysisResult>;
}

export const AIJobAnalystWidget: React.FC<AIJobAnalystWidgetProps> = ({ jobId, onAnalyze }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onAnalyze) return;
    
    setStatus('loading');
    setErrorMsg(null);
    
    try {
      const result = await onAnalyze(jobId);
      setAnalysisResult(result);
      setStatus('success');
      setIsDrawerOpen(true);
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Đã có lỗi xảy ra khi phân tích JD. Vui lòng thử lại.');
    }
  };

  const getRoadmapLinks = (pathData?: string | string[]) => {
    if (!pathData) return [];
    try {
      let paths: string[] = [];
      if (typeof pathData === 'string') {
        const parsed = JSON.parse(pathData);
        paths = Array.isArray(parsed) ? parsed : [pathData];
      } else if (Array.isArray(pathData)) {
        paths = pathData;
      }
      
      return paths.map(path => {
        let slug = path;
        if (path.startsWith('@roadmap:')) {
          const type = path.split(':')[1];
          const map: Record<string, {slug: string, title: string}> = {
            frontend: { slug: '1', title: 'Frontend Developer' },
            backend: { slug: 'Backend', title: 'Backend Developer' },
            devops: { slug: '3', title: 'DevOps Engineer' }
          };
          const matched = map[type.toLowerCase()];
          if (matched) {
            return { link: `/roadmaps/${matched.slug}`, title: matched.title };
          }
          slug = type;
        }
        return { link: `/roadmaps/${slug}`, title: path };
      });
    } catch (e) {
       if (typeof pathData === 'string') {
         return [{ link: pathData, title: pathData }];
       }
       return [];
    }
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#0f1117] shadow-sm font-sans p-0 gap-0">
        {/* Header section */}
        <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              AI Job Analyst
            </CardTitle>
          </div>
          
          <Button
            type="button"
            onClick={status === 'success' ? () => setIsDrawerOpen(true) : handleAnalyze}
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {status === 'success' ? 'Xem lại phân tích' : (status === 'loading' ? 'Đang phân tích...' : 'Phân tích JD bằng AI')}
          </Button>
        </CardHeader>

        <CardContent className="p-5">
          {/* State: Idle */}
          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500 dark:text-gray-400">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm">Click vào nút bên trên để AI trích xuất yêu cầu và đưa ra lời khuyên.</p>
            </div>
          )}

          {/* State: Loading */}
          {status === 'loading' && (
            <div className="space-y-6 py-2 animate-pulse" data-testid="loading-state">
              <div className="flex gap-4 mb-6">
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/6"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-32"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/6"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-28"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-24"></div>
                </div>
              </div>
              
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg w-full mt-6"></div>
            </div>
          )}

          {/* State: Error */}
          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 text-red-700 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/20">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Phân tích thất bại</p>
                <p className="opacity-90">{errorMsg}</p>
              </div>
              <Button 
                type="button"
                variant="link"
                onClick={handleAnalyze}
                className="ml-auto text-sm font-medium underline hover:no-underline p-0 h-auto text-red-700 dark:text-red-400"
              >
                Thử lại
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer Content */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-1/3 bg-white dark:bg-[#0f1117] shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {analysisResult && (
          <div className="h-full flex flex-col font-sans">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0f1117] z-10">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Kết quả phân tích JD
              </h2>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors w-9 h-9 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {/* Phần 1: Kết quả AI */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge 
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold text-sm"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>{analysisResult.seniority}</span>
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-semibold text-sm"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{analysisResult.experience_years} năm KN</span>
                  </Badge>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    <ChevronRight className="w-4 h-4 text-red-500" />
                    Must-have Skills
                  </h4>
                  {analysisResult.must_have.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.must_have.map((skill, index) => (
                        <Badge 
                          key={`must-${index}`} 
                          variant="destructive"
                          className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30 rounded-md shadow-sm hover:bg-red-100 dark:hover:bg-red-500/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Không tìm thấy</p>
                  )}
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    Nice-to-have Skills
                  </h4>
                  {analysisResult.nice_to_have.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.nice_to_have.map((skill, index) => (
                        <Badge 
                          key={`nice-${index}`} 
                          variant="secondary"
                          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Không yêu cầu thêm</p>
                  )}
                </div>

                <Card className="p-4 py-4 gap-0 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 shadow-sm text-card-foreground">
                  <CardContent className="p-0 flex gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-2">
                        AI Khuyên Bạn
                      </h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed whitespace-pre-wrap">
                        {analysisResult.ai_advice}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Phần 2: Lộ trình đề xuất */}
              {analysisResult.roadmapPath && getRoadmapLinks(analysisResult.roadmapPath).length > 0 && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
                    Lộ trình đề xuất
                  </h3>
                  <div className="space-y-3">
                    {getRoadmapLinks(analysisResult.roadmapPath).map((item, idx) => (
                      <Link 
                        key={idx}
                        to={item.link}
                        className="flex items-center justify-between p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group"
                      >
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                          {item.title}
                        </span>
                        <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AIJobAnalystWidget;
