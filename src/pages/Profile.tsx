import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/Card'
import { Button } from '../components/Button'
import { Input, TextArea } from '../components/Input'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Star, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Save, 
  X, 
  Crown,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react'

interface UserStats {
  total_jobs: number
  completed_jobs: number
  total_earnings: number
  average_rating: number
  total_reviews: number
}

interface RecentActivity {
  id: string
  type: 'job_completed' | 'proposal_sent' | 'review_received'
  title: string
  description: string
  date: string
  amount?: number
  rating?: number
}

function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<UserStats>({
    total_jobs: 0,
    completed_jobs: 0,
    total_earnings: 0,
    average_rating: 0,
    total_reviews: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',

    skills: profile?.skills?.join(', ') || '',
    hourly_rate: profile?.hourly_rate?.toString() || ''
  })

  useEffect(() => {
    if (user) {
      loadUserStats()
      loadRecentActivity()
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',

        skills: profile.skills?.join(', ') || '',
        hourly_rate: profile.hourly_rate?.toString() || ''
      })
    }
  }, [profile])

  const loadUserStats = async () => {
    try {
      // Carregar estatísticas de jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, status, budget')
        .eq('client_id', user?.id)

      // Carregar estatísticas de propostas
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select('id, status, amount')
        .eq('freelancer_id', user?.id)

      // Carregar avaliações
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('freelancer_id', user?.id)

      const totalJobs = jobsData?.length || 0
      const completedJobs = jobsData?.filter(job => job.status === 'completed').length || 0
      const acceptedProposals = proposalsData?.filter(p => p.status === 'accepted') || []
      const totalEarnings = acceptedProposals.reduce((sum, p) => sum + (p.amount || 0), 0)
      const averageRating = reviewsData?.length 
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length 
        : 0

      setStats({
        total_jobs: totalJobs,
        completed_jobs: completedJobs,
        total_earnings: totalEarnings,
        average_rating: averageRating,
        total_reviews: reviewsData?.length || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Simular atividades recentes (em um app real, isso viria de uma tabela de atividades)
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'job_completed',
          title: 'Projeto concluído',
          description: 'Desenvolvimento de site institucional',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 2500
        },
        {
          id: '2',
          type: 'proposal_sent',
          title: 'Proposta enviada',
          description: 'App mobile para delivery',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'review_received',
          title: 'Avaliação recebida',
          description: 'Sistema de gestão empresarial',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 5
        }
      ]
      setRecentActivity(activities)
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const updatedProfile = {
        full_name: editForm.full_name,
        bio: editForm.bio,
        location: editForm.location,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(s => s),
        hourly_rate: editForm.hourly_rate ? parseFloat(editForm.hourly_rate) : null
      }

      await updateProfile(updatedProfile)
      setIsEditing(false)
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'job_completed': return <Briefcase className="w-4 h-4 text-green-500" />
      case 'proposal_sent': return <Clock className="w-4 h-4 text-blue-500" />
      case 'review_received': return <Star className="w-4 h-4 text-yellow-500" />
      default: return <Calendar className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Meu Perfil
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas informações pessoais e acompanhe seu desempenho
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button onClick={handleSaveProfile} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({
                      full_name: profile?.full_name || '',
                      bio: profile?.bio || '',
                      location: profile?.location || '',

                      skills: profile?.skills?.join(', ') || '',
                      hourly_rate: profile?.hourly_rate?.toString() || ''
                    })
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {profile?.full_name || 'Nome não informado'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                    {profile?.location && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Seu nome completo"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.full_name || 'Não informado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Localização
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Cidade, Estado"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.location || 'Não informado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Taxa por Hora
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.hourly_rate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                        placeholder="0.00"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profile?.hourly_rate
                          ? formatCurrency(profile.hourly_rate)
                          : 'Não informado'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Biografia
                  </label>
                  {isEditing ? (
                    <TextArea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Conte um pouco sobre você, sua experiência e especialidades..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {profile?.bio || 'Nenhuma biografia adicionada'}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Habilidades
                  </label>
                  {isEditing ? (
                    <Input
                      value={editForm.skills}
                      onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="React, Node.js, Python, Design..."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.length ? (
                        profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">Nenhuma habilidade adicionada</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Suas últimas atividades na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma atividade recente
                    </p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{formatDate(activity.date)}</span>
                            {activity.amount && (
                              <span className="text-green-600 font-medium">
                                {formatCurrency(activity.amount)}
                              </span>
                            )}
                            {activity.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{activity.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Projetos</span>
                    </div>
                    <span className="font-semibold">{stats.total_jobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Concluídos</span>
                    </div>
                    <span className="font-semibold">{stats.completed_jobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Ganhos</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(stats.total_earnings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Avaliação</span>
                    </div>
                    <span className="font-semibold">
                      {stats.average_rating.toFixed(1)} ({stats.total_reviews})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <CardTitle className="text-yellow-700 dark:text-yellow-400">
                    Plano Premium
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Desbloqueie recursos avançados e aumente suas chances de sucesso
                </p>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Destaque em buscas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Badge Premium</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>Propostas ilimitadas</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Crown className="w-4 h-4 mr-2" />
                  Assinar Premium
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Ver Meus Projetos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Minhas Avaliações
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Histórico Financeiro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profile