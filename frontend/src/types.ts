export enum UserRole {
  ADMIN = "ADMIN",
  PHOTOGRAPHER = "PHOTOGRAPHER",
  CLUB_MEMBER = "CLUB_MEMBER",
  VIEWER = "VIEWER"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  referenceSelfieUrl?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  coverImage: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
}

export interface Album {
  id: string;
  eventId: string;
  name: string;
  coverImage: string;
  createdAt: string;
}

export interface Media {
  id: string;
  eventId: string;
  albumId: string;
  title?: string;
  url: string;
  thumbnailUrl: string;
  uploadedBy: string; // UserId
  uploaderName: string;
  uploadDate: string;
  tags: string[];
  likesCount: number;
}

export interface Comment {
  id: string;
  mediaId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  mediaId: string;
}

export interface Favourite {
  id: string;
  userId: string;
  mediaId: string;
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: "LIKE" | "COMMENT" | "SYSTEM";
  message: string;
  mediaId?: string;
  read: boolean;
  createdAt: string;
}

export interface FaceEmbedding {
  id: string;
  userId: string;
  embedding: number[]; // Float vectors
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  type: "UPLOAD" | "PROFILE_UPDATE" | "EVENT_CREATE" | "ALBUM_CREATE" | "SELFIE_UPLOAD" | "SELFIE_DELETE";
  details: string;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  events: Event[];
  albums: Album[];
  media: Media[];
  comments: Comment[];
  likes: Like[];
  favourites: Favourite[];
  notifications: Notification[];
}
