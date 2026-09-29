// Detective (the first theme) is capped at its first 4 cases for anyone
// without full access; every other theme is capped at just Case 1. Admins,
// and accounts an admin has upgraded to 'full', can go further in any theme.
export const RESTRICTED_THEME_ID = 'detective'
export const RESTRICTED_CASE_LIMIT = 4
export const RESTRICTED_OTHER_THEME_LIMIT = 1

export function canAccessCase(themeId, caseNumber, { hasFullAccess }) {
  if (hasFullAccess) return true
  const limit = themeId === RESTRICTED_THEME_ID ? RESTRICTED_CASE_LIMIT : RESTRICTED_OTHER_THEME_LIMIT
  return caseNumber <= limit
}

// Combines the tier cap above with sequential progress: even a full-access
// account still has to complete cases in order (no skipping ahead), and can
// always go back to replay/view/edit anything already reached. Only an
// admin bypasses both checks entirely, to freely review any case or step.
export function canEnterCase(themeId, caseNumber, { hasFullAccess, isAdmin, furthestCaseNumber }) {
  if (isAdmin) return true
  if (!canAccessCase(themeId, caseNumber, { hasFullAccess })) return false
  return caseNumber <= furthestCaseNumber
}
