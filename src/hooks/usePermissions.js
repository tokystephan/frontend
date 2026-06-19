import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { hasPermission } from '../utils/permissions'

const normalizeRole = (roleValue) => {
  if (typeof roleValue === 'string') {
    const normalized = roleValue.toLowerCase()
    return normalized
  }
  if (roleValue && typeof roleValue === 'object' && typeof roleValue.name === 'string') {
    const normalized = roleValue.name.toLowerCase()
    return normalized
  }
  return undefined
}

const usePermissions = () => {
  const roleName = useSelector((state) => normalizeRole(state.auth.user?.role || state.auth.user?.roleName))

  const permissions = useMemo(
    () => ({
      canManageUsers: hasPermission(roleName, 'canManageUsers'),
      canManagePosts: hasPermission(roleName, 'canManagePosts'),
      canManageCandidates: hasPermission(roleName, 'canManageCandidates'),
      canDeleteInterviews: hasPermission(roleName, 'canDeleteInterviews'),
      canManageApplications: hasPermission(roleName, 'canManageApplications'),
      canCreateApplication: hasPermission(roleName, 'canCreateApplication'),
      canEditApplication: hasPermission(roleName, 'canEditApplication'),
      canViewStats: hasPermission(roleName, 'canViewStats'),
      canArchivePosts: hasPermission(roleName, 'canArchivePosts'),
      canChangeFinalStatus: hasPermission(roleName, 'canChangeFinalStatus'),
      canSchedulePhoneInterview: hasPermission(roleName, 'canSchedulePhoneInterview'),
      canScheduleHRInterview: hasPermission(roleName, 'canScheduleHRInterview'),
      canScheduleTechnicalInterview: hasPermission(roleName, 'canScheduleTechnicalInterview'),
      canScheduleBusinessInterview: hasPermission(roleName, 'canScheduleBusinessInterview'),
      canScheduleFinalInterview: hasPermission(roleName, 'canScheduleFinalInterview'),
      canScheduleRecruitmentCommittee: hasPermission(roleName, 'canScheduleRecruitmentCommittee'),
      canViewAllInterviews: hasPermission(roleName, 'canViewAllInterviews'),
      canCreateInterview: hasPermission(roleName, 'canCreateInterview'),
      canEditInterview: hasPermission(roleName, 'canEditInterview'),
      canCancelInterview: hasPermission(roleName, 'canCancelInterview'),
      canDeleteInterview: hasPermission(roleName, 'canDeleteInterview'),
      canViewAllReports: hasPermission(roleName, 'canViewAllReports'),
      canAddInterviewReport: hasPermission(roleName, 'canAddInterviewReport'),
      canEditInterviewReport: hasPermission(roleName, 'canEditInterviewReport'),
      canEditAnyInterviewReport: hasPermission(roleName, 'canEditAnyInterviewReport'),
      canViewInterviewReport: hasPermission(roleName, 'canViewInterviewReport'),
      canDeleteInterviewReport: hasPermission(roleName, 'canDeleteInterviewReport'),
      canExportInterviewReport: hasPermission(roleName, 'canExportInterviewReport'),
      canValidateInterviewReport: hasPermission(roleName, 'canValidateInterviewReport'),
      canValidateOfferAfterReport: hasPermission(roleName, 'canValidateOfferAfterReport'),
    }),
    [roleName],
  )

  return { roleName, ...permissions }
}

export default usePermissions
