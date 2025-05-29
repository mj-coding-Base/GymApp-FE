import { NotificationDataType } from "@/types/Notifications";

export const sampleNotifications: NotificationDataType[] = [
  {
    _id: "1",
    message: "Your order has been shipped.",
    userId: "user123",
    type: "order",
    title: "Order Shipped",
    url: "/orders/123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    read: false,
  },
  {
    _id: "2",
    message: "New comment on your post.",
    userId: "user123",
    type: "comment",
    title: "New Comment",
    url: "/posts/456",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    read: true,
  },
];
