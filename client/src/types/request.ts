export type RequestStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type RequestPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

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

  room: {
    id: string;
    roomNumber: string;
  };

  guest: {
    id: string;
    name: string;
  };

  assignedTo: {
    id: string;
    name: string;
    role: string;
  } | null;
};