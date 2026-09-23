export interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  age: number;
}

export interface CollaboratorSummary {
  _id: string;
  username: string;
  email?: string;
}

export interface Book {
  _id: string;
  title: string;
  description: string;
  ownerId: string;
  collaborators: Array<string | CollaboratorSummary>;
  createdAt: string;
  ownerName?: string;
  canEdit?: boolean;
  editRequestStatus?: 'pending' | 'approved' | 'rejected' | null;
}
