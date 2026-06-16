import RoleGuard from './RoleGuard'

const AdminGuard = ({ children }) => {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>
}

export default AdminGuard
