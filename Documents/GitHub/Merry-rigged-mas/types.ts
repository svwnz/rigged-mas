export interface House {
  id: number;
  address: string;
  description: string;
  imageUrl: string;
  isTheOne: boolean; // Is this House #7?
}

export interface JokeResponse {
  message: string;
  redirectedTo: number;
}

export interface Message {
  id: number;
  name: string;
  text: string;
  houseId: number;
  timestamp: string;
  isSystem?: boolean;
}