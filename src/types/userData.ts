import { Timestamp } from 'firebase/firestore';

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
}

