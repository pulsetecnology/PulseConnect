import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, JobCard } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Users, 
  Calendar,
  ChevronDown,
  X,
  Plus
} from 'lucide-react'
import { getJobs, Job } from '../lib/supabase'

interface FilterState {
  category: string
  location: string
  budgetMin: string
  budgetMax: string
  jobType: string
  experienceLevel: string
  postedWithin: string
}

const Jobs: React.FC = () => {
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobDetails, setShowJobDetails] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    jobType: '',
    experienceLevel: '',
    postedWithin: ''
  })

  const categories = [
    'Desenvolvimento Web',
    'Design Gráfico',
    'Desenvolvimento Mobile',
    'Marketing Digital',
    'Redação',
    'Tradução',
    'Consultoria',
    'Fotografia',
    'Vídeo e Animação',
    'SEO',
    'Redes Sociais'
  ]

  const jobTypes = [
    'Projeto Único',
    'Contrato Longo Prazo',
    'Meio Período',
    'Tempo Integral',
    'Consultoria'
  ]

  const experienceLevels = [
    'Iniciante',
    'Intermediário',
    'Avançado',
    'Especialista'
  ]

  const postedWithinOptions = [
    { value: '1', label: 'Últimas 24 horas' },
    { value: '7', label: 'Última semana' },
    { value: '30', label: 'Último mês' },
    { value: '90', label: 'Últimos 3 meses' }
  ]

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const { data, error } = await getJobs()
      if (error) {
        console.error('Erro ao carregar jobs:', error)
      } else {
        setJobs(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    // Filtro de busca por texto
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro por categoria
    const matchesCategory = !filters.category || job.category === filters.category

    // Filtro por localização
    const matchesLocation = !filters.location || 
      (job.location && job.location.toLowerCase().includes(filters.location.toLowerCase()))

    // Filtro por orçamento
    const matchesBudget = (() => {
      if (!filters.budgetMin && !filters.budgetMax) return true
      const minBudget = filters.budgetMin ? parseFloat(filters.budgetMin) : 0
      const maxBudget = filters.budgetMax ? parseFloat(filters.budgetMax) : Infinity
      const jobMin = job.budget_min || 0
      const jobMax = job.budget_max || Infinity
      return jobMax >= minBudget && jobMin <= maxBudget
    })()

    // Filtro por data de postagem
    const matchesPostedWithin = (() => {
      if (!filters.postedWithin) return true
      const daysAgo = parseInt(filters.postedWithin)
      const postedDate = new Date(job.created_at)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      return postedDate >= cutoffDate
    })()

    return matchesSearch && matchesCategory && matchesLocation && matchesBudget && matchesPostedWithin
  })

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      budgetMin: '',
      budgetMax: '',
      jobType: '',
      experienceLevel: '',
      postedWithin: ''
    })
    setSearchTerm('')
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length + (searchTerm ? 1 : 0)

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setShowJobDetails(true)
  }

  const formatBudget = (min?: number, max?: number) => {
    if (min && max) {
      return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`
    } else if (min) {
      return `A partir de R$ ${min.toLocaleString()}`
    } else if (max) {
      return `Até R$ ${max.toLocaleString()}`
    }
    return 'Orçamento a negociar'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Hoje'
    if (diffDays === 2) return 'Ontem'
    if (diffDays <= 7) return `${diffDays} dias atrás`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} semanas atrás`
    return `${Math.ceil(diffDays / 30)} meses atrás`
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Encontre Jobs Incríveis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas'}
            </p>
          </div>
          {profile?.user_type === 'client' && (
            <Button icon={Plus} size="lg">
              Publicar Novo Job
            </Button>
          )}
        </div>

        {/* Busca e Filtros */}
        <div className="mb-8 space-y-4">
          {/* Barra de Busca */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar jobs por título, descrição ou palavras-chave..."
                leftIcon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  icon={X}
                  onClick={clearFilters}
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Painel de Filtros */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>Filtros Avançados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Localização */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Localização
                    </label>
                    <Input
                      placeholder="Ex: São Paulo, Remoto"
                      leftIcon={MapPin}
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  {/* Orçamento Mínimo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orçamento Mínimo
                    </label>
                    <Input
                      type="number"
                      placeholder="R$ 0"
                      leftIcon={DollarSign}
                      value={filters.budgetMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetMin: e.target.value }))}
                    />
                  </div>

                  {/* Orçamento Máximo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orçamento Máximo
                    </label>
                    <Input
                      type="number"
                      placeholder="R$ 10.000"
                      leftIcon={DollarSign}
                      value={filters.budgetMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetMax: e.target.value }))}
                    />
                  </div>

                  {/* Tipo de Job */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Trabalho
                    </label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos os tipos</option>
                      {jobTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data de Postagem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Postado em
                    </label>
                    <select
                      value={filters.postedWithin}
                      onChange={(e) => setFilters(prev => ({ ...prev, postedWithin: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Qualquer data</option>
                      {postedWithinOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de Jobs */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                title={job.title}
                description={job.description}
                budget={{
                  min: job.budget_min || undefined,
                  max: job.budget_max || undefined
                }}
                category={job.category}
                location={job.location || undefined}
                postedAt={job.created_at}
                proposalsCount={0} // TODO: Implementar contagem de propostas
                onClick={() => handleJobClick(job)}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="mb-2">Nenhum job encontrado</CardTitle>
              <CardDescription>
                {activeFiltersCount > 0
                  ? 'Tente ajustar seus filtros de busca'
                  : 'Ainda não há jobs disponíveis. Volte em breve!'}
              </CardDescription>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal de Detalhes do Job */}
        {showJobDetails && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header do Modal */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedJob.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {selectedJob.category}
                      </div>
                      {selectedJob.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedJob.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(selectedJob.created_at)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => setShowJobDetails(false)}
                  >
                    Fechar
                  </Button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coluna Principal */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Descrição */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Descrição do Projeto
                      </h3>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedJob.description}
                        </p>
                      </div>
                    </div>

                    {/* Habilidades Necessárias */}
                    {selectedJob.skills_required && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Habilidades Necessárias
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills_required.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Orçamento */}
                    <Card>
                      <CardContent>
                        <div className="text-center">
                          <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {formatBudget(selectedJob.budget_min, selectedJob.budget_max)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Orçamento do projeto
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Estatísticas */}
                    <Card>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Propostas</span>
                            <span className="font-semibold text-gray-900 dark:text-white">0</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                              {selectedJob.status === 'open' ? 'Aberto' : 'Fechado'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Publicado</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(selectedJob.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ações */}
                    {profile?.user_type === 'freelancer' && selectedJob.status === 'open' && (
                      <div className="space-y-3">
                        <Button fullWidth size="lg">
                          Enviar Proposta
                        </Button>
                        <Button variant="outline" fullWidth>
                          Salvar Job
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Jobs