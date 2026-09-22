export interface Avatar {
  url: string;
  alt?: string;
}

export type AvatarValue = string | Avatar;

export interface Author {
  name?: string;
  email?: string;
  avatar?: AvatarValue;
}

export interface Comment {
  body?: string;
  created?: string;
  author?: Author;
}

export interface PostCounts {
  reactions?: number;
  comments?: number;
}

export interface Post {
  id: string | number;
  title?: string;
  body?: string;
  created: string;
  media?: Avatar;
  tags?: Array<string | { name: string }>;
  author?: Author;
  comments?: Comment[];
  _count?: PostCounts;
  profileName?: string;
}

export interface ProfileSummary {
  name: string;
  email?: string;
  avatar?: AvatarValue;
}

export interface Profile extends ProfileSummary {
  bio?: string;
  followers?: ProfileSummary[];
  following?: ProfileSummary[];
}
