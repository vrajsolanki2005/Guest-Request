export type RequestStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type RequestCategory =
  | "HOUSEKEEPING"
  | "MAINTENANCE"
  | "ROOM_SERVICE"
  | "RECEPTION"
  | "OTHER";

export type RequestItem = {
  id: string;
  category: RequestCategory;
  priority: RequestPriority;
  description: string;
  status: RequestStatus;
  slaDeadline: string | null;
  escalatedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;

  room: { id: string; roomNumber: string };
  guest: { id: string; name: string };
  assignedTo: { id: string; name: string; role: string } | null;
};

export type RequestEventItem = {
  id: string;
  eventType: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { name: string; role: string } | null;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "FRONT_DESK" | "STAFF";
};