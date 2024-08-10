export interface User {
  id: string;
  username: string;
  avatar: string | null;
  email: string;
}

export interface Chat {
  id: string;
  userIds: string[];
  createdAt: string;
  seenBy: string[];
  lastMessage: string | null;
  receiver: User;
}

export interface UserMessage {
  id: string;
  text: string;
  userId: string;
  chatId: string;
  createdAt: string;
}

export interface ChatDetail {
  id: string;
  userIds: string[];
  createdAt: string;
  seenBy: string[];
  lastMessage: string;
  messages: UserMessage[];
}

export interface ErrorResponse {
  message: string;
}

export interface AvatarState {
  file: File | null;
  url: string | null;
}
