import { House, Message } from '../types';
import { HOUSES as FALLBACK_HOUSES, INITIAL_MESSAGES as FALLBACK_MESSAGES } from '../constants';

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
    console.warn("Using fallback data (API unavailable):", error);
    // Fallback to local constants
    const votes: Record<number, number> = {};
    FALLBACK_HOUSES.forEach(h => {
       // House 7 starts high, others start low (Mock logic)
       votes[h.id] = h.isTheOne ? 1420 : Math.floor(Math.random() * 25);
    });
    return {
      houses: FALLBACK_HOUSES,
      messages: FALLBACK_MESSAGES,
      votes
    };
  }
};

export const submitVote = async (houseId: number): Promise<boolean> => {
  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ houseId })
    });
    return response.ok;
  } catch (error) {
    console.warn("Vote processed locally (API unavailable)");
    return true;
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
