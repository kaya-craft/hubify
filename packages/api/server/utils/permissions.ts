import type { H3Event } from 'h3'
import type { PERMISSION_ACTIONS } from '@@/schema/hubify/permissions'
import { whereValidation } from '@hubify/api/validation'
import type { QueryParams } from '@hubify/api/types/schema'

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
 * Check if the user has the required permission.
 */
export async function userHasPermission<T extends TableNames>(
  event: H3Event,
  options: Options<T>
) {
  const db = useDatabase()
  const role = await getUserRole(event)

  if (role?.admin) return {}

  const permissions = await db.find('hubify_permissions', {
    fields: ['where'],
    where: {
      'policies.roles.id': role ? { $eq: role.id } : { $null: true },
      'collection.name': { $eq: options.collection },
      'action': { $eq: options.action }
    }
  })

  if (!permissions.length) return false

  return {
    where: permissions.flatMap(p => p.where).filter(isNonNullish).map(value => JSON.parse(value))
  }
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

  return true
}

interface Options<T extends TableNames> {
  action: typeof PERMISSION_ACTIONS[number]
  collection: T
  params?: QueryParams<T>
  item?: Partial<TableItem<T>>
}
