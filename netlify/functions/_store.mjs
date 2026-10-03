import { connectLambda, getStore } from '@netlify/blobs';

// Lambda compatibility supplies an edge URL, but no uncached edge URL.
// Strong consistency therefore throws before any request can be sent.
export function openStore(event, name, options = {}) {
  if (event.blobs) connectLambda(event);
  return getStore({ ...options, name, consistency: 'eventual' });
}
