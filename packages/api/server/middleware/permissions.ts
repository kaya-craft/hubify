import type { H3Event } from 'h3'

export default defineEventHandler(async (event) => {
  const db = useDatabase()

  const session = await getUserSession(event)
  const userId = session.user?.id

  const role = await db.find('hubify_roles', {
    fields: ['admin', 'id'],
    where: { 'users.id': { $eq: userId } },
    limit: 1
  })

  const permissions = await db.find('hubify_users', {
    fields: [
      'role.policies.permissions.id',
      'role.policies.permissions.action',
      'role.policies.permissions.collection',
      'role.policies.permissions.where'
    ],
    where: {
      'id': { $eq: userId },
      'role.policies.permissions.action': {
        $eq: getRequiredAction(event)
      },
      'role.policies.permissions.collection': {
        $eq: getRouterParam(event, 'collection')
      }
    }
  })

  if (!permissions.length) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  console.log('User permissions:', permissions)

  event.context.permissions = permissions
})

/**
 * Get the required action based on the HTTP method.
 */
function getRequiredAction(event: H3Event) {
  switch (event.method) {
    case 'GET':
      return 'read'
    case 'POST':
      return 'create'
    case 'PUT':
    case 'PATCH':
      return 'update'
    case 'DELETE':
      return 'delete'
    default:
      return null
  }
}
