// Mock data service for offline functionality
export interface MockUser {
  id: string;
  email: string;
  name: string;
  user_type: 'client' | 'freelancer';
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  location?: string;
  created_at: string;
}

export interface MockJob {
  id: string;
  title: string;
  description: string;
  budget: number;
  client_id: string;
  client_name: string;
  skills_required: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  deadline?: string;
}

export interface MockProposal {
  id: string;
  job_id: string;
  freelancer_id: string;
  freelancer_name: string;
  message: string;
  proposed_rate: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface MockReview {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Default mock data
const defaultUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'cliente@exemplo.com',
    name: 'João Cliente',
    user_type: 'client',
    avatar_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20business%20person%20avatar&image_size=square',
    bio: 'Empresário em busca de talentos para projetos inovadores.',
    location: 'São Paulo, SP',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-2',
    email: 'freelancer@exemplo.com',
    name: 'Maria Freelancer',
    user_type: 'freelancer',
    avatar_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20developer%20woman%20avatar&image_size=square',
    bio: 'Desenvolvedora Full Stack com 5 anos de experiência.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python'],
    hourly_rate: 80,
    location: 'Rio de Janeiro, RJ',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-3',
    email: 'designer@exemplo.com',
    name: 'Carlos Designer',
    user_type: 'freelancer',
    avatar_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20designer%20man%20avatar&image_size=square',
    bio: 'Designer UX/UI especializado em interfaces modernas.',
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
    hourly_rate: 60,
    location: 'Belo Horizonte, MG',
    created_at: new Date().toISOString()
  }
];

const defaultJobs: MockJob[] = [
  {
    id: 'job-1',
    title: 'Desenvolvimento de E-commerce',
    description: 'Preciso de um desenvolvedor para criar uma loja online completa com sistema de pagamento.',
    budget: 5000,
    client_id: 'user-1',
    client_name: 'João Cliente',
    skills_required: ['React', 'Node.js', 'MongoDB'],
    status: 'open',
    created_at: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-2',
    title: 'Design de Aplicativo Mobile',
    description: 'Busco um designer para criar a interface de um aplicativo de delivery.',
    budget: 2500,
    client_id: 'user-1',
    client_name: 'João Cliente',
    skills_required: ['Figma', 'UI/UX Design', 'Mobile Design'],
    status: 'open',
    created_at: new Date().toISOString(),
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const defaultProposals: MockProposal[] = [
  {
    id: 'proposal-1',
    job_id: 'job-1',
    freelancer_id: 'user-2',
    freelancer_name: 'Maria Freelancer',
    message: 'Tenho experiência em e-commerce e posso entregar um projeto de qualidade.',
    proposed_rate: 80,
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

const defaultReviews: MockReview[] = [
  {
    id: 'review-1',
    reviewer_id: 'user-1',
    reviewed_id: 'user-2',
    reviewer_name: 'João Cliente',
    rating: 5,
    comment: 'Excelente trabalho, muito profissional e pontual.',
    created_at: new Date().toISOString()
  }
];

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'pulseconnect_users',
  JOBS: 'pulseconnect_jobs',
  PROPOSALS: 'pulseconnect_proposals',
  REVIEWS: 'pulseconnect_reviews',
  CURRENT_USER: 'pulseconnect_current_user',
  IS_OFFLINE_MODE: 'pulseconnect_offline_mode'
};

// Mock data service class
export class MockDataService {
  private static instance: MockDataService;

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  // Initialize mock data if not exists
  initializeData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(defaultJobs));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROPOSALS)) {
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(defaultProposals));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(defaultReviews));
    }
  }

  // User methods
  getUsers(): MockUser[] {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  getUserById(id: string): MockUser | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  getUserByEmail(email: string): MockUser | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  createUser(userData: Omit<MockUser, 'id' | 'created_at'>): MockUser {
    const users = this.getUsers();
    const newUser: MockUser = {
      ...userData,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  updateUser(id: string, updates: Partial<MockUser>): MockUser | null {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[userIndex];
  }

  // Job methods
  getJobs(): MockJob[] {
    const jobs = localStorage.getItem(STORAGE_KEYS.JOBS);
    return jobs ? JSON.parse(jobs) : [];
  }

  getJobById(id: string): MockJob | null {
    const jobs = this.getJobs();
    return jobs.find(job => job.id === id) || null;
  }

  createJob(jobData: Omit<MockJob, 'id' | 'created_at'>): MockJob {
    const jobs = this.getJobs();
    const newJob: MockJob = {
      ...jobData,
      id: `job-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    jobs.push(newJob);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return newJob;
  }

  // Proposal methods
  getProposals(): MockProposal[] {
    const proposals = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
    return proposals ? JSON.parse(proposals) : [];
  }

  getProposalsByJob(jobId: string): MockProposal[] {
    const proposals = this.getProposals();
    return proposals.filter(proposal => proposal.job_id === jobId);
  }

  createProposal(proposalData: Omit<MockProposal, 'id' | 'created_at'>): MockProposal {
    const proposals = this.getProposals();
    const newProposal: MockProposal = {
      ...proposalData,
      id: `proposal-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    proposals.push(newProposal);
    localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
    return newProposal;
  }

  // Review methods
  getReviews(): MockReview[] {
    const reviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return reviews ? JSON.parse(reviews) : [];
  }

  getReviewsByUser(userId: string): MockReview[] {
    const reviews = this.getReviews();
    return reviews.filter(review => review.reviewed_id === userId);
  }

  createReview(reviewData: Omit<MockReview, 'id' | 'created_at'>): MockReview {
    const reviews = this.getReviews();
    const newReview: MockReview = {
      ...reviewData,
      id: `review-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    reviews.push(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    return newReview;
  }

  // Current user methods
  setCurrentUser(user: MockUser): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getCurrentUser(): MockUser | null {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  }

  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Offline mode methods
  setOfflineMode(isOffline: boolean): void {
    localStorage.setItem(STORAGE_KEYS.IS_OFFLINE_MODE, JSON.stringify(isOffline));
  }

  isOfflineMode(): boolean {
    const isOffline = localStorage.getItem(STORAGE_KEYS.IS_OFFLINE_MODE);
    return isOffline ? JSON.parse(isOffline) : false;
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();