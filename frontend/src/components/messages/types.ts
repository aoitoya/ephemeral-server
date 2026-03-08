export interface Message {
  id: string;
  content: string;
  from: {
    id: string;
    username: string;
  };
  createdAt: string;
}
