import z from 'zod'

import { connections } from '../../db/schema.js'

export const requestConnectionSchema = z.object({
  recipientId: z.string(),
})

export const actionConnectionSchema = z.object({
  action: z.enum(['accept', 'reject']),
  requestId: z.string(),
})

export const getConnectionsSchema = z.object({
  reqBy: z.enum(['me', 'others']).optional(),
  status: z.enum(connections.status.enumValues).optional(),
})

export type GetConnectionsQuery = z.infer<typeof getConnectionsSchema>
