/**
 * Conservative token estimate for BERT-style WordPiece tokenizers such as the
 * one used by BAAI/bge-small-en-v1.5.
 *
 * The chunker needs a fast, deterministic count with no model download, so it
 * uses this estimate. Measured against the real tokenizer on 2026-11-14: it
 * over-counts ordinary prose by a few tokens and is within about 3% on dense
 * acronym and chemical-name text. The 480-token chunk cap leaves 32 tokens of
 * headroom below the model's 512, and the ingestion script re-checks every
 * chunk with the real tokenizer and refuses anything over the limit.
 */
export function estimateTokens(text: string): number {
  let count = 0;
  for (const piece of text.match(/[A-Za-z]+|[0-9]+|[^\sA-Za-z0-9]/g) ?? []) {
    if (/^[A-Z]{2,}$/.test(piece)) {
      // Acronyms (MSG, MDCA, CFI) are rarely whole entries in the lower-case vocabulary.
      count += Math.ceil(piece.length / 2);
    } else if (/^[A-Za-z]+$/.test(piece)) {
      count += piece.length <= 6 ? 1 : Math.ceil(piece.length / 4);
    } else if (/^[0-9]+$/.test(piece)) {
      count += Math.ceil(piece.length / 2);
    } else {
      count += 1;
    }
  }
  return count;
}

export type TokenCounter = (text: string) => number;
