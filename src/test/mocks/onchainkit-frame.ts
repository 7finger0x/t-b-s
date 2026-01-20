/**
 * Mock for @coinbase/onchainkit/frame
 * Used in tests to avoid import resolution issues
 */
export function getFrameHtmlResponse(options: any): string {
  return `<html><body>Frame: ${JSON.stringify(options)}</body></html>`;
}
