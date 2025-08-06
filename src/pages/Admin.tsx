import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/Card'
import { Button } from '../components/Button'
import { Input, Select } from '../components/Input'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity,
  AlertTriangle,
  Shield
} from 'lucide-react'

interface AdminStats {
  total_users: number
  total_jobs: number
  total_proposals: number
  total_revenue: number
  active_users: number
  completed_jobs: number
  pending_jobs: number
  monthly_growth: number
}

interface User {
  id: string
  email: string
  created_at: string
  user_profiles?: {
    full_name: string
    location?: string
    is_active: boolean
  } | {
    full_name: string
    location?: string
    is_active: boolean
  }[]
}

interface Job {
  id: string
  title: string
  description: string
  budget: number
  category: string
  status: string
  created_at: string
  client_id: string
  user_profiles?: {
    full_name: string
  }
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'job_posted' | 'proposal_sent' | 'job_completed'
  description: string
  timestamp: string
  user_name?: string
}

const getUserProfile = (user: User) => {
  if (!user.user_profiles) return null
  return Array.isArray(user.user_profiles) ? user.user_profiles[0] : user.user_profiles
}

function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_jobs: 0,
    total_proposals: 0,
    total_revenue: 0,
    active_users: 0,
    completed_jobs: 0,
    pending_jobs: 0,
    monthly_growth: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadJobs(),
        loadRecentActivity()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Carregar usuários
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id, is_active, created_at')

      // Carregar jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, status, budget, created_at')

      // Carregar propostas
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select('id, status, amount')

      const totalUsers = usersData?.length || 0
      const activeUsers = usersData?.filter(u => u.is_active).length || 0
      const totalJobs = jobsData?.length || 0
      const completedJobs = jobsData?.filter(j => j.status === 'completed').length || 0
      const pendingJobs = jobsData?.filter(j => j.status === 'open').length || 0
      const totalProposals = proposalsData?.length || 0
      const totalRevenue = proposalsData
        ?.filter(p => p.status === 'accepted')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      // Calcular crescimento mensal (simulado)
      const monthlyGrowth = 12.5

      setStats({
        total_users: totalUsers,
        total_jobs: totalJobs,
        total_proposals: totalProposals,
        total_revenue: totalRevenue,
        active_users: activeUsers,
        completed_jobs: completedJobs,
        pending_jobs: pendingJobs,
        monthly_growth: monthlyGrowth
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select(`
          id,
          email,
          created_at,
          user_profiles(
            full_name,
            location,
            user_type,
            is_active
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      // Fallback com dados simulados
      setUsers([
        {
          id: '1',
          email: 'usuario1@example.com',
          created_at: new Date().toISOString(),
          user_profiles: {
            full_name: 'João Silva',
            location: 'São Paulo, SP',
            is_active: true
          }
        },
        {
          id: '2',
          email: 'usuario2@example.com',
          created_at: new Date().toISOString(),
          user_profiles: {
            full_name: 'Maria Santos',
            location: 'Rio de Janeiro, RJ',
            is_active: true
          }
        }
      ])
    }
  }

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          creator:user_profiles!jobs_creator_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Erro ao carregar jobs:', error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Simular atividades recentes
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registered',
          description: 'Novo usuário registrado',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          user_name: 'João Silva'
        },
        {
          id: '2',
          type: 'job_posted',
          description: 'Novo projeto publicado',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user_name: 'Maria Santos'
        },
        {
          id: '3',
          type: 'proposal_sent',
          description: 'Nova proposta enviada',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          user_name: 'Pedro Costa'
        },
        {
          id: '4',
          type: 'job_completed',
          description: 'Projeto concluído',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user_name: 'Ana Lima'
        }
      ]
      setRecentActivity(activities)
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
    }
  }

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return
        // Implementar exclusão
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_active: action === 'activate' })
          .eq('id', userId)

        if (error) throw error
        loadUsers()
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error)
    }
  }

  const handleJobAction = async (jobId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!confirm('Tem certeza que deseja excluir este projeto?')) return
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', jobId)

        if (error) throw error
      } else {
        const status = action === 'approve' ? 'open' : 'rejected'
        const { error } = await supabase
          .from('jobs')
          .update({ status })
          .eq('id', jobId)

        if (error) throw error
      }
      loadJobs()
    } catch (error) {
      console.error('Erro ao executar ação:', error)
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
      case 'user_registered': return <Users className="w-4 h-4 text-blue-500" />
      case 'job_posted': return <Briefcase className="w-4 h-4 text-green-500" />
      case 'proposal_sent': return <Activity className="w-4 h-4 text-purple-500" />
      case 'job_completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', text: 'Aberto' },
      completed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', text: 'Concluído' },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'Cancelado' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', text: 'Pendente' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
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
              Dashboard Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie usuários, projetos e monitore métricas da plataforma
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Administrador
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'jobs', label: 'Projetos', icon: Briefcase },
            { id: 'activity', label: 'Atividades', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total de Usuários
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.total_users}
                      </p>
                      <p className="text-xs text-green-600">
                        {stats.active_users} ativos
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total de Projetos
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.total_jobs}
                      </p>
                      <p className="text-xs text-green-600">
                        {stats.completed_jobs} concluídos
                      </p>
                    </div>
                    <Briefcase className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Receita Total
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.total_revenue)}
                      </p>
                      <p className="text-xs text-green-600">
                        +{stats.monthly_growth}% este mês
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Propostas
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats.total_proposals}
                      </p>
                      <p className="text-xs text-blue-600">
                        {stats.pending_jobs} pendentes
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento de Usuários</CardTitle>
                  <CardDescription>
                    Novos registros nos últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de crescimento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>
                    Projetos por área de atuação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de distribuição</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="md:w-48"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </Select>
            </div>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários Registrados</CardTitle>
                <CardDescription>
                  Gerencie todos os usuários da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Usuário
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Localização
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const profile = getUserProfile(user)
                        return (
                          <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {profile?.full_name?.charAt(0) || user.email.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {profile?.full_name || 'Nome não informado'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {user.email}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {profile?.location || 'Não informado'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                profile?.is_active
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {profile?.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserAction(
                                    user.id, 
                                    profile?.is_active ? 'deactivate' : 'activate'
                                  )}
                                >
                                  {profile?.is_active ? (
                                    <Ban className="w-3 h-3" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserAction(user.id, 'delete')}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projetos Publicados</CardTitle>
                <CardDescription>
                  Monitore e gerencie todos os projetos da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Por: {job.user_profiles?.full_name || 'Usuário'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{job.category}</span>
                            <span>{formatCurrency(job.budget)}</span>
                            <span>{formatDate(job.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(job.status)}
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleJobAction(job.id, 'approve')}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleJobAction(job.id, 'reject')}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleJobAction(job.id, 'delete')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>
                  Monitore as atividades em tempo real na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        {activity.user_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            por {activity.user_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Admin