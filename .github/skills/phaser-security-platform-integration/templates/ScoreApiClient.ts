export interface ScoreSubmission { runId: string; score: number; durationMs: number; checksum?: string }
export async function submitScore(endpoint: string, submission: ScoreSubmission) {
  const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(submission) });
  if (!res.ok) throw new Error(`Score submission failed: ${res.status}`);
  return res.json();
}
