import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Code,
  Database,
  Brain,
  Shield,
  Smartphone,
  Cloud,
  ArrowRight,
  Zap,
  Users,
  Star,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import apiClient from '@/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────
interface CareerPath {
  id: string
  title: string
  description?: string
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const PATH_ICONS = [Code, Database, Brain, Shield, Smartphone, Cloud]

// ─── Mock descriptions (fallback when API doesn't return one) ─────────────────
const MOCK_DESCRIPTIONS = [
  'Master modern frameworks, APIs, and system design to build scalable applications.',
  'Design and optimize databases, handle big data, and architect robust data pipelines.',
  'Dive into ML models, neural networks, and deploy AI solutions at production scale.',
  'Protect systems, conduct penetration testing, and build secure infrastructures.',
  'Build native and cross-platform apps with cutting-edge mobile technologies.',
  'Deploy, scale, and manage cloud infrastructure with DevOps best practices.',
]

// ─── Skeleton Card ────────────────────────────────────────────────────────────
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

// ─── Path Card ────────────────────────────────────────────────────────────────
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
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center
                   bg-[#0d1829] border border-[#1F2937] group-hover:border-[#00BDD6]/40
                   transition-colors duration-300"
      >
        <Icon className="w-6 h-6 text-[#00E5FF]" />
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-lg leading-snug">{path.title}</h3>

      {/* Description */}
      <p className="text-[#94A3B8] text-sm leading-relaxed flex-1">{description}</p>

      {/* CTA */}
      <button
        id={`start-learning-${path.id}`}
        onClick={() => onSelect(path.id)}
        disabled={loading}
        className="flex items-center gap-1 text-[#00BDD6] text-sm font-medium
                  hover:text-[#00E5FF] transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed w-fit group/btn"
      >
        Start Learning
        <ChevronRight
          className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
        />
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const CareerPathPage = () => {
  const navigate = useNavigate()
  const [paths, setPaths] = useState<CareerPath[]>([])
  const [fetching, setFetching] = useState(true)
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Fetch career paths
  useEffect(() => {
    let cancelled = false;

    apiClient
      // Tạm dùng any[] để hứng dữ liệu gốc từ Backend trả về
      .get<any[]>('/career-paths')
      .then((res) => {
        if (!cancelled) {
          // Log ra để kiểm tra nếu cần
          console.log('🎯 Dữ liệu Career Paths:', res.data);

          // Data Mapping: Đổi tên trường cho khớp với Interface của giao diện
          const mappedPaths = res.data.map((item) => ({
            id: String(item.id), // Đổi số thành chuỗi
            title: item.name,    // Đổi 'name' thành 'title'
          }));

          // Nạp dữ liệu đã xử lý vào State
          setPaths(mappedPaths);
        }
      })
      .catch((err) => {
        console.error('❌ Lỗi khi tải danh sách Career Paths:', err);
        // Giữ nguyên logic cũ: UI sẽ hiển thị 0 cards một cách gọn gàng
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Select roadmap
  const handleSelect = async (careerPathId: string) => {
    setSelectingId(careerPathId)
    try {
      await apiClient.post('/users/select-roadmap', { careerPathId })
      navigate('/roadmap')
    } catch {
      setSelectingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#090E1A] text-white overflow-x-hidden">

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-[#090E1A]/80 backdrop-blur-md border-b border-[#1F2937]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <span className="text-xl font-bold tracking-tight">
            Dev<span className="text-[#00E5FF]">Path</span>
          </span>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-[#94A3B8]">
            {['Features', 'Roadmaps', 'Community'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Auth actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm text-[#94A3B8] hover:text-white transition-colors px-3 py-1.5">
              Log In
            </button>
            <Button
              className="bg-[#00BDD6] hover:bg-[#00BDD6]/90 text-[#090E1A] font-semibold text-sm
                         shadow-[0_0_15px_rgba(0,189,214,0.3)] hover:shadow-[0_0_20px_rgba(0,189,214,0.5)]
                         transition-all duration-300"
              size="sm"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#94A3B8] hover:text-white"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#1F2937] px-4 py-4 flex flex-col gap-3 bg-[#090E1A]">
            {['Features', 'Roadmaps', 'Community'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-[#94A3B8] hover:text-white text-sm py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}
            <hr className="border-[#1F2937]" />
            <button className="text-sm text-[#94A3B8] hover:text-white text-left py-1">Log In</button>
            <Button
              className="bg-[#00BDD6] text-[#090E1A] font-semibold w-full"
              size="sm"
            >
              Sign Up
            </Button>
          </div>
        )}
      </nav>

      {/* Quick link: View all career paths (navigates to ExploreRoadmapsPage) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex justify-end">
          <Button
            variant="link"
            className="text-[#94A3B8] hover:text-[#00E5FF]"
            onClick={() => navigate('/explore-roadmaps')}
          >
            View all career-paths
          </Button>
        </div>
      </div>

      {/* ══ HERO SECTION ════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left column — copy */}
          <div className="flex flex-col gap-7">
            {/* Badge */}
            <div className="flex">
              <span className="inline-flex items-center gap-2 text-xs text-[#00BDD6] font-medium
                               border border-[#00BDD6]/30 bg-[#00BDD6]/10 rounded-full px-3 py-1.5">
                <Zap className="w-3.5 h-3.5" />
                AI-Powered Career Roadmaps
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Discover Your{' '}
              <span
                className="text-[#00E5FF]"
                style={{ textShadow: '0 0 30px rgba(0,229,255,0.4)' }}
              >
                Learning Path
              </span>
              {' '}in Tech
            </h1>

            {/* Subtitle */}
            <p className="text-[#94A3B8] text-lg leading-relaxed max-w-lg">
              Navigate the tech landscape with personalized, structured roadmaps.
              Go from zero to job-ready with skills that employers actually want.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <a href="#roadmaps">
                <Button
                  id="explore-roadmaps-btn"
                  className="bg-[#00BDD6] hover:bg-[#00BDD6]/90 text-[#090E1A] font-bold
                             px-7 h-12 text-base rounded-lg
                             shadow-[0_0_15px_rgba(0,189,214,0.4)] hover:shadow-[0_0_25px_rgba(0,189,214,0.6)]
                             transition-all duration-300"
                >
                  Explore Roadmaps
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
              <Button
                id="how-it-works-btn"
                variant="outline"
                className="border-[#1F2937] bg-transparent text-white hover:bg-[#111726]
                           hover:border-[#00BDD6]/40 h-12 px-7 text-base rounded-lg
                           transition-all duration-300"
              >
                How it works
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#090E1A] flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `hsl(${180 + i * 30}, 70%, 40%)`,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#94A3B8]">
                Joined by <span className="text-white font-semibold">200k+</span> developers
              </p>
            </div>
          </div>

          {/* Right column — abstract tech illustration */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Outer glow container */}
            <div
              className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden
                         bg-gradient-to-br from-[#0d1829] via-[#111726] to-[#0a1020]
                         border border-[#1F2937]"
              style={{ boxShadow: '0 0 60px rgba(0,229,255,0.08), inset 0 0 60px rgba(0,189,214,0.04)' }}
            >
              {/* Grid lines */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,229,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.15) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Glowing orb center */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(0,229,255,0.25) 0%, transparent 70%)',
                  boxShadow: '0 0 60px rgba(0,229,255,0.3)',
                }}
              />

              {/* Node rings */}
              {[120, 180, 240].map((size, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{
                    width: size,
                    height: size,
                    borderColor: `rgba(0, ${189 + i * 10}, ${214 - i * 5}, ${0.25 - i * 0.06})`,
                    animation: `spin ${8 + i * 4}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
                  }}
                >
                  {/* Dot on ring */}
                  <div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#00E5FF]"
                    style={{ boxShadow: '0 0 8px rgba(0,229,255,0.8)' }}
                  />
                </div>
              ))}

              {/* Floating UI chips */}
              {[
                { label: 'React', top: '12%', left: '10%' },
                { label: 'Node.js', top: '20%', right: '8%' },
                { label: 'TypeScript', bottom: '22%', left: '6%' },
                { label: 'Python', bottom: '14%', right: '10%' },
              ].map(({ label, ...pos }) => (
                <div
                  key={label}
                  className="absolute text-xs font-mono text-[#00E5FF]/80 bg-[#090E1A]/60
                             border border-[#00E5FF]/20 rounded-md px-2.5 py-1 backdrop-blur-sm"
                  style={pos as React.CSSProperties}
                >
                  {label}
                </div>
              ))}

              {/* Center label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <span className="text-[#00E5FF] font-bold text-sm tracking-widest uppercase opacity-80">
                  Your Path
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS SECTION ═══════════════════════════════════════════════════ */}
      <section className="border-y border-[#1F2937]/60 bg-[#0d1829]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { value: '200k+', label: 'DEVELOPERS' },
              { value: '50+',   label: 'CAREER PATHS' },
              { value: '1M+',   label: 'SKILLS MASTERED' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span
                  className="text-4xl font-extrabold text-[#00E5FF]"
                  style={{ textShadow: '0 0 20px rgba(0,229,255,0.3)' }}
                >
                  {value}
                </span>
                <span className="text-xs font-semibold tracking-[0.2em] text-[#94A3B8]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POPULAR LEARNING PATHS ══════════════════════════════════════════ */}
      <section id="roadmaps" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-[#00BDD6] text-sm font-semibold tracking-widest uppercase mb-3">
            Curated For You
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Popular Learning Paths
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto">
            Choose a path that aligns with your goals. Each roadmap is structured by industry
            experts and updated regularly.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fetching
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : paths.length > 0
              ? paths.map((path, i) => (
                  <PathCard
                    key={path.id}
                    path={path}
                    index={i}
                    onSelect={handleSelect}
                    loading={selectingId === path.id}
                  />
                ))
              : (
                  /* Empty state */
                  <div className="col-span-3 text-center py-16 text-[#94A3B8]">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No career paths available yet. Check back soon!</p>
                  </div>
                )}
        </div>

        {/* View All Paths Button */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate('/explore-roadmaps')}
            variant="outline"
            className="border-[#00BDD6]/50 bg-[#0d1829]/50 text-[#00BDD6] hover:bg-[#00BDD6]/10 hover:border-[#00BDD6] hover:text-[#00E5FF] px-8 h-12 text-base rounded-full transition-all duration-300"
          >
            View All Career Paths
          </Button>
        </div>
      </section>

      {/* ══ BOTTOM CTA ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div
          className="relative rounded-2xl overflow-hidden p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, #0d1829 0%, #111726 50%, #0a1535 100%)',
            boxShadow: '0 0 80px rgba(0,189,214,0.08)',
          }}
        >
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,229,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.2) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Glow orbs */}
          <div
            className="absolute top-0 left-1/4 w-64 h-64 rounded-full -translate-y-1/2"
            style={{ background: 'radial-gradient(circle, rgba(0,189,214,0.15) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full translate-y-1/2"
            style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)' }}
          />
          {/* Border glow */}
          <div className="absolute inset-0 rounded-2xl border border-[#00BDD6]/20" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 text-[#00BDD6] text-sm font-medium">
              <Star className="w-4 h-4 fill-[#00BDD6]" />
              Free to get started — no credit card required
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-2xl">
              Ready to Architect{' '}
              <span className="text-[#00E5FF]">Your Career?</span>
            </h2>
            <p className="text-[#94A3B8] max-w-md text-lg">
              Join 200,000+ developers who are building their future with structured, expert-curated roadmaps.
            </p>
            <Button
              id="create-profile-btn"
              className="bg-[#00BDD6] hover:bg-[#00BDD6]/90 text-[#090E1A] font-bold
                         px-10 h-14 text-base rounded-xl mt-2
                         shadow-[0_0_20px_rgba(0,189,214,0.5)] hover:shadow-[0_0_35px_rgba(0,189,214,0.7)]
                         transition-all duration-300 flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Create Your Free Profile
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#1F2937]/60 bg-[#090E1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <span className="text-lg font-bold tracking-tight">
              Dev<span className="text-[#00E5FF]">Path</span>
            </span>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-[#94A3B8]">
              {['Privacy', 'Terms', 'Blog', 'Contact'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-[#94A3B8]">
              © {new Date().getFullYear()} DevPath. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ══ KEYFRAME for ring spin ════════════════════════════════════════ */}
      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
