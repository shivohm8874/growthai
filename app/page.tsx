'use client'

import { useState, useEffect, useRef } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

// Types
interface FormData {
  // Business Info
  businessName: string
  businessCategory: string
  businessSize: string
  businessLocation: string
  businessDescription: string
  // Goals
  selectedGoals: string[]
  competitionLevel: string
  monthlyBudget: number
  // Website
  hasWebsite: boolean | null
  websiteUrl: string
  websiteFeatures: string[]
  // Hosting
  hostingType: string
  hostingProvider: string
  hostingUsername: string
  hostingPassword: string
  cmsType: string
  // Integrations
  integrations: {
    googleSearchConsole: { enabled: boolean; username: string; password: string }
    googleAnalytics: { enabled: boolean; username: string; password: string; trackingId: string }
    gmb: { enabled: boolean; email: string; password: string }
    facebook: { enabled: boolean; email: string; password: string }
    instagram: { enabled: boolean; username: string; password: string }
    twitter: { enabled: boolean; email: string; password: string }
    linkedin: { enabled: boolean; email: string; password: string }
    emailMarketing: { enabled: boolean; provider: string; apiKey: string }
  }
}

interface Activity {
  id: string
  module: string
  action: string
  status: 'running' | 'success' | 'warning' | 'error'
  timestamp: number
  details?: string
}

interface Keyword {
  term: string
  position: number
  change: number
  volume: string
  difficulty: string
  status: 'improving' | 'declining' | 'stable'
}

interface Backlink {
  domain: string
  url: string
  da: number
  status: 'new' | 'lost' | 'active'
  type: 'dofollow' | 'nofollow'
}

interface SitePage {
  url: string
  title: string
  issues: number
  score: number
  lastCrawled: string
}

interface SocialPost {
  platform: string
  content: string
  scheduled: string
  status: 'queued' | 'posting' | 'posted' | 'failed'
}

interface GMBUpdate {
  type: string
  content: string
  status: 'pending' | 'syncing' | 'synced'
}

const initialFormData: FormData = {
  businessName: '',
  businessCategory: '',
  businessSize: '',
  businessLocation: '',
  businessDescription: '',
  selectedGoals: [],
  competitionLevel: '',
  monthlyBudget: 1000,
  hasWebsite: null,
  websiteUrl: '',
  websiteFeatures: [],
  hostingType: '',
  hostingProvider: '',
  hostingUsername: '',
  hostingPassword: '',
  cmsType: '',
  integrations: {
    googleSearchConsole: { enabled: false, username: '', password: '' },
    googleAnalytics: { enabled: false, username: '', password: '', trackingId: '' },
    gmb: { enabled: false, email: '', password: '' },
    facebook: { enabled: false, email: '', password: '' },
    instagram: { enabled: false, username: '', password: '' },
    twitter: { enabled: false, email: '', password: '' },
    linkedin: { enabled: false, email: '', password: '' },
    emailMarketing: { enabled: false, provider: '', apiKey: '' },
  },
}

const onboardingSteps = [
  { id: 'businessName', label: 'Business Name' },
  { id: 'businessCategory', label: 'Business Category' },
  { id: 'businessSize', label: 'Business Size' },
  { id: 'businessLocation', label: 'Business Location' },
  { id: 'businessDescription', label: 'Business Description' },
  { id: 'selectedGoals', label: 'Growth Goals' },
  { id: 'competitionLevel', label: 'Competition Level' },
  { id: 'hasWebsite', label: 'Existing Website' },
  { id: 'websiteUrl', label: 'Website URL' },
  { id: 'cmsType', label: 'Website Platform' },
  { id: 'hostingType', label: 'Hosting Type' },
  { id: 'hostingProvider', label: 'Hosting Provider' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'review', label: 'Review & Confirm' },
] as const

type OnboardingStepId = (typeof onboardingSteps)[number]['id']

const goals = [
  { id: 'customers', icon: 'mdi:account-group', title: 'Increase Customers', description: 'Attract more customers to your business' },
  { id: 'revenue', icon: 'mdi:currency-usd', title: 'Boost Revenue', description: 'Increase sales and profitability' },
  { id: 'seo', icon: 'mdi:magnify', title: 'Improve SEO', description: 'Rank higher in search results' },
  { id: 'social', icon: 'mdi:share-variant', title: 'Social Growth', description: 'Expand social media presence' },
  { id: 'brand', icon: 'mdi:star', title: 'Brand Awareness', description: 'Increase brand recognition' },
  { id: 'expansion', icon: 'mdi:chart-line', title: 'Market Expansion', description: 'Reach new markets or regions' },
]

const integrationList = [
  { id: 'googleSearchConsole', name: 'Google Search Console', icon: 'mdi:google', color: 'text-blue-400', description: 'SEO performance & keyword tracking' },
  { id: 'googleAnalytics', name: 'Google Analytics', icon: 'mdi:google-analytics', color: 'text-orange-400', description: 'Website traffic analysis' },
  { id: 'gmb', name: 'Google Business Profile', icon: 'mdi:google-maps', color: 'text-green-400', description: 'Local business visibility' },
  { id: 'facebook', name: 'Facebook Business', icon: 'mdi:facebook', color: 'text-blue-500', description: 'Social media marketing' },
  { id: 'instagram', name: 'Instagram', icon: 'mdi:instagram', color: 'text-pink-400', description: 'Visual content marketing' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'mdi:twitter', color: 'text-gray-300', description: 'Real-time engagement' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'mdi:linkedin', color: 'text-blue-600', description: 'B2B networking' },
  { id: 'emailMarketing', name: 'Email Marketing', icon: 'mdi:email-newsletter', color: 'text-purple-400', description: 'Mailchimp, SendGrid, etc.' },
]

const keywordSeed: Keyword[] = [
  { term: 'best coffee shop near me', position: 3, change: 2, volume: '12.3K', difficulty: 'medium', status: 'improving' },
  { term: 'artisanal coffee downtown', position: 1, change: 0, volume: '2.4K', difficulty: 'low', status: 'stable' },
  { term: 'organic coffee beans', position: 7, change: -2, volume: '8.1K', difficulty: 'high', status: 'declining' },
  { term: 'specialty espresso drinks', position: 2, change: 3, volume: '4.2K', difficulty: 'medium', status: 'improving' },
  { term: 'local coffee roasters', position: 4, change: 1, volume: '3.8K', difficulty: 'low', status: 'improving' },
  { term: 'breakfast cafe menu', position: 5, change: -1, volume: '6.5K', difficulty: 'medium', status: 'declining' },
  { term: 'coffee subscription service', position: 12, change: 4, volume: '1.9K', difficulty: 'high', status: 'improving' },
  { term: 'pour over coffee guide', position: 8, change: 0, volume: '5.1K', difficulty: 'medium', status: 'stable' },
]

const moduleSeed = [
  { name: 'SEO Crawler', icon: 'mdi:spider-web', color: 'cyan', active: true },
  { name: 'Rank Tracker', icon: 'mdi:chart-line-variant', color: 'green', active: true },
  { name: 'Backlink Monitor', icon: 'mdi:link-variant', color: 'blue', active: true },
  { name: 'Content Optimizer', icon: 'mdi:file-document-edit', color: 'purple', active: true },
  { name: 'Social Scheduler', icon: 'mdi:share-variant', color: 'pink', active: true },
  { name: 'GMB Manager', icon: 'mdi:google-maps', color: 'red', active: true },
  { name: 'Competitor Watch', icon: 'mdi:account-search', color: 'orange', active: true },
  { name: 'Email Automator', icon: 'mdi:email-fast', color: 'yellow', active: true },
] as const

const activityTemplates = {
  seo: [
    { action: 'Crawling page', details: '/products/organic-coffee-blend' },
    { action: 'Analyzing meta tags', details: '15 pages processed' },
    { action: 'Checking canonical URLs', details: '3 duplicates found' },
  ],
  rank: [
    { action: 'Checking SERP position', details: 'best coffee shop near me → #3' },
    { action: 'Tracking keyword movement', details: '+2 positions gained' },
    { action: 'Analyzing SERP features', details: 'Featured snippet detected' },
  ],
  backlink: [
    { action: 'Discovering new backlinks', details: '23 new links found' },
    { action: 'Analyzing link quality', details: 'DA distribution calculated' },
    { action: 'Checking anchor text', details: 'Diversity score: 78%' },
  ],
  content: [
    { action: 'Generating content brief', details: 'Topic: coffee brewing guide' },
    { action: 'Analyzing content gaps', details: '12 opportunities found' },
    { action: 'Optimizing keyword density', details: 'Target: 1.5-2%' },
  ],
  social: [
    { action: 'Scheduling post', details: 'Facebook - 2:30 PM EST' },
    { action: 'Optimizing hashtags', details: '25 hashtags generated' },
    { action: 'Cross-posting content', details: 'Instagram → Facebook' },
  ],
  gmb: [
    { action: 'Syncing business hours', details: 'Holiday hours updated' },
    { action: 'Uploading photos', details: '8 new photos added' },
    { action: 'Responding to reviews', details: '5 responses sent' },
  ],
  competitor: [
    { action: 'Scanning competitor site', details: 'competitor-a.com analyzed' },
    { action: 'Tracking keyword gaps', details: '8 keyword opportunities' },
    { action: 'Analyzing backlink gap', details: '45 linking domains missed' },
  ],
  email: [
    { action: 'Processing campaign', details: 'Newsletter #47 sending' },
    { action: 'Segmenting audience', details: '1,234 contacts matched' },
    { action: 'A/B testing subject', details: 'Variant B winning +18%' },
  ],
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function getRandomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const operationalActions = {
  seo: [
    'Crawling sitemap.xml for page inventory.',
    'Checking canonical tags across indexed pages.',
    'Verifying robots.txt directives.',
    'Scanning meta descriptions for length compliance.',
    'Analyzing heading hierarchy on target pages.',
  ],
  content: [
    'Generating topic clusters for content planning.',
    'Analyzing competitor content structure.',
    'Identifying content gaps in current coverage.',
    'Processing keyword density calculations.',
    'Reviewing content freshness signals.',
  ],
  social: [
    'Scheduling social post for distribution.',
    'Analyzing optimal posting time windows.',
    'Processing hashtag relevance scoring.',
    'Reviewing engagement patterns on recent posts.',
    'Checking character limits for platform compliance.',
  ],
  gmb: [
    'Checking Google Business Profile status.',
    'Reviewing business hours accuracy.',
    'Processing business category optimization.',
    'Analyzing review response queue.',
    'Checking Q&A section for new inquiries.',
  ],
  monitoring: [
    'Monitoring server response times.',
    'Checking uptime status across monitored endpoints.',
    'Processing error log patterns.',
    'Analyzing traffic source distribution.',
    'Reviewing conversion path signals.',
  ],
  email: [
    'Processing email campaign queue.',
    'Checking deliverability signals.',
    'Analyzing open rate patterns.',
    'Reviewing subject line variations.',
    'Processing segment allocation.',
  ],
  technical: [
    'Running database optimization routine.',
    'Checking cache invalidation status.',
    'Processing scheduled task queue.',
    'Analyzing memory utilization patterns.',
    'Reviewing API rate limit status.',
  ],
  competitors: [
    'Scanning competitor content updates.',
    'Analyzing competitor keyword targeting.',
    'Reviewing competitor backlink acquisition.',
    'Checking competitor social activity.',
    'Processing competitor pricing signals.',
  ],
}

function getRandomAction(category: keyof typeof operationalActions) {
  const actions = operationalActions[category]
  return actions[Math.floor(Math.random() * actions.length)]
}

function generateSystemStatus() {
  return [
    { label: 'Crawl Queue', value: Math.floor(Math.random() * 50) + 10, unit: 'pages' },
    { label: 'Content Queue', value: Math.floor(Math.random() * 20) + 5, unit: 'items' },
    { label: 'Social Queue', value: Math.floor(Math.random() * 30) + 8, unit: 'posts' },
    { label: 'Monitor Alerts', value: Math.floor(Math.random() * 5), unit: 'active' },
    { label: 'Tasks Running', value: Math.floor(Math.random() * 8) + 2, unit: 'parallel' },
    { label: 'API Calls', value: Math.floor(Math.random() * 500) + 100, unit: '/hr' },
  ]
}

function generateActiveModules() {
  const modules = [
    { name: 'SEO Crawler', icon: 'mdi:spider-web' },
    { name: 'Content Engine', icon: 'mdi:file-document-edit' },
    { name: 'Social Scheduler', icon: 'mdi:share-variant' },
    { name: 'GMB Manager', icon: 'mdi:google-maps' },
    { name: 'Analytics Monitor', icon: 'mdi:chart-line' },
    { name: 'Email Automator', icon: 'mdi:email-fast' },
    { name: 'Competitor Watch', icon: 'mdi:account-search' },
    { name: 'Technical Auditor', icon: 'mdi:cog' },
  ]
  return modules.map(m => ({ ...m, lastActivity: Math.floor(Math.random() * 30) + 1 }))
}

function generateContextualAction(enabledIntegrations: string[]) {
  const categories: (keyof typeof operationalActions)[] = ['seo', 'content', 'monitoring', 'technical', 'competitors']
  if (enabledIntegrations.includes('gmb')) categories.push('gmb')
  if (enabledIntegrations.some(i => ['facebook', 'instagram', 'twitter', 'linkedin'].includes(i))) categories.push('social')
  if (enabledIntegrations.includes('emailMarketing')) categories.push('email')
  const category = categories[Math.floor(Math.random() * categories.length)]
  return { action: getRandomAction(category), category }
}

const focusMap: Record<string, string> = {
  seo: 'SEO Crawler',
  content: 'Content Engine',
  social: 'Social Scheduler',
  gmb: 'GMB Manager',
  monitoring: 'Analytics Monitor',
  email: 'Email Automator',
  technical: 'Technical Auditor',
  competitors: 'Competitor Watch',
}

function generateInitialLogs(enabledIntegrations: string[]): string[] {
  const logs: string[] = []
  for (let i = 0; i < 10; i++) {
    const { action } = generateContextualAction(enabledIntegrations)
    logs.push(action)
  }
  return logs
}

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [stepErrors, setStepErrors] = useState<string[]>([])
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const clearStepErrors = () => {
    setStepErrors(prev => (prev.length > 0 ? [] : prev))
  }

  // Analysis simulation
  useEffect(() => {
    if (showAnalysis) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [showAnalysis])

  useEffect(() => {
    if (showAnalysis && analysisProgress >= 100) {
      const timeout = setTimeout(() => {
        setShowAnalysis(false)
        setShowOnboarding(false)
        setShowDashboard(true)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [showAnalysis, analysisProgress])

  const updateFormData = (field: string, value: unknown) => {
    clearStepErrors()
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateIntegration = (integrationId: string, field: string, value: unknown) => {
    clearStepErrors()
    setFormData(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integrationId]: {
          ...prev.integrations[integrationId as keyof typeof prev.integrations],
          [field]: value,
        },
      },
    }))
  }

  const toggleGoal = (goalId: string) => {
    clearStepErrors()
    setFormData(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goalId)
        ? prev.selectedGoals.filter(g => g !== goalId)
        : [...prev.selectedGoals, goalId],
    }))
  }

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  const isStepVisible = (stepId: OnboardingStepId) => {
    if (stepId === 'websiteUrl') {
      return formData.hasWebsite === true
    }
    return true
  }

  const visibleSteps = onboardingSteps.filter((step) => isStepVisible(step.id))
  const totalSteps = visibleSteps.length
  const activeStep = visibleSteps[Math.min(currentStep - 1, totalSteps - 1)]
  const currentStepId = activeStep?.id
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  const validateStep = (stepId: OnboardingStepId | undefined) => {
    const errors: string[] = []

    if (stepId === 'businessName' && !formData.businessName.trim()) {
      errors.push('Business name is required.')
    }
    if (stepId === 'businessCategory' && !formData.businessCategory) {
      errors.push('Business category is required.')
    }
    if (stepId === 'businessSize' && !formData.businessSize) {
      errors.push('Business size is required.')
    }
    if (stepId === 'businessLocation' && !formData.businessLocation.trim()) {
      errors.push('Business location is required.')
    }
    if (stepId === 'businessDescription' && formData.businessDescription.trim().length < 20) {
      errors.push('Business description should be at least 20 characters.')
    }
    if (stepId === 'selectedGoals' && formData.selectedGoals.length === 0) {
      errors.push('Select at least one business goal.')
    }
    if (stepId === 'competitionLevel' && !formData.competitionLevel) {
      errors.push('Select your competition level.')
    }
    if (stepId === 'hasWebsite' && formData.hasWebsite === null) {
      errors.push('Choose whether you already have a website.')
    }
    if (stepId === 'websiteUrl' && formData.hasWebsite && !formData.websiteUrl.trim()) {
      errors.push('Website URL is required.')
    }
    if (stepId === 'websiteUrl' && formData.hasWebsite && formData.websiteUrl.trim() && !isValidUrl(formData.websiteUrl.trim())) {
      errors.push('Website URL must be a valid http(s) URL.')
    }
    if (stepId === 'cmsType' && !formData.cmsType) {
      errors.push('Website platform/CMS is required.')
    }
    if (stepId === 'hostingType' && !formData.hostingType) {
      errors.push('Hosting type is required.')
    }
    if (stepId === 'hostingProvider' && !formData.hostingProvider.trim()) {
      errors.push('Hosting provider is required.')
    }
    if (stepId === 'review' && !acceptedTerms) {
      errors.push('Please confirm the agreement before continuing.')
    }

    return errors
  }

  const goToStepIndex = (nextIndex: number) => {
    const bounded = Math.max(1, Math.min(nextIndex, totalSteps))
    setCurrentStep(bounded)
  }

  const nextStep = () => {
    const errors = validateStep(currentStepId)
    if (errors.length > 0) {
      setStepErrors(errors)
      return
    }

    setStepErrors([])
    if (currentStep < totalSteps) {
      goToStepIndex(currentStep + 1)
    } else {
      setAnalysisProgress(0)
      setShowDashboard(false)
      setShowAnalysis(true)
    }
  }

  const previousStep = () => {
    clearStepErrors()
    if (currentStep > 1) {
      goToStepIndex(currentStep - 1)
    }
  }

  // Landing Page Component
  const LandingPage = () => (
    <div className="bg-grid min-h-screen">
      <div className="scan-line" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#030305]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rotate-45 transform" />
            <span className="text-xl font-bold text-white tracking-widest tech-font">GROWTHAI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-xs tracking-widest uppercase text-gray-400">
            <a href="#systems" className="hover:text-white transition">Systems</a>
            <a href="#velocity" className="hover:text-white transition">Velocity</a>
            <a href="#mission" className="hover:text-white transition">Mission</a>
          </div>
          <div>
            <button 
              onClick={() => setShowOnboarding(true)}
              className="border border-white/20 text-white text-[10px] md:text-xs px-3 md:px-6 py-2 uppercase tracking-widest hover:bg-white hover:text-black transition-all tech-font"
            >
              Access Terminal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 md:pt-20 pb-10 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent opacity-50" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto px-4 md:px-6 items-center">
          <div>
            <div className="flex items-center space-x-2 mb-4 text-xs tracking-widest text-cyan-400 uppercase">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <span>System Status: Online</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-none mb-6 glitch-text tech-font" data-text="AUTONOMOUS GROWTH">
              AUTONOMOUS<br />GROWTH
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md border-l-2 border-cyan-500/50 pl-4">
              Shifting human operations to machine precision. One engine for SEO, SMO, GMB, Web Dev, CRO &amp; Content.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
              <button 
                onClick={() => setShowOnboarding(true)}
                className="w-full sm:w-auto bg-white text-black px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-cyan-400 transition-all tech-font shadow-lg shadow-white/10"
              >
                Initialize Engine
              </button>
              <button className="w-full sm:w-auto border border-white/30 text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-white/5 transition-all tech-font">
                View Specs
              </button>
            </div>
          </div>

          <div className="relative h-[320px] sm:h-[420px] md:h-[500px] flex items-center justify-center">
            <div className="orbit-system absolute">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cyan-400">
                <span className="iconify" data-icon="mdi:robot-industrial" data-width="24" />
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-blue-400">
                <span className="iconify" data-icon="mdi:chart-line" data-width="24" />
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                <span className="iconify" data-icon="mdi:web" data-width="24" />
              </div>
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-purple-400">
                <span className="iconify" data-icon="mdi:email-fast" data-width="24" />
              </div>
            </div>

            <div className="w-24 h-24 bg-black border border-white/20 rounded-lg flex items-center justify-center shadow-2xl shadow-cyan-500/20 z-10">
              <span className="text-4xl text-white iconify" data-icon="mdi:brain" />
            </div>
            
            <svg className="absolute w-full h-full animate-pulse opacity-20">
              <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="white" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="white" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="15%" y2="50%" stroke="white" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="85%" y2="50%" stroke="white" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="systems" className="py-16 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tech-font mb-2">SYSTEM MODULES</h2>
            <p className="text-gray-500 text-sm uppercase tracking-widest">All-in-one Automation Architecture</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-1">
            {[
              { icon: 'mdi:magnify', title: 'SEO & Semantics', desc: 'Autonomous Crawling & Ranking', color: 'cyan' },
              { icon: 'mdi:share-variant', title: 'SMO Engine', desc: 'Social Synthesis & Posting', color: 'purple' },
              { icon: 'mdi:map-marker-radius', title: 'GMB Automation', desc: 'Local Visibility Optimization', color: 'blue' },
              { icon: 'mdi:file-document-edit', title: 'Gen-AI Content', desc: 'Human-Like Writing Engine', color: 'red' },
              { icon: 'mdi:code-braces-box', title: 'Web Development', desc: 'Auto-Coded Landing Pages', color: 'green' },
              { icon: 'mdi:email-check', title: 'Email Systems', desc: 'Drip Campaigns & Sequences', color: 'yellow' },
              { icon: 'mdi:funnel', title: 'CRO Logic', desc: 'Conversion Rate Algorithms', color: 'orange' },
              { icon: 'mdi:plus-circle-outline', title: 'Future Module', desc: 'Coming Soon to Fleet', color: 'white', isFuture: true },
            ].map((module, index) => (
              <div
                key={index}
                className={`group bg-[#0a0a0a] border border-white/5 p-6 hover:border-${module.color}-500/30 transition-all duration-300 ${module.isFuture ? 'bg-gradient-to-br from-[#0a0a0a] to-blue-900/10' : ''}`}
              >
                <div className={`text-${module.color}-400 mb-4`}>
                  <span className="iconify" data-icon={module.icon} data-width="32" />
                </div>
                <h3 className="text-white font-bold uppercase tracking-wide tech-font">{module.title}</h3>
                <p className="text-gray-500 text-xs mt-2 border-t border-white/10 pt-2">{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="velocity" className="py-16 md:py-24 bg-[#050507]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white tech-font mb-2">SELECT COMPUTE VELOCITY</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto tracking-wide">
              Scale your AI operations. Upgrade from standard processing to our hyperscale ProModel architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Starter', icon: 'mdi:chip', price: '$99', speed: '1x Standard', percent: 20, featured: false, features: ['Standard AI Language Model', 'Linear Content Processing', 'Basic SEO keyword matching'] },
              { name: 'Professional', icon: 'mdi:server', price: '$199', speed: '5x Hyper-Velocity', percent: 60, featured: true, features: ['ProModel X1 Neural Engine (5x Faster)', 'Hyperscale Distributed Crawlers', 'Multi-threaded Semantic Synthesis', 'Real-time SERP Volatility Analysis'] },
              { name: 'Enterprise', icon: 'mdi:network', price: '$399', speed: 'Unlimited Cluster', percent: 100, featured: false, features: ['Dedicated HPC Clusters', 'Custom LLM Training on your Data', 'Global Edge CDN Inference'] },
            ].map((plan, index) => (
              <div
                key={index}
                className={`border bg-[#0a0a0a] p-6 flex flex-col transition-all ${
                  plan.featured ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10 lg:-translate-y-4 relative' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {plan.featured && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs px-3 py-1 uppercase font-bold tech-font">
                      High Performance
                    </div>
                  </>
                )}
                
                <h3 className={`text-xl text-white tech-font flex items-center gap-2 ${plan.featured ? 'mt-4' : ''}`}>
                  {plan.name}
                  <span className={`iconify ${plan.featured ? 'text-cyan-400' : 'text-gray-500'}`} data-icon={plan.icon} />
                </h3>
                
                <div className="my-4">
                  <span className="text-4xl font-bold text-white tech-font">{plan.price}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                
                <div className="mb-6">
                  <div className={`flex justify-between text-xs mb-1 ${plan.featured ? 'text-cyan-400 font-bold' : 'text-gray-400'}`}>
                    <span>AI Processing Speed</span>
                    <span>{plan.speed}</span>
                  </div>
                  <div className="speed-bar-bg">
                    <div className={`speed-bar-fill ${plan.featured ? 'active' : ''}`} style={{ width: `${plan.percent}%` }} />
                  </div>
                </div>

                <ul className={`space-y-3 text-sm mb-8 ${plan.featured ? 'text-white' : 'text-gray-300'}`}>
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <span className={`iconify mt-1 ${plan.featured ? 'text-cyan-400' : 'text-gray-500'}`} data-icon={plan.featured ? 'mdi:check-circle' : 'mdi:check'} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => setShowOnboarding(true)}
                  className={`w-full py-3 text-xs uppercase tracking-widest transition tech-font ${
                    plan.featured ? 'bg-white text-black hover:bg-cyan-400 font-bold' : 'border border-white/20 text-white hover:bg-white hover:text-black'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : `Choose ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 md:mt-16 max-w-3xl mx-auto border-t border-white/10 pt-8">
            <h3 className="text-xl text-white tech-font mb-6 text-center">Technical Specifications</h3>
            {[
              { q: 'What is the ProModel X1 Engine?', a: 'The ProModel X1 is our proprietary neural architecture designed specifically for high-volume text generation. It utilizes a mixture-of-experts (MoE) approach to deliver 5x faster inference speeds.' },
              { q: 'How does the 5x speed scale work?', a: 'Our Professional tier allocates 5x the GPU compute nodes to your requests, allowing for parallel processing of multiple queries, drastically reducing time for large-scale SEO audits.' },
            ].map((faq, index) => (
              <div key={index} className="border-b border-white/10 py-4 cursor-pointer group" onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}>
                <div className="flex justify-between items-center text-white tech-font">
                  <span>{faq.q}</span>
                  <span className={`iconify transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`} data-icon="mdi:chevron-down" />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <p className="text-gray-400 text-sm pl-4 border-l-2 border-cyan-500">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#030305]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="w-6 h-6 bg-white rotate-45 transform" />
            <span className="text-lg font-bold text-white tracking-widest tech-font">GROWTHAI</span>
          </div>
          <p className="text-gray-600 text-xs uppercase tracking-widest">
            Shifting Human Operations To Machine Precision © 2023
          </p>
        </div>
      </footer>
    </div>
  )

  // Onboarding Component
  const OnboardingFlow = () => {
    const resetOnboarding = () => {
      setShowOnboarding(false)
      setShowDashboard(false)
      setCurrentStep(1)
      setStepErrors([])
      setAcceptedTerms(false)
      setFormData(initialFormData)
    }

    const enabledIntegrations = Object.entries(formData.integrations).filter(([, value]) => value.enabled)
    const questionTitleClass = 'text-2xl md:text-4xl font-bold text-white tech-font tracking-wide leading-tight'
    const textMutedClass = 'text-sm text-gray-400'
    const inputClass = 'bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30'
    const optionClass = (selected: boolean) =>
      `rounded-xl border p-3 text-left transition ${
        selected
          ? 'border-cyan-400/70 bg-cyan-500/10 text-white'
          : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-cyan-400/40 hover:bg-white/[0.06]'
      }`

    const renderStepContent = () => {
      if (currentStepId === 'businessName') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>What is your business name?</h2>
            <Input className={inputClass} value={formData.businessName} onChange={(e) => updateFormData('businessName', e.target.value)} placeholder="e.g., Joe's Coffee Shop" />
          </div>
        )
      }
      if (currentStepId === 'businessCategory') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>Which category fits your business?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['restaurant', 'Restaurant & Food'],
                ['retail', 'Retail & E-commerce'],
                ['service', 'Professional Services'],
                ['healthcare', 'Healthcare'],
                ['education', 'Education'],
                ['technology', 'Technology'],
                ['real-estate', 'Real Estate'],
                ['other', 'Other'],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => updateFormData('businessCategory', value)} className={optionClass(formData.businessCategory === value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )
      }
      if (currentStepId === 'businessSize') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>How large is your business?</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                ['solo', 'Just me (1 person)'],
                ['small', 'Small (2-10 employees)'],
                ['medium', 'Medium (11-50 employees)'],
                ['large', 'Large (51+ employees)'],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => updateFormData('businessSize', value)} className={optionClass(formData.businessSize === value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )
      }
      if (currentStepId === 'businessLocation') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>Where is your business located?</h2>
            <Input className={inputClass} value={formData.businessLocation} onChange={(e) => updateFormData('businessLocation', e.target.value)} placeholder="e.g., New York, NY" />
          </div>
        )
      }
      if (currentStepId === 'businessDescription') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>Describe your business briefly</h2>
            <p className={textMutedClass}>Minimum 20 characters.</p>
            <Textarea rows={4} className={inputClass} value={formData.businessDescription} onChange={(e) => updateFormData('businessDescription', e.target.value)} placeholder="What you do, who you serve, and what makes you different." />
          </div>
        )
      }
      if (currentStepId === 'selectedGoals') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>What are your top goals?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goals.map((goal) => (
                <button key={goal.id} type="button" onClick={() => toggleGoal(goal.id)} className={optionClass(formData.selectedGoals.includes(goal.id))}>
                  <div className="font-semibold">{goal.title}</div>
                  <div className={textMutedClass}>{goal.description}</div>
                </button>
              ))}
            </div>
          </div>
        )
      }
      if (currentStepId === 'competitionLevel') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>How competitive is your market?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['low', 'medium', 'high'].map((level) => (
                <button key={level} type="button" onClick={() => updateFormData('competitionLevel', level)} className={`${optionClass(formData.competitionLevel === level)} capitalize p-4`}>
                  {level}
                </button>
              ))}
            </div>
          </div>
        )
      }
      if (currentStepId === 'hasWebsite') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>Do you already have a website?</h2>
            <div className="grid grid-cols-1 gap-3">
              <button type="button" onClick={() => updateFormData('hasWebsite', true)} className={`${optionClass(formData.hasWebsite === true)} p-4`}>Yes, I have one</button>
              <button type="button" onClick={() => updateFormData('hasWebsite', false)} className={`${optionClass(formData.hasWebsite === false)} p-4`}>No, I need a new website</button>
            </div>
          </div>
        )
      }
      if (currentStepId === 'websiteUrl') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>What is your website URL?</h2>
            <Input className={inputClass} type="url" value={formData.websiteUrl} onChange={(e) => updateFormData('websiteUrl', e.target.value)} placeholder="https://example.com" />
          </div>
        )
      }
      if (currentStepId === 'cmsType') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>Which platform/CMS do you use?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['wordpress', 'WordPress'],
                ['shopify', 'Shopify'],
                ['wix', 'Wix'],
                ['squarespace', 'Squarespace'],
                ['custom', 'Custom HTML/CSS'],
                ['other', 'Other'],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => updateFormData('cmsType', value)} className={optionClass(formData.cmsType === value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )
      }
      if (currentStepId === 'hostingType') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>What hosting type do you use?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['shared', 'Shared Hosting'],
                ['vps', 'VPS Hosting'],
                ['dedicated', 'Dedicated Server'],
                ['cloud', 'Cloud Hosting'],
                ['managed', 'Managed WordPress'],
                ['other', 'Other'],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => updateFormData('hostingType', value)} className={optionClass(formData.hostingType === value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )
      }
      if (currentStepId === 'hostingProvider') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>Who is your hosting provider?</h2>
            <Input className={inputClass} value={formData.hostingProvider} onChange={(e) => updateFormData('hostingProvider', e.target.value)} placeholder="e.g., Bluehost, SiteGround, AWS" />
          </div>
        )
      }
      if (currentStepId === 'integrations') {
        return (
          <div className="space-y-4">
            <h2 className={questionTitleClass}>Which integrations should we connect first?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {integrationList.map((integration) => {
                const enabled = formData.integrations[integration.id as keyof typeof formData.integrations].enabled
                return (
                  <button key={integration.id} type="button" onClick={() => updateIntegration(integration.id, 'enabled', !enabled)} className={optionClass(enabled)}>
                    <div className="font-semibold">{integration.name}</div>
                    <div className={textMutedClass}>{integration.description}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      }
      return (
        <div className="space-y-5">
          <h2 className={questionTitleClass}>Review and confirm</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm space-y-2 text-gray-300">
            <div><span className="text-gray-500">Business:</span> <span className="font-medium text-white">{formData.businessName || 'Not provided'}</span></div>
            <div><span className="text-gray-500">Category:</span> <span className="font-medium text-white">{formData.businessCategory || 'Not provided'}</span></div>
            <div><span className="text-gray-500">Goals:</span> <span className="font-medium text-white">{formData.selectedGoals.join(', ') || 'Not selected'}</span></div>
            <div><span className="text-gray-500">Website:</span> <span className="font-medium text-white">{formData.hasWebsite ? formData.websiteUrl || 'Has website' : 'Needs new website'}</span></div>
            <div><span className="text-gray-500">Integrations:</span> <span className="font-medium text-white">{enabledIntegrations.length > 0 ? enabledIntegrations.map(([id]) => integrationList.find((x) => x.id === id)?.name || id).join(', ') : 'None selected'}</span></div>
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 cursor-pointer">
            <Checkbox checked={acceptedTerms} onCheckedChange={(checked) => { setAcceptedTerms(checked === true); clearStepErrors() }} className="mt-0.5" />
            <span className="text-sm text-gray-200">I confirm the details are accurate and consent to use this data for onboarding and strategy generation.</span>
          </label>
        </div>
      )
    }

    if (currentStepId) {
      return (
        <div className="fixed inset-0 z-50 bg-[#030305] overflow-y-auto">
          <div className="bg-[#030305]/90 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 border border-cyan-400/40 rounded-xl flex items-center justify-center bg-cyan-500/10">
                  <span className="iconify text-cyan-300 text-xl" data-icon="mdi:rocket-launch" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-extrabold text-white tech-font tracking-wider">GrowthAI</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">Step {currentStep} of {totalSteps}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={resetOnboarding} className="text-gray-300 hover:text-white hover:bg-white/10">
                <span className="iconify text-2xl" data-icon="mdi:close" />
              </Button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 md:py-6">
            <Progress value={progressPercent} className="h-1.5 bg-white/10 [&_[data-slot=progress-indicator]]:bg-cyan-400" />
          </div>

          <div className="max-w-3xl mx-auto px-4 md:px-6 pb-10 md:pb-12">
            <div className="rounded-2xl shadow-2xl border border-white/10 bg-[#0a0a0d] text-white p-5 md:p-8">
              <div className="text-xs uppercase tracking-widest text-cyan-300 mb-6 tech-font">{activeStep?.label}</div>

              {stepErrors.length > 0 && (
                <Alert variant="destructive" className="mb-6 border-red-500/40 bg-red-500/10">
                  <span className="iconify" data-icon="mdi:alert-circle" />
                  <AlertTitle>Please fix these issues</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {stepErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div>{renderStepContent()}</div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between mt-8 md:mt-10 pt-5 md:pt-6 border-t border-white/10">
                <Button onClick={previousStep} disabled={currentStep === 1} variant="outline" className="w-full sm:w-auto px-6 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  Back
                </Button>
                <Button onClick={nextStep} className="w-full sm:w-auto px-8 flex items-center gap-2 justify-center bg-cyan-400 text-black hover:bg-cyan-300 tech-font uppercase tracking-wider">
                  {currentStep === totalSteps ? 'Start AI Analysis' : 'Continue'}
                  <span className="iconify" data-icon="mdi:arrow-right" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const SimulationDashboard = () => {
    const [typedCode, setTypedCode] = useState('')
    const [phaseIndex, setPhaseIndex] = useState(0)
    const [previewLoading, setPreviewLoading] = useState(true)
    const [previewErrored, setPreviewErrored] = useState(false)
    const [previewKey, setPreviewKey] = useState(0)
    const codeRef = useRef({ block: 0, char: 0 })

    const targetUrl =
      formData.websiteUrl && formData.websiteUrl.startsWith('http')
        ? formData.websiteUrl
        : 'https://example.com'

    const phases = [
      'Reading target site structure',
      'Generating SEO and content changes',
      'Applying updates to runtime preview',
      'Running validation and preparing release',
    ]

    const plannedChanges = [
      'Hero copy and CTA refreshed',
      'Meta title and description updated',
      'Navigation structure normalized',
      'Page speed assets queued for optimization',
      'Schema markup patch prepared',
    ]

    const codeBlocks = [
      `// Crawl target URL and extract structure\nconst pageMap = await crawler.scan("${targetUrl}")\nconst sections = extractor.getSections(pageMap)\n`,
      `// Generate content and SEO patches\nconst patch = await agent.generatePatch({\n  goal: "increase qualified leads",\n  sections,\n  keywords: ["local seo", "service pages", "conversion"]\n})\n`,
      `// Apply patch to runtime preview\nawait preview.apply(patch)\nawait preview.validate({ lighthouse: true, links: true, schema: true })\n`,
      `// Finalize session output\nreturn {\n  status: "ready",\n  updatedSections: patch.sections.length,\n  previewUrl: "${targetUrl}"\n}\n`,
    ]

    useEffect(() => {
      const interval = setInterval(() => {
        const block = codeBlocks[codeRef.current.block]
        if (!block) return

        if (codeRef.current.char < block.length) {
          setTypedCode(prev => prev + block[codeRef.current.char])
          codeRef.current.char += 1
        } else if (codeRef.current.block < codeBlocks.length - 1) {
          setTypedCode(prev => prev + '\n')
          codeRef.current.block += 1
          codeRef.current.char = 0
          setPhaseIndex(prev => Math.min(prev + 1, phases.length - 1))
          setPreviewLoading(true)
          setPreviewErrored(false)
          setPreviewKey(prev => prev + 1)
        } else {
          clearInterval(interval)
        }
      }, 18)

      return () => clearInterval(interval)
    }, [])

    const activeChanges = plannedChanges.map((item, idx) => ({
      item,
      done: idx <= phaseIndex,
    }))

    return (
      <div className="min-h-screen bg-[#030305] text-gray-300">
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#030305]/95 backdrop-blur-md">
          <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white rotate-45 transform" />
              <span className="text-sm md:text-lg text-white tech-font tracking-widest">GROWTHAI AGENT WORKSPACE</span>
            </div>
            <div className="hidden md:block text-xs text-cyan-400 tech-font uppercase tracking-wider">
              {phases[phaseIndex]}
            </div>
          </div>
        </nav>

        <div className="pt-16 px-3 md:px-4 pb-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 h-[calc(100vh-80px)]">
            <section className="rounded-xl border border-white/10 bg-[#09090b] overflow-hidden flex flex-col min-h-[360px]">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-gray-400 tech-font">Agent Output</h3>
                <span className="text-[10px] text-green-400 font-mono">streaming</span>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs md:text-sm leading-6">
                <pre className="whitespace-pre-wrap text-gray-200">{typedCode}</pre>
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-[#09090b] overflow-hidden flex flex-col min-h-[360px]">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-gray-400 tech-font">Live Preview</h3>
                <span className="text-[10px] text-cyan-400 font-mono truncate max-w-[55%]">{targetUrl}</span>
              </div>

              <div className="px-4 py-3 border-b border-white/10 space-y-2">
                <div className="h-1.5 bg-white/10 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                    style={{ width: `${((phaseIndex + 1) / phases.length) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeChanges.map((change) => (
                    <div key={change.item} className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${change.done ? 'bg-green-400' : 'bg-gray-600'}`} />
                      <span className={change.done ? 'text-gray-200' : 'text-gray-500'}>{change.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex-1 bg-black">
                {previewLoading && (
                  <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <div className="text-xs text-cyan-300">Applying changes to preview...</div>
                    </div>
                  </div>
                )}

                {previewErrored ? (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                    <div>
                      <div className="text-sm text-red-400 mb-2">Preview blocked by target site headers</div>
                      <div className="text-xs text-gray-500">Some websites do not allow iframe rendering. Agent pipeline is still running.</div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    key={previewKey}
                    src={targetUrl}
                    className="w-full h-full"
                    onLoad={() => setPreviewLoading(false)}
                    onError={() => {
                      setPreviewLoading(false)
                      setPreviewErrored(true)
                    }}
                    title="Live Site Preview"
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  // Analysis Modal
  const AnalysisModal = () => {
    const analysisSteps = [
      { name: 'Scanning Website', desc: 'Analyzing structure and content', icon: 'mdi:web' },
      { name: 'SEO Analysis', desc: 'Checking search optimization', icon: 'mdi:magnify' },
      { name: 'Social Audit', desc: 'Reviewing social presence', icon: 'mdi:share-variant' },
      { name: 'Competitor Research', desc: 'Analyzing market position', icon: 'mdi:account-search' },
      { name: 'Generating Strategy', desc: 'Creating growth plan', icon: 'mdi:lightbulb-on' },
    ]

    const currentAnalysisStep = Math.floor((analysisProgress / 100) * analysisSteps.length)

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
          <div className="bg-black p-6">
            <h3 className="text-2xl font-bold text-white">AI Analysis in Progress</h3>
            <p className="text-gray-400">Please wait while we analyze your data...</p>
          </div>
          
          <div className="p-6">
            {analysisSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 mb-4 transition-all ${
                  index < currentAnalysisStep ? 'opacity-100' :
                  index === currentAnalysisStep ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  index < currentAnalysisStep ? 'bg-green-500' :
                  index === currentAnalysisStep ? 'bg-indigo-500 animate-pulse' : 'bg-gray-200'
                }`}>
                  <span className={`iconify text-xl ${index <= currentAnalysisStep ? 'text-white' : 'text-gray-400'}`} data-icon={index < currentAnalysisStep ? 'mdi:check' : step.icon} />
                </div>
                <div>
                  <div className={`font-semibold ${index <= currentAnalysisStep ? 'text-gray-900' : 'text-gray-400'}`}>{step.name}</div>
                  <div className="text-sm text-gray-500">{step.desc}</div>
                </div>
              </div>
            ))}
            
            <div className="mt-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className="text-center mt-2 text-sm text-gray-500">{analysisProgress}% Complete</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {!showOnboarding && !showDashboard && LandingPage()}
      {showOnboarding && OnboardingFlow()}
      {showAnalysis && AnalysisModal()}
      {showDashboard && <SimulationDashboard />}
    </>
  )
}

