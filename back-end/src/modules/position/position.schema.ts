import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { teamsTable } from "../team/team.schema";

export const positionStatusEnum = pgEnum("position_status", ["OPEN", "CLOSED"]);

export type PositionStatus = (typeof positionStatusEnum.enumValues)[number];

export const positionsTable = pgTable("positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teamsTable.id),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description"),
  status: positionStatusEnum("status").notNull().default("OPEN"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
