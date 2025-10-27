import { useState } from 'react';
import { 
  User, 
  Wallet, 
  TrendingUp, 
  FileText, 
  Award, 
  Settings, 
  BarChart3, 
  DollarSign,
  Eye,
  Users,
  ToggleLeft
} from 'lucide-react';

type UserRole = 'user' | 'investor';

interface UserStats {
  projectsCreated: number;
  totalFunding: number;
  successRate: number;
  activeProjects: number;
}

interface InvestorStats {
  totalInvested: number;
  activeInvestments: number;
  successfulPredictions: number;
  portfolioValue: number;
}

export function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isConnected, setIsConnected] = useState(true); // For demo always connected

  // Mock user data
  const [userProfile] = useState({
    name: 'Elena Kovalenko',
    email: 'elena.kovalenko@example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    joinedDate: new Date('2025-01-15'),
    avatar: null,
  });

  const userStats: UserStats = {
    projectsCreated: 3,
    totalFunding: 45000,
    successRate: 67,
    activeProjects: 2,
  };

  const investorStats: InvestorStats = {
    totalInvested: 12500,
    activeInvestments: 8,
    successfulPredictions: 15,
    portfolioValue: 14200,
  };

  const recentProjects = [
    {
      id: '1',
      title: 'ScribeAI: AI-Powered Writing Assistant',
      status: 'active',
      funding: 15000,
      progress: 60,
    },
    {
      id: '2',
      title: 'EcoTrack: Carbon Footprint Monitor',
      status: 'completed',
      funding: 22000,
      progress: 100,
    },
    {
      id: '3',
      title: 'LearnHub: Interactive Language Platform',
      status: 'in_review',
      funding: 8000,
      progress: 85,
    },
  ];

  const recentInvestments = [
    {
      id: '1',
      title: 'ScribeAI: AI-Powered Writing Assistant',
      invested: 2500,
      currentValue: 2850,
      change: 14,
      status: 'active',
    },
    {
      id: '2',
      title: 'EcoTrack: Carbon Footprint Monitor',
      invested: 1500,
      currentValue: 1950,
      change: 30,
      status: 'completed',
    },
    {
      id: '3',
      title: 'MedConnect: Telemedicine Platform',
      invested: 3000,
      currentValue: 2700,
      change: -10,
      status: 'active',
    },
  ];

  const handleRoleSwitch = () => {
    setUserRole(userRole === 'user' ? 'investor' : 'user');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-light bg-emerald-light/10';
      case 'completed': return 'text-blue-500 bg-blue-500/10';
      case 'in_review': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'in_review': return 'Under Review';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Dashboard
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Manage your projects and investments
            </p>
          </div>
          
          {/* Role Switch */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-1 bg-[var(--bg-secondary)] rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={handleRoleSwitch}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  userRole === 'user'
                    ? 'bg-emerald-light text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <User className="w-4 h-4" />
                User
              </button>
              <button
                onClick={handleRoleSwitch}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  userRole === 'investor'
                    ? 'bg-emerald-light text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Investor
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <ToggleLeft className="w-4 h-4" />
              Demo Mode
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-emerald-light rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {userProfile.name}
                </h2>
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-light/10 text-emerald-dark dark:text-emerald-light text-xs rounded-full">
                  <Wallet className="w-3 h-3" />
                  Connected
                </div>
              </div>
              <p className="text-[var(--text-muted)] mb-2">{userProfile.email}</p>
              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                <span>Wallet: {userProfile.walletAddress.slice(0, 6)}...{userProfile.walletAddress.slice(-4)}</span>
                <span>Joined: {formatDate(userProfile.joinedDate)}</span>
              </div>
            </div>
            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userRole === 'user' ? (
            <>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-emerald-light" />
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {userStats.projectsCreated}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Projects Created</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-emerald-light" />
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    ${userStats.totalFunding.toLocaleString()}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Total Funding</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-emerald-light" />
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {userStats.successRate}%
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Success Rate</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="w-8 h-8 text-emerald-light" />
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {userStats.activeProjects}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Active Projects</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-emerald-light" />
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    ${investorStats.totalInvested.toLocaleString()}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Total Investments</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 text-emerald-light" />
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {investorStats.activeInvestments}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Active Investments</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-emerald-light" />
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    {investorStats.successfulPredictions}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Successful Predictions</p>
              </div>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-emerald-light" />
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    ${investorStats.portfolioValue.toLocaleString()}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Portfolio Value</p>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            {userRole === 'user' ? 'My Projects' : 'My Investments'}
          </h3>
          
          <div className="space-y-4">
            {(userRole === 'user' ? recentProjects : recentInvestments).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--text-primary)] mb-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    {userRole === 'user' ? (
                      <>
                        <span>Funding: ${item.funding.toLocaleString()}</span>
                        <span>Progress: {(item as any).progress}%</span>
                      </>
                    ) : (
                      <>
                        <span>Invested: ${(item as any).invested.toLocaleString()}</span>
                        <span>Current Value: ${(item as any).currentValue.toLocaleString()}</span>
                        <span className={(item as any).change >= 0 ? 'text-emerald-light' : 'text-ruby'}>
                          {(item as any).change >= 0 ? '+' : ''}{(item as any).change}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
