import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/Card'
import { Button } from '../components/Button'
import { Input, TextArea, Select } from '../components/Input'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Star, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Briefcase, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  Award,
  TrendingUp
} from 'lucide-react'

interface Review {
  id: string
  job_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment: string
  created_at: string
  job?: {
    title: string
    category: string
  }
  reviewer?: {
    full_name: string
    avatar_url?: string
  }
  reviewed?: {
    full_name: string
    avatar_url?: string
  }
}

interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: { [key: number]: number }
  recent_reviews: number
}

function Reviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all') // 'received', 'given', 'all'
  const [stats, setStats] = useState<ReviewStats>({
    total_reviews: 0,
    average_rating: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recent_reviews: 0
  })

  useEffect(() => {
    if (user) {
      loadReviews()
      loadStats()
    }
  }, [user, typeFilter])

  const loadReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          job:jobs(title, category),
          reviewer:user_profiles!reviews_reviewer_id_fkey(full_name, avatar_url),
          reviewed:user_profiles!reviews_reviewed_id_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })

      // Filtrar por tipo
      if (typeFilter === 'received') {
        query = query.eq('reviewed_id', user?.id)
      } else if (typeFilter === 'given') {
        query = query.eq('reviewer_id', user?.id)
      } else {
        query = query.or(`reviewed_id.eq.${user?.id},reviewer_id.eq.${user?.id}`)
      }

      const { data, error } = await query

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Carregar estatísticas das avaliações recebidas
      const { data: receivedReviews, error } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('reviewed_id', user?.id)

      if (error) throw error

      const total = receivedReviews?.length || 0
      const average = total > 0 
        ? receivedReviews.reduce((sum, r) => sum + r.rating, 0) / total 
        : 0

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      receivedReviews?.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++
      })

      // Contar avaliações dos últimos 30 dias
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recent = receivedReviews?.filter(
        review => new Date(review.created_at) > thirtyDaysAgo
      ).length || 0

      setStats({
        total_reviews: total,
        average_rating: average,
        rating_distribution: distribution,
        recent_reviews: recent
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewed?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter
    
    return matchesSearch && matchesRating
  })

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-yellow-600'
    if (rating >= 2.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Excelente'
    if (rating >= 3.5) return 'Muito Bom'
    if (rating >= 2.5) return 'Bom'
    if (rating >= 1.5) return 'Regular'
    return 'Ruim'
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Avaliações
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Veja suas avaliações e feedback dos clientes
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Avaliações
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_reviews}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avaliação Média
                  </p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${getRatingColor(stats.average_rating)}`}>
                      {stats.average_rating.toFixed(1)}
                    </p>
                    {renderStars(Math.round(stats.average_rating))}
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avaliações Recentes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.recent_reviews}
                  </p>
                  <p className="text-xs text-gray-500">Últimos 30 dias</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Classificação
                  </p>
                  <p className={`text-lg font-bold ${getRatingColor(stats.average_rating)}`}>
                    {getRatingText(stats.average_rating)}
                  </p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribuição de Avaliações</CardTitle>
            <CardDescription>
              Como suas avaliações estão distribuídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[rating] || 0
                const percentage = stats.total_reviews > 0 
                  ? (count / stats.total_reviews) * 100 
                  : 0

                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por projeto, comentário ou pessoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="md:w-48"
          >
            <option value="all">Todas as Avaliações</option>
            <option value="received">Recebidas</option>
            <option value="given">Enviadas</option>
          </Select>
          <Select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="md:w-48"
          >
            <option value="all">Todas as Estrelas</option>
            <option value="5">5 Estrelas</option>
            <option value="4">4 Estrelas</option>
            <option value="3">3 Estrelas</option>
            <option value="2">2 Estrelas</option>
            <option value="1">1 Estrela</option>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhuma avaliação encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || ratingFilter !== 'all' || typeFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Você ainda não tem avaliações. Complete alguns projetos para receber feedback!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => {
              const isReceived = review.reviewed_id === user?.id
              const reviewer = isReceived ? review.reviewer : review.reviewed
              
              return (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {reviewer?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {reviewer?.full_name || 'Usuário'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isReceived 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {isReceived ? 'Recebida' : 'Enviada'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.job?.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {review.job?.category}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Útil</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                        <span>Não útil</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>Responder</span>
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Reviews