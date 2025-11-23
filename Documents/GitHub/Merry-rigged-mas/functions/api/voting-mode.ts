// API endpoint to get the current voting mode configuration

interface Env {
  VOTING_MODE?: string;
}

type PagesFunction<Env = unknown, Params extends string = any, Data extends Record<string, unknown> = Record<string, unknown>> = (
  context: { env: Env; request: Request }
) => Response | Promise<Response>;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const votingMode = context.env.VOTING_MODE || 'normal_mode';
    
    return new Response(JSON.stringify({ 
      votingMode: votingMode,
      description: votingMode === 'joke_mode' 
        ? 'Votes are redirected to House #7 with humorous messages'
        : 'Votes are recorded normally for the selected house'
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (e: any) {
    console.error('Voting mode API error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}