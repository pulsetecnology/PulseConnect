import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  DollarSign, 
  Briefcase, 
  Users, 
  Award,
  ChevronDown,
  X,
  MessageCircle,
  Heart,
  Eye,
  CheckCircle
} from 'lucide-react'
import { getUserProfiles, UserProfile } from '../lib/supabase'

interface FilterState {
  category: string
  location: string
  hourlyRateMin: string
  hourlyRateMax: string
  experienceLevel: string
  rating: string
  availability: string
}

const Freelancers: React.FC = () => {
  const { user, profile } = useAuth()
  const [freelancers, setFreelancers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState<UserProfile | null>(null)
  const [showFreelancerDetails, setShowFreelancerDetails] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    location: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    experienceLevel: '',
    rating: '',
    availability: ''
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

  const experienceLevels = [
    'Iniciante',
    'Intermediário',
    'Avançado',
    'Especialista'
  ]

  const availabilityOptions = [
    'Disponível agora',
    'Disponível em 1 semana',
    'Disponível em 1 mês',
    'Não disponível'
  ]

  useEffect(() => {
    loadFreelancers()
  }, [])

  const loadFreelancers = async () => {
    try {
      setLoading(true)
      const { data, error } = await getUserProfiles()
      if (error) {
        console.error('Erro ao carregar freelancers:', error)
      } else {
        // Filtrar apenas freelancers
        const freelancerProfiles = (data || []).filter(profile => profile.user_type === 'freelancer')
        setFreelancers(freelancerProfiles)
      }
    } catch (error) {
      console.error('Erro ao carregar freelancers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFreelancers = freelancers.filter(freelancer => {
    // Filtro de busca por texto
    const matchesSearch = !searchTerm || 
      freelancer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtro por categoria (baseado nas skills)
    const matchesCategory = !filters.category || 
      freelancer.skills?.includes(filters.category)

    // Filtro por localização
    const matchesLocation = !filters.location || 
      (freelancer.location && freelancer.location.toLowerCase().includes(filters.location.toLowerCase()))

    // Filtro por taxa horária
    const matchesHourlyRate = (() => {
      if (!filters.hourlyRateMin && !filters.hourlyRateMax) return true
      const minRate = filters.hourlyRateMin ? parseFloat(filters.hourlyRateMin) : 0
      const maxRate = filters.hourlyRateMax ? parseFloat(filters.hourlyRateMax) : Infinity
      const freelancerRate = freelancer.hourly_rate || 0
      return freelancerRate >= minRate && freelancerRate <= maxRate
    })()

    // Filtro por avaliação
    const matchesRating = !filters.rating || 
      (freelancer.rating && freelancer.rating >= parseFloat(filters.rating))

    return matchesSearch && matchesCategory && matchesLocation && matchesHourlyRate && matchesRating
  })

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      hourlyRateMin: '',
      hourlyRateMax: '',
      experienceLevel: '',
      rating: '',
      availability: ''
    })
    setSearchTerm('')
  }

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length + (searchTerm ? 1 : 0)

  const handleFreelancerClick = (freelancer: UserProfile) => {
    setSelectedFreelancer(freelancer)
    setShowFreelancerDetails(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))
  }

  const FreelancerCard: React.FC<{ freelancer: UserProfile }> = ({ freelancer }) => (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => handleFreelancerClick(freelancer)}
    >
      <CardContent>
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {freelancer.full_name?.charAt(0) || 'U'}
            </div>
          </div>

          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {freelancer.full_name || 'Nome não informado'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {freelancer.title || 'Freelancer'}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {freelancer.rating && (
                  <>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {freelancer.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({freelancer.total_reviews || 0})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
              {freelancer.bio || 'Sem descrição disponível'}
            </p>

            {/* Skills */}
            {freelancer.skills && freelancer.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {freelancer.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {freelancer.skills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                    +{freelancer.skills.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Informações adicionais */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                {freelancer.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{freelancer.location}</span>
                  </div>
                )}
                {freelancer.hourly_rate && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>R$ {freelancer.hourly_rate}/h</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs">Online</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Encontre Freelancers Talentosos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredFreelancers.length} {filteredFreelancers.length === 1 ? 'freelancer encontrado' : 'freelancers encontrados'}
            </p>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="mb-8 space-y-4">
          {/* Barra de Busca */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar freelancers por nome, habilidades ou descrição..."
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
                  {/* Categoria/Habilidade */}
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

                  {/* Taxa Horária Mínima */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taxa Mínima (R$/h)
                    </label>
                    <Input
                      type="number"
                      placeholder="R$ 0"
                      leftIcon={DollarSign}
                      value={filters.hourlyRateMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, hourlyRateMin: e.target.value }))}
                    />
                  </div>

                  {/* Taxa Horária Máxima */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taxa Máxima (R$/h)
                    </label>
                    <Input
                      type="number"
                      placeholder="R$ 200"
                      leftIcon={DollarSign}
                      value={filters.hourlyRateMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, hourlyRateMax: e.target.value }))}
                    />
                  </div>

                  {/* Nível de Experiência */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Experiência
                    </label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos os níveis</option>
                      {experienceLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Avaliação Mínima */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Avaliação Mínima
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Qualquer avaliação</option>
                      <option value="4">4+ estrelas</option>
                      <option value="4.5">4.5+ estrelas</option>
                      <option value="4.8">4.8+ estrelas</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lista de Freelancers */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFreelancers.length > 0 ? (
          <div className="space-y-6">
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="mb-2">Nenhum freelancer encontrado</CardTitle>
              <CardDescription>
                {activeFiltersCount > 0
                  ? 'Tente ajustar seus filtros de busca'
                  : 'Ainda não há freelancers cadastrados. Volte em breve!'}
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

        {/* Modal de Detalhes do Freelancer */}
        {showFreelancerDetails && selectedFreelancer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header do Modal */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {selectedFreelancer.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedFreelancer.full_name || 'Nome não informado'}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                        {selectedFreelancer.title || 'Freelancer'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        {selectedFreelancer.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{selectedFreelancer.location}</span>
                          </div>
                        )}
                        {selectedFreelancer.rating && (
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center space-x-1">
                              {renderStars(selectedFreelancer.rating)}
                            </div>
                            <span className="font-medium">
                              {selectedFreelancer.rating.toFixed(1)} ({selectedFreelancer.total_reviews || 0} avaliações)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => setShowFreelancerDetails(false)}
                  >
                    Fechar
                  </Button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coluna Principal */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Sobre */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Sobre
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedFreelancer.bio || 'Sem descrição disponível'}
                      </p>
                    </div>

                    {/* Habilidades */}
                    {selectedFreelancer.skills && selectedFreelancer.skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Habilidades
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedFreelancer.skills.map((skill, index) => (
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

                    {/* Portfolio/Experiência */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Experiência
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Projetos Concluídos
                            </h4>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {selectedFreelancer.completed_projects || 0}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total de projetos finalizados com sucesso
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Taxa Horária */}
                    {selectedFreelancer.hourly_rate && (
                      <Card>
                        <CardContent>
                          <div className="text-center">
                            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                              R$ {selectedFreelancer.hourly_rate}/h
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Taxa horária
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Estatísticas */}
                    <Card>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Projetos</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedFreelancer.completed_projects || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Avaliações</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedFreelancer.total_reviews || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Membro desde</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {new Date(selectedFreelancer.created_at).getFullYear()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                Online
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ações */}
                    {profile?.user_type === 'client' && (
                      <div className="space-y-3">
                        <Button fullWidth size="lg" icon={MessageCircle}>
                          Enviar Mensagem
                        </Button>
                        <Button variant="outline" fullWidth icon={Briefcase}>
                          Convidar para Job
                        </Button>
                        <Button variant="ghost" fullWidth icon={Heart}>
                          Salvar Freelancer
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

export default Freelancers