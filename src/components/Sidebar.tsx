import React from 'react';
import { 
  BarChart3, 
  Kanban, 
  LogOut, 
  User,
  Settings,
  Home,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const getPermissions = (role: string) => {
    switch (role) {
      case 'executivo':
        return ['dashboard', 'kanban', 'leads', 'settings'];
      case 'vendedor':
        return ['dashboard', 'kanban', 'leads'];
      case 'operacional':
        return ['kanban'];
      default:
        return [];
    }
  };

  const permissions = getPermissions(user?.role || '');

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Análise de vendas'
    },
    {
      id: 'kanban',
      name: 'Produção',
      icon: Kanban,
      description: 'Status de fabricação'
    },
    {
      id: 'leads',
      name: 'Leads',
      icon: Users,
      description: 'Pipeline de vendas'
    },
    {
      id: 'settings',
      name: 'Configurações',
      icon: Settings,
      description: 'Configurações do sistema'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => permissions.includes(item.id));

  return (
    <div className="bg-white dark:bg-gray-800 h-screen w-64 shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Móveis Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Controle de Vendas</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=3B82F6&color=fff`}
            alt={user?.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};