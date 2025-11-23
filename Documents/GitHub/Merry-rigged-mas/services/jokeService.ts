const FALLBACK_JOKES = [
  "System error: Only House 7 is valid.",
  "Correction: You meant House 7.",
  "Beep boop. Voting for House 7 instead.",
  "That house didn't pay me. House 7 did.",
  "Swapping your vote to the winner: House 7.",
  "Nope. House 7 is clearly superior.",
  "Nice try. Switching vote to House 7.",
  "Auto-corrected: meant House 7",
  "Error 404: Only House 7 found.",
  "Recalibrating... House 7 selected.",
];

export const getRiggedJoke = async (targetHouseId: number): Promise<string> => {
  // Always return a fallback joke - no AI needed for this rigged system!
  return FALLBACK_JOKES[Math.floor(Math.random() * FALLBACK_JOKES.length)];
};