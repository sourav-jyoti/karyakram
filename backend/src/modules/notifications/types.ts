export interface UpdateNotificationBody {
  status: "sent" | "failed";
  sent_at?: string;
}
