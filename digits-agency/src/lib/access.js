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
