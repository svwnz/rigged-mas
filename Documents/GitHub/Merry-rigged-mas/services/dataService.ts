import { House, Message } from '../types';

// Helper to determine if we are in a valid API environment or fallback mode
const isApiAvailable = async () => {
  // Simple check could go here, but we'll try/catch requests
  return true;
};

export const fetchInitialData = async (): Promise<{ houses: House[], messages: Message[], votes: Record<number, number> }> => {
  try {
    const response = await fetch('/api/init');
    if (!response.ok) throw new Error("API not available");
    
    const data = await response.json();
    
    // Transform API response to App state shape
    const votes: Record<number, number> = {};
    data.houses.forEach((h: any) => {
      votes[h.id] = h.votes;
    });

    return {
      houses: data.houses,
      messages: data.messages,
      votes
    };
  } catch (error) {
    console.error("API unavailable - no fallback data available:", error);
    // Return empty data since we no longer use fallback sample data
    return {
      houses: [],
      messages: [],
      votes: {}
    };
  }
};

export const submitVote = async (houseId: number): Promise<any> => {
  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ houseId })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.warn("Vote processed locally (API unavailable)");
    return null;
  }
};

export const postMessage = async (msg: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    
    if (!response.ok) throw new Error("Failed to post");
    
    const result = await response.json();
    
    return {
      ...msg,
      id: result.id,
      timestamp: result.timestamp || "Just now"
    };
  } catch (error) {
    console.warn("Message posted locally (API unavailable)");
    return {
      ...msg,
      id: Date.now(),
      timestamp: "Just now"
    };
  }
};
