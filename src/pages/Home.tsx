import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, JobCard } from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import { Search, Briefcase, Users, TrendingUp, MapPin, Clock, Plus } from 'lucide-react'
import { getJobs, Job } from '../lib/supabase'

const Home: React.FC = () => {
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = [
    'Desenvolvimento Web',
    'Design Gráfico',
    'Desenvolvimento Mobile',
    'Marketing Digital',
    'Redação',
    'Tradução',
    'Consultoria',
    'Fotografia'
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
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || job.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = [
    {
      title: 'Oportunidades Ativas',
      value: jobs.length.toString(),
      icon: Briefcase,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Freelancers',
      value: '1.2k+',
      icon: Users,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Taxa de Sucesso',
      value: '94%',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Header de Boas-vindas */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}! 👋
            </h1>
            <p className="text-xl opacity-90 mb-6">
              {profile?.user_type === 'client' 
                ? 'Encontre os melhores freelancers para seus projetos'
                : 'Descubra oportunidades incríveis para sua carreira'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="secondary" 
                size="lg"
                icon={profile?.user_type === 'client' ? Users : Briefcase}
              >
                {profile?.user_type === 'client' ? 'Contratar Freelancer' : 'Ver Oportunidades Disponíveis'}
              </Button>
              {profile?.user_type === 'client' && (
                <Button 
                  variant="outline" 
                  size="lg"
                  icon={Plus}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Publicar Oportunidade
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.title}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Busca e Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Encontre a Oportunidade Perfeita</CardTitle>
            <CardDescription>
              Use os filtros abaixo para encontrar oportunidades que combinam com você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por título, descrição ou palavras-chave..."
                  leftIcon={Search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="lg:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Jobs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Oportunidades em Destaque
            </h2>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
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
              {filteredJobs.slice(0, 6).map((job) => (
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
                  onClick={() => console.log('Ver oportunidade:', job.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <CardTitle className="mb-2">Nenhuma oportunidade encontrada</CardTitle>
                <CardDescription>
                  {searchTerm || selectedCategory
                    ? 'Tente ajustar seus filtros de busca'
                    : 'Ainda não há oportunidades disponíveis. Volte em breve!'}
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Categorias Populares */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias Populares</CardTitle>
            <CardDescription>
              Explore as áreas com mais oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {category}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.floor(Math.random() * 50) + 10} oportunidades
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default Home