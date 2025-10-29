import type { H3Event } from 'h3'
import type { PERMISSION_ACTIONS } from '@@/schema/hubify/permissions'
import { whereValidation } from '@hubify/api/validation'
import type { QueryParams } from '@hubify/api/types/schema'

export const TEST_PERMISSIONS_HEADER = 'X-Hubify-Permissions'

/**
 * Get the role of the current user
 */
export async function getUserRole(event: H3Event) {
  if (!event.context.role) {
    const db = useDatabase()

    const session = await getUserSession(event)
    const userId = session.user?.id

    const [role] = await db.find('hubify_roles', {
      fields: ['admin', 'id'],
      where: { 'users.id': { $eq: userId } },
      limit: 1
    })

    event.context.role = role
  }

  return event.context.role
}

/**
 * Check if the user is admin.
 */
export async function isUserAdmin(event: H3Event) {
  const role = await getUserRole(event)
  return !!role?.admin
}

/**
 * Check if a permissions test value is set.
 */
export async function isTestingPermissions(event: H3Event) {
  return await isUserAdmin(event) && !!getTestPermissionsHeader(event)
}

/**
 *
 * Get test permissions header.
 */
export function getTestPermissionsHeader(event: H3Event) {
  const value = getHeader(event, TEST_PERMISSIONS_HEADER)

  if (isString(value)) {
    return JSON.parse(value) as TableItem<'hubify_permissions'>[]
  }
}

/**
 * Check if the user has the required permission.
 */
export async function userHasPermission<T extends TableNames>(
  event: H3Event,
  options: Options<T>
) {
  const role = await getUserRole(event)
  const testPermissions = role?.admin && getTestPermissionsHeader(event)

  if (role?.admin && !testPermissions) return {
    where: [],
    shouldProceed: true
  }

  const permissions = await getPermissionsList(event, options, testPermissions)

  if (!permissions.length) return false

  return {
    shouldProceed: !testPermissions,
    where: permissions.flatMap(p => p.where).filter(isNonNullish).map(value => JSON.parse(value))
  }
}

/**
 * Get application permissions for a specific collection and action.
 */
async function getPermissionsList<T extends TableNames>(event: H3Event, options: Options<T>, testPermissions?: TableItem<'hubify_permissions'>[]) {
  if (testPermissions) {
    return testPermissions.filter((permission) => {
      return permission.collection === options.collection && permission.action.includes(options.action)
    })
  }

  const db = useDatabase()
  const role = await getUserRole(event)

  const permissions = await db.find('hubify_permissions', {
    where: {
      'policies.roles.id': role ? { $eq: role.id } : { $null: true },
      'collection.name': { $eq: options.collection },
      'action': { $contains: options.action }
    }
  })

  return permissions
}

/**
 * Ensure the user has the required permission.
 */
export async function ensureUserHasPermission<T extends TableNames>(event: H3Event, options: Options<T>) {
  const result = await userHasPermission(event, options)

  if (!result) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  if (options.params && result.where?.length) {
    const where = await whereValidation(options.collection).parse({ $and: result.where })
    options.params.where = { $and: [options.params.where, where].filter(isNonNullish) } as QueryParams<T>['where']
  }

  return result.shouldProceed
}

interface Options<T extends TableNames> {
  action: typeof PERMISSION_ACTIONS[number]
  collection: T
  params?: QueryParams<T>
  item?: Partial<TableItem<T>>
}
