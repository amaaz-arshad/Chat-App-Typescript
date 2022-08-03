import { Timestamp } from "firebase/firestore";

export interface Users {
  uid?: string;
  name?: string;
  email?: string;
  isOnline?: boolean;
  token?: string;
  createdAt?: any;
  photoURL?: string;
  avatar?: string;
  avatarPath?: string;
}

export interface LastMsg {
  from: string;
  to: string;
  media?: string;
  text?: string;
  createdAt: any;
  fileName?: string;
  unread: boolean;
}

export interface Messages {
  id: string;
  from: string;
  to: string;
  media?: string;
  text?: string;
  createdAt: any;
  fileName?: string;
}

export interface Image {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  lastModifiedDate?: Date;
  webkitRelativePath?: string;
}
