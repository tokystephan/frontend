import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, X, CheckCircle, XCircle, UserCheck, UserX, Shield, Users, Home, Clock } from 'lucide-react';
import Avatar from '../../components/Common/Avatar';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import axios from '../../api/axiosConfig';

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_id: '',
    department_id: '',
    approval_status: 'approved',
    is_active: true,
    password: '',
    password_confirmation: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0, byRole: {} });

  const roleOptions = [
    { id: 1, name: 'admin', display_name: 'Responsable RH', color: 'bg-blue-600' },
    { id: 2, name: 'assistant', display_name: 'Assistant RH', color: 'bg-blue-500' },
    { id: 3, name: 'consultant', display_name: 'Consultant', color: 'bg-green-600' },
    { id: 4, name: 'manager', display_name: 'Manager', color: 'bg-emerald-600' },
    { id: 5, name: 'direction', display_name: 'Direction', color: 'bg-amber-600' },
  ];

  const roleNeedsDepartment = (roleId) => [3, 4].includes(Number(roleId));
  const normalizeRoleName = (roleName) => String(roleName || '').toLowerCase().trim();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/users');
      // ✅ ACCÉDER CORRECTEMENT AUX UTILISATEURS
      const usersList = response.data.users || response.data.data || response.data;
      const usersArray = Array.isArray(usersList) ? usersList : [];
      setUsers(usersArray);
      calculateStats(usersArray);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Impossible de charger les utilisateurs.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get('/departments');
      setDepartments(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement départements:', error);
      setDepartments([]);
    }
  }, []);

  const calculateStats = (usersList) => {
    const active = usersList.filter(u => u.is_active).length;
    const inactive = usersList.filter(u => !u.is_active).length;
    const pending = usersList.filter(u => u.approval_status === 'pending').length;
    const byRole = {};
    usersList.forEach(user => {
      const roleName = user.role?.display_name || user.role?.name || 'Inconnu';
      byRole[roleName] = (byRole[roleName] || 0) + 1;
    });
    setStats({ total: usersList.length, active, inactive, pending, byRole });
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || normalizeRoleName(user.role?.name) === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    const matchesApproval = approvalFilter === 'all' || user.approval_status === approvalFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesApproval;
  });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        // ✅ CONVERTIR ROLE_ID EN STRING POUR COMPATIBILITÉ SELECT
        role_id: user.role?.id ? String(user.role.id) : '',
        department_id: user.department_id ? String(user.department_id) : '',
        approval_status: user.approval_status || 'approved',
        is_active: user.is_active,
        password: '',
        password_confirmation: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role_id: '',
        department_id: '',
        approval_status: 'approved',
        is_active: true,
        password: '',
        password_confirmation: '',
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role_id: '',
      department_id: '',
      approval_status: 'approved',
      is_active: true,
      password: '',
      password_confirmation: '',
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'Le prénom est requis';
    if (!formData.last_name.trim()) errors.last_name = 'Le nom est requis';
    if (!formData.email.trim()) errors.email = 'L\'email est requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email invalide';
    if (!formData.role_id) errors.role_id = 'Le rôle est requis';
    if (roleNeedsDepartment(formData.role_id) && formData.approval_status === 'approved' && !formData.department_id) {
      errors.department_id = 'Le département est requis pour ce rôle';
    }
    if (!editingUser) {
      if (!formData.password) errors.password = 'Le mot de passe est requis';
      else if (formData.password.length < 6) errors.password = 'Minimum 6 caractères';
      if (formData.password !== formData.password_confirmation)
        errors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        // ✅ CONVERTIR EN NOMBRE ENTIER OU NULL, JAMAIS STRING OU ARRAY
        role_id: formData.role_id ? parseInt(formData.role_id, 10) : null,
        department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
        ...(editingUser && !formData.password ? { password: undefined, password_confirmation: undefined } : {}),
      };

      if (editingUser) {
        await axios.put(`/admin/users/${editingUser.id}`, payload);
        toast.success('Utilisateur mis à jour');
      } else {
        await axios.post('/admin/users', payload);
        toast.success('Utilisateur créé');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        toast.error('Erreur de validation');
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas modifier votre propre compte');
      return;
    }
    try {
      const newStatus = !user.is_active;
      await axios.patch(`/admin/users/${user.id}/status`, { is_active: newStatus });
      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'}`);
      fetchUsers();
    } catch {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleApprovalChange = async (user, approvalStatus) => {
    if (user.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas valider votre propre compte');
      return;
    }

    const payload = { approval_status: approvalStatus };
    if (Number(user.role_id) === 4 && approvalStatus === 'approved') {
      const departmentId = user.department_id || '';
      if (!departmentId) {
        toast.error('Assignez d’abord un département au manager avant validation');
        handleOpenModal(user);
        return;
      }
      payload.department_id = departmentId;
    }

    try {
      await axios.patch(`/admin/users/${user.id}/approval`, payload);
      toast.success(approvalStatus === 'approved' ? 'Compte validé' : 'Compte refusé');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    if (window.confirm(`Supprimer ${user.first_name} ${user.last_name} ?`)) {
      try {
        await axios.delete(`/admin/users/${user.id}`);
        toast.success('Utilisateur supprimé');
        fetchUsers();
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getRoleBadgeClass = (roleName) => {
    const role = roleOptions.find(r => r.name === normalizeRoleName(roleName));
    return role ? role.color : 'bg-gray-600';
  };

  const getRoleDisplayName = (roleName) => {
    const role = roleOptions.find(r => r.name === normalizeRoleName(roleName));
    return role ? role.display_name : roleName || 'Inconnu';
  };

  const getApprovalBadge = (approvalStatus) => {
    switch (approvalStatus) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const getApprovalLabel = (approvalStatus) => {
    switch (approvalStatus) {
      case 'approved':
        return 'Validé';
      case 'rejected':
        return 'Refusé';
      case 'pending':
      default:
        return 'En attente';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Administration</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
              <p className="mt-1 text-sm text-gray-500">Gérer les comptes, les rôles et les permissions.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Nouvel utilisateur
              </button>
            </div>
          </div>
        </div>

        {/* ==================== STATISTIQUES ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard title="Total" value={stats.total} icon={<Users className="w-5 h-5" />} color="blue" />
          <StatCard title="Actifs" value={stats.active} icon={<UserCheck className="w-5 h-5" />} color="green" />
          <StatCard title="Inactifs" value={stats.inactive} icon={<UserX className="w-5 h-5" />} color="red" />
          <StatCard title="À valider" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="purple" />
        </div>

        {/* ==================== BARRE DE RECHERCHE ET FILTRES ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                {roleOptions.map(role => (
                  <option key={role.id} value={role.name}>{role.display_name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes validations</option>
                <option value="pending">En attente</option>
                <option value="approved">Validés</option>
                <option value="rejected">Refusés</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================== TABLEAU DES UTILISATEURS ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun utilisateur trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                            {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium text-white ${getRoleBadgeClass(user.role?.name)}`}>
                          {getRoleDisplayName(user.role?.name)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {user.department?.name || user.department_name || (roleNeedsDepartment(user.role_id) ? 'Non assigné' : '-')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="flex items-center gap-1.5 text-green-700 text-xs bg-green-100 px-2 py-1 rounded-full w-fit">
                            <CheckCircle className="w-3 h-3" /> Actif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-700 text-xs bg-red-100 px-2 py-1 rounded-full w-fit">
                            <XCircle className="w-3 h-3" /> Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getApprovalBadge(user.approval_status)}`}>
                          {getApprovalLabel(user.approval_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                            title={user.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          {user.approval_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprovalChange(user, 'approved')}
                                className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition"
                                title="Valider le compte"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleApprovalChange(user, 'rejected')}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                                title="Refuser le compte"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>

      {/* ==================== MODAL (responsive) ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingUser ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Prénom"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Nom"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formErrors.email && (
                <p className="text-xs text-red-600">{Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}</p>
              )}
              <div className="flex items-center justify-between gap-3">
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un rôle</option>
                  {roleOptions.map(r => (
                    <option key={r.id} value={r.id}>{r.display_name}</option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={!!formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
              </div>
              {formErrors.role_id && (
                <p className="text-xs text-red-600">{Array.isArray(formErrors.role_id) ? formErrors.role_id[0] : formErrors.role_id}</p>
              )}
              <select
                name="approval_status"
                value={formData.approval_status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">En attente</option>
                <option value="approved">Validé</option>
                <option value="rejected">Refusé</option>
              </select>
              {roleNeedsDepartment(formData.role_id) && (
                <div>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un département</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>{department.name}</option>
                    ))}
                  </select>
                  {formErrors.department_id && (
                    <p className="mt-1 text-xs text-red-600">{Array.isArray(formErrors.department_id) ? formErrors.department_id[0] : formErrors.department_id}</p>
                  )}
                </div>
              )}
              {/* Champs mot de passe (optionnels en modification) */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.password && (
                  <p className="text-xs text-red-600">{Array.isArray(formErrors.password) ? formErrors.password[0] : formErrors.password}</p>
                )}
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirmer"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.password_confirmation && (
                  <p className="text-xs text-red-600">{Array.isArray(formErrors.password_confirmation) ? formErrors.password_confirmation[0] : formErrors.password_confirmation}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? (editingUser ? 'Mise à jour...' : 'Création...') : (editingUser ? 'Mettre à jour' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
