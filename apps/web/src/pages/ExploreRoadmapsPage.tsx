import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Code,
  Database,
  Brain,
  Shield,
  Smartphone,
  Cloud,
  Search,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import apiClient from '@/lib/axios'

interface CareerPath {
  id: string
  title: string
  description?: string
}

const PATH_ICONS = [Code, Database, Brain, Shield, Smartphone, Cloud]

const MOCK_DESCRIPTIONS = [
  'Master modern frameworks, APIs, and system design to build scalable applications.',
  'Design and optimize databases, handle big data, and architect robust data pipelines.',
  'Dive into ML models, neural networks, and deploy AI solutions at production scale.',
  'Protect systems, conduct penetration testing, and build secure infrastructures.',
  'Build native and cross-platform apps with cutting-edge mobile technologies.',
  'Deploy, scale, and manage cloud infrastructure with DevOps best practices.',
]

function SkeletonCard() {
  return (
    <div className="rounded-xl p-6 bg-[#111726] border border-[#1F2937]">
      <Skeleton className="h-10 w-10 rounded-lg mb-4 bg-[#1F2937]" />
      <Skeleton className="h-5 w-3/4 mb-3 bg-[#1F2937]" />
      <Skeleton className="h-4 w-full mb-2 bg-[#1F2937]" />
      <Skeleton className="h-4 w-5/6 mb-6 bg-[#1F2937]" />
      <Skeleton className="h-4 w-1/3 bg-[#1F2937]" />
    </div>
  )
}

function PathCard({
  path,
  index,
  onSelect,
  loading,
}: {
  path: CareerPath
  index: number
  onSelect: (id: string) => void
  loading: boolean
}) {
  const Icon = PATH_ICONS[index % PATH_ICONS.length]
  const description = path.description ?? MOCK_DESCRIPTIONS[index % MOCK_DESCRIPTIONS.length]

  return (
    <div
      className="group rounded-xl p-6 bg-[#111726] border border-transparent hover:border-[#00BDD6]/30
                 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,189,214,0.08)]
                 hover:-translate-y-1 flex flex-col gap-4"
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center
                   bg-[#0d1829] border border-[#1F2937] group-hover:border-[#00BDD6]/40
                   transition-colors duration-300"
      >
        <Icon className="w-6 h-6 text-[#00E5FF]" />
      </div>

      <h3 className="text-white font-semibold text-lg leading-snug">{path.title}</h3>
      <p className="text-[#94A3B8] text-sm leading-relaxed flex-1">{description}</p>

      <button
        onClick={() => onSelect(path.id)}
        disabled={loading}
        className="flex items-center gap-1 text-[#00BDD6] text-sm font-medium
                   hover:text-[#00E5FF] transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed w-fit group/btn"
      >
        {loading ? 'Enrolling...' : 'Enroll Now'}
        <ChevronRight
          className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
        />
      </button>
    </div>
  )
}

export const ExploreRoadmapsPage = () => {
  const navigate = useNavigate()
  const [paths, setPaths] = useState<CareerPath[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [fetching, setFetching] = useState(true)
  const [selectingId, setSelectingId] = useState<string | null>(null)

 useEffect(() => {
    let cancelled = false
    
    // 1. Gọi đúng endpoint từ Controller của bạn: '/career-paths'
    apiClient
      // Tạm để any[] hoặc tạo interface riêng cho dữ liệu BE trả về
      .get<any[]>('/career-paths') 
      .then((res) => {
        if (!cancelled) {
          console.log('📦 Dữ liệu gốc từ Backend:', res.data); 

          // 2. "Biến hình" dữ liệu BE cho khớp với giao diện FE
          const mappedPaths: CareerPath[] = res.data.map((item) => ({
            id: String(item.id), // BE trả số (number), FE cần chuỗi (string)
            title: item.name,    // BE trả 'name', FE cần 'title'
            // description: Nếu BE không có, giao diện sẽ tự lấy từ MOCK_DESCRIPTIONS
          }));

          setPaths(mappedPaths);
        }
      })
      .catch((err) => {
        console.error('❌ Lỗi khi gọi API /career-paths:', err);
      })
      .finally(() => {
        if (!cancelled) setFetching(false)
      })
      
    return () => {
      cancelled = true
    }
  }, [])

  const handleSelect = async (careerPathId: string) => {
    setSelectingId(careerPathId)
    try {
      await apiClient.post('/users/select-roadmap', { careerPathId })
      navigate('/roadmap')
    } catch {
      setSelectingId(null)
    }
  }

  const filteredPaths = paths.filter((p) => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#090E1A] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#1F2937]/60 pb-8">
          <div>
            <Button 
              variant="link" 
              onClick={() => navigate('/')} 
              className="px-0 text-[#94A3B8] hover:text-[#00E5FF] mb-2 h-auto"
            >
              &larr; Back to Home
            </Button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              Explore All <span className="text-[#00E5FF]">Career Paths</span>
            </h1>
            <p className="mt-4 text-[#94A3B8] text-lg max-w-2xl">
              Browse through our complete collection of career roadmaps. Filter by keyword to find the exact path that fits your goals.
            </p>
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <Input
              type="text"
              placeholder="Search roadmaps..."
              className="pl-10 bg-[#111726] border-[#1F2937] text-white focus-visible:ring-[#00BDD6]/50 rounded-lg h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fetching ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredPaths.length > 0 ? (
            filteredPaths.map((path, i) => (
              <PathCard
                key={path.id}
                path={path}
                index={i}
                onSelect={handleSelect}
                loading={selectingId === path.id}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-[#94A3B8]">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">No roadmaps found</p>
              <p className="text-sm">We couldn't find any career paths matching "{searchQuery}".</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="mt-6 border-[#1F2937] text-white hover:bg-[#111726]"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
