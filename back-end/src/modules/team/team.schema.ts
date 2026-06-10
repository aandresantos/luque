import { pgTable, uuid } from 'drizzle-orm/pg-core'

export const teamsTable = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
})
