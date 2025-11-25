import { Timestamp } from 'firebase/firestore';

/**
 * User role types that control website functionality
 */
export type UserRole = 'user' | 'admin' | 'moderator' | 'premium' | 'developer';

export interface UserData {
  id?: string; // Document ID
  discordId: string; // Discord user ID (unique identifier)
  email?: string;
  name?: string;
  preferredName?: string; // Guild nickname or preferred name
  avatarUrl?: string;
  username?: string; // Discord username
  globalName?: string; // Discord global name
  displayName?: string; // Discord display name
  role?: UserRole; // User role that controls website functionality (defaults to 'user')
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
}

export interface CreateUserData {
  discordId: string;
  email?: string;
  name?: string;
  preferredName?: string;
  avatarUrl?: string;
  username?: string;
  globalName?: string;
  displayName?: string;
  role?: UserRole; // User role that controls website functionality
}


