export type FeedPost = {
  id: string;
  content: string | null;
  mediaUrls: string[];
  createdAt: string;
  author: {
    id: string;
    email: string;
    profile: {
      name: string;
      avatarUrl: string | null;
    } | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked: boolean;
};

export type FeedComment = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    profile: { name: string; avatarUrl: string | null } | null;
  };
};
