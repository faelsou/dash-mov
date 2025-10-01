import React, { useMemo, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Users, 
  Bell, 
  Shield, 
  Palette, 
  Monitor,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Moon,
  Sun,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: 'executivo' | 'secretaria' | 'operacional';
  status: 'Ativo' | 'Inativo';
  password: string;
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('connection');
  const [showApiKey, setShowApiKey] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    apiKey: '',
    sheetId: '1HJxcgh4yJit10flPdHcLWkSH34CGLLU4MLV8GhEOKGs',
    sheetRange: 'Sheet1!A:U',
    autoRefresh: true,
    refreshInterval: 5,
    notifications: true,
    theme: theme,
    displayMode: 'monitor'
  });
  const [users, setUsers] = useState<ManagedUser[]>([
    { id: '1', name: 'João Executivo', email: 'executivo@moveis.com', role: 'executivo', status: 'Ativo', password: 'exec123' },
    { id: '2', name: 'Maria Secretária', email: 'secretaria@moveis.com', role: 'secretaria', status: 'Ativo', password: 'sec123' },
    { id: '3', name: 'Carlos Operacional', email: 'operacional@moveis.com', role: 'operacional', status: 'Ativo', password: 'op123' }
  ]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'operacional' as ManagedUser['role'],
    password: '',
    status: 'Ativo' as ManagedUser['status']
  });
  const [showAddUser, setShowAddUser] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [showEditingPassword, setShowEditingPassword] = useState(false);

  const tabs = [
    { id: 'connection', name: 'Conexão', icon: Database },
    { id: 'users', name: 'Usuários', icon: Users },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'display', name: 'Exibição', icon: Monitor }
  ];

  const canManageUsers = useMemo(() => user?.role === 'executivo', [user]);

  const handleSave = () => {
    // Salvar configurações no localStorage
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
  };

  const testConnection = async () => {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${settings.sheetId}/export?format=csv&gid=0`;
      const response = await fetch(csvUrl);
      if (response.ok) {
        alert('✅ Conexão testada com sucesso!');
      } else {
        alert('❌ Erro na conexão. Verifique o ID da planilha.');
      }
    } catch (error) {
      alert('❌ Erro ao testar conexão.');
    }
  };

  const addUser = () => {
    if (!canManageUsers) {
      return;
    }

    if (newUser.name && newUser.email && newUser.password) {
      const userToAdd: ManagedUser = {
        id: Date.now().toString(),
        ...newUser
      };
      setUsers([...users, userToAdd]);
      setNewUser({ name: '', email: '', role: 'operacional', password: '', status: 'Ativo' });
      setShowNewUserPassword(false);
      setShowAddUser(false);
    }
  };

  const removeUser = (id: string) => {
    if (!canManageUsers) {
      return;
    }

    setUsers(users.filter(user => user.id !== id));
  };

  const startEditUser = (userToEdit: ManagedUser) => {
    if (!canManageUsers) {
      return;
    }

    setEditingUser({ ...userToEdit });
    setShowEditingPassword(false);
  };

  const saveEditedUser = () => {
    if (!canManageUsers || !editingUser) {
      return;
    }

    if (editingUser.name && editingUser.email && editingUser.password) {
      setUsers(users.map(userItem => userItem.id === editingUser.id ? editingUser : userItem));
      setEditingUser(null);
      setShowEditingPassword(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'executivo': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'secretaria': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'operacional': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const renderConnectionTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Status da Conexão</h4>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-700 dark:text-green-400">Conectado à planilha pública</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ID da Planilha Google Sheets
          </label>
          <input
            type="text"
            value={settings.sheetId}
            onChange={(e) => setSettings({...settings, sheetId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="1HJxcgh4yJit10flPdHcLWkSH34CGLLU4MLV8GhEOKGs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Intervalo de Dados
          </label>
          <input
            type="text"
            value={settings.sheetRange}
            onChange={(e) => setSettings({...settings, sheetRange: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Sheet1!A:U"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chave da API Google (Opcional)
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Para planilhas privadas"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Atualização Automática</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Buscar novos dados automaticamente</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={(e) => setSettings({...settings, autoRefresh: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {settings.autoRefresh && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intervalo de Atualização (minutos)
            </label>
            <select
              value={settings.refreshInterval}
              onChange={(e) => setSettings({...settings, refreshInterval: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={1}>1 minuto</option>
              <option value={5}>5 minutos</option>
              <option value={10}>10 minutos</option>
              <option value={30}>30 minutos</option>
            </select>
          </div>
        )}

        <button
          onClick={testConnection}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Testar Conexão</span>
        </button>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usuários do Sistema</h3>
        <button
          onClick={() => canManageUsers && setShowAddUser(true)}
          disabled={!canManageUsers}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            canManageUsers
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Usuário</span>
        </button>
      </div>

      {!canManageUsers && (
        <div className="flex items-center space-x-3 rounded-lg border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10 px-4 py-3 text-yellow-800 dark:text-yellow-200">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">Somente usuários executivos podem gerenciar usuários e senhas.</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <div key={user.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">{user.status}</span>
                </span>
                {canManageUsers && (
                  <>
                    <button
                      onClick={() => startEditUser(user)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeUser(user.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && canManageUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Adicionar Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as ManagedUser['role']})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="operacional">Operacional</option>
                  <option value="secretaria">Secretaria</option>
                  <option value="executivo">Executivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({...newUser, status: e.target.value as ManagedUser['status']})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && canManageUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Editar Usuário</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value as ManagedUser['role'] } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="operacional">Operacional</option>
                  <option value="secretaria">Secretaria</option>
                  <option value="executivo">Executivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showEditingPassword ? 'text' : 'password'}
                    value={editingUser.password}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, password: e.target.value } : prev)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditingPassword(!showEditingPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showEditingPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, status: e.target.value as ManagedUser['status'] } : prev)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveEditedUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Notificações Push</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Receber alertas sobre atualizações de dados</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Alertas de Performance</h4>
          <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>• Vendas abaixo da meta mensal</p>
            <p>• Margem de lucro inferior a 15%</p>
            <p>• Projetos com atraso na entrega</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Tema</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">Alternar entre tema claro e escuro</p>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>{theme === 'light' ? 'Escuro' : 'Claro'}</span>
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Modo de Exibição
        </label>
        <select
          value={settings.displayMode}
          onChange={(e) => setSettings({...settings, displayMode: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="monitor">Monitor de Departamento</option>
          <option value="desktop">Desktop</option>
          <option value="tablet">Tablet</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-600 dark:bg-gray-700 p-2 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Gerencie as configurações do sistema</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              {activeTab === 'connection' && renderConnectionTab()}
              {activeTab === 'users' && renderUsersTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'security' && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Configurações de Segurança</h3>
                  <p className="text-gray-600 dark:text-gray-300">Funcionalidade em desenvolvimento</p>
                </div>
              )}
              {activeTab === 'display' && renderDisplayTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};