import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  hostname: text("hostname").notNull().unique(),
  status: text("status").notNull(),
  platform: text("platform"),
  lastSeen: timestamp("last_seen").notNull(),
  ip: text("ip"),
  username: text("username"),
  connectionType: text("connection_type"), // "lan", "ethernet", "wifi", "unknown"
  adapterName: text("adapter_name"), // Name of the network adapter
  adapterStatus: text("adapter_status"), // "connected", "disconnected"
  healthScore: integer("health_score"), // 0-100 network health score
  uptimePercentage: integer("uptime_percentage"), // 24h uptime percentage
  avgResponseTime: integer("avg_response_time"), // Average ping response time in ms
});

export const agentEvents = pgTable("agent_events", {
  id: serial("id").primaryKey(),
  hostname: text("hostname").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  duration: integer("duration"), // in milliseconds
  connectionType: text("connection_type"), // "lan", "ethernet", "wifi", "unknown"
  adapterName: text("adapter_name"), // Name of the network adapter that changed
});

export const configuration = pgTable("configuration", {
  id: serial("id").primaryKey(),
  dashboardIP: text("dashboard_ip").notNull(),
  pingIP: text("ping_ip").notNull(),
  intervalMs: integer("interval_ms").notNull(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
});

export const insertAgentEventSchema = createInsertSchema(agentEvents).omit({
  id: true,
}).extend({
  connectionType: z.string().nullable().optional(),
  adapterName: z.string().nullable().optional(),
});

export const insertConfigurationSchema = createInsertSchema(configuration).omit({
  id: true,
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type AgentEvent = typeof agentEvents.$inferSelect;
export type InsertAgentEvent = z.infer<typeof insertAgentEventSchema>;
export type Configuration = typeof configuration.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;

// WebSocket message types
export const agentStatusSchema = z.object({
  hostname: z.string(),
  status: z.enum(['connected', 'disconnected']),
  timestamp: z.string(),
  platform: z.string().optional(),
  userInfo: z.string().optional(),
  ip: z.string().optional(),
  connectionType: z.enum(['lan', 'ethernet', 'wifi', 'unknown']).optional(),
  adapterName: z.string().optional(),
  adapterStatus: z.enum(['connected', 'disconnected']).optional(),
  allAdapters: z.array(z.object({
    name: z.string(),
    connectionId: z.string(),
    type: z.string(),
    status: z.string()
  })).optional(),
  connectivityDetails: z.object({
    router: z.boolean(),
    target: z.boolean(),
    internet: z.boolean()
  }).optional(),
});

export type AgentStatus = z.infer<typeof agentStatusSchema>;
