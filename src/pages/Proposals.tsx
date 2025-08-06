import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/Card'
import { Button } from '../components/Button'
import { Input, TextArea, Select } from '../components/Input'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Filter, Send, Clock, CheckCircle, XCircle, DollarSign, Calendar, User, Briefcase } from 'lucide-react'

interface Proposal {
  id: string
  job_id: string
  freelancer_id: string
  client_id: string
  amount: number
  delivery_time: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  job?: {
    title: string
    description: string
    budget: number
    category: string
  }
  freelancer?: {
    full_name: string
    avatar_url?: string
    rating_avg?: number
  }
  client?: {
    full_name: string
    avatar_url?: string
  }
}

interface Job {
  id: string
  title: string
  description: string
  budget: number
  category: string
  client_id: string
}

function Proposals() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewProposal, setShowNewProposal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [newProposal, setNewProposal] = useState({
    amount: '',
    delivery_time: '',
    message: ''
  })

  useEffect(() => {
    if (user) {
      loadProposals()
      loadAvailableJobs()
    }
  }, [user])

  const loadProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          job:jobs(*),
          freelancer:user_profiles!proposals_freelancer_id_fkey(*),
          client:user_profiles!proposals_client_id_fkey(*)
        `)
        .or(`freelancer_id.eq.${user?.id},client_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProposals(data || [])
    } catch (error) {
      console.error('Erro ao carregar propostas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .neq('client_id', user?.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Erro ao carregar jobs:', error)
    }
  }

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob || !user) return

    try {
      const { error } = await supabase
        .from('proposals')
        .insert({
          job_id: selectedJob.id,
          freelancer_id: user.id,
          proposed_price: parseFloat(newProposal.amount),
          delivery_days: parseInt(newProposal.delivery_time),
          message: newProposal.message,
          status: 'pending'
        })

      if (error) throw error

      setNewProposal({ amount: '', delivery_time: '', message: '' })
      setSelectedJob(null)
      setShowNewProposal(false)
      loadProposals()
      alert('Proposta enviada com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar proposta:', error)
      alert('Erro ao enviar proposta')
    }
  }

  const handleUpdateProposalStatus = async (proposalId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', proposalId)

      if (error) throw error
      loadProposals()
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error)
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.freelancer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'accepted': return 'Aceita'
      case 'rejected': return 'Rejeitada'
      default: return 'Desconhecido'
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
              Propostas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas propostas e envie novas ofertas
            </p>
          </div>
          <Button
            onClick={() => setShowNewProposal(true)}
            className="mt-4 md:mt-0"
          >
            <Send className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por projeto ou freelancer..."
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
            <option value="pending">Pendente</option>
            <option value="accepted">Aceita</option>
            <option value="rejected">Rejeitada</option>
          </Select>
        </div>

        {/* Proposals List */}
        <div className="grid gap-6">
          {filteredProposals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhuma proposta encontrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Você ainda não tem propostas. Comece enviando uma nova proposta!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {proposal.job?.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {proposal.freelancer_id === user?.id
                            ? `Cliente: ${proposal.client?.full_name}`
                            : `Freelancer: ${proposal.freelancer?.full_name}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(proposal.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(proposal.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-lg">
                          {formatCurrency(proposal.amount)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Prazo: {proposal.delivery_time} dias
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Orçamento do projeto
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(proposal.job?.budget || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Mensagem da Proposta:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {proposal.message}
                    </p>
                  </div>
                </CardContent>
                {proposal.status === 'pending' && proposal.client_id === user?.id && (
                  <CardFooter>
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="primary"
                        onClick={() => handleUpdateProposalStatus(proposal.id, 'accepted')}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aceitar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateProposalStatus(proposal.id, 'rejected')}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>

        {/* New Proposal Modal */}
        {showNewProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Nova Proposta</h2>
                
                {!selectedJob ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Selecione um Projeto</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {jobs.map((job) => (
                        <Card
                          key={job.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedJob(job)}
                        >
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">{job.title}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">{job.category}</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(job.budget)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProposal}>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Projeto Selecionado</h3>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold">{selectedJob.title}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            Orçamento: {formatCurrency(selectedJob.budget)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Valor da Proposta (R$)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newProposal.amount}
                          onChange={(e) => setNewProposal(prev => ({ ...prev, amount: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Prazo de Entrega (dias)
                        </label>
                        <Input
                          type="number"
                          value={newProposal.delivery_time}
                          onChange={(e) => setNewProposal(prev => ({ ...prev, delivery_time: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Mensagem da Proposta
                      </label>
                      <TextArea
                        value={newProposal.message}
                        onChange={(e) => setNewProposal(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Descreva sua proposta, experiência relevante e como você pretende executar o projeto..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Proposta
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewProposal(false)
                          setSelectedJob(null)
                          setNewProposal({ amount: '', delivery_time: '', message: '' })
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Proposals