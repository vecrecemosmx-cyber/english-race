// Llamada limpia y asíncrona a nuestro endpoint interno
export async function searchVideoForPhrase(phrase: string) {
  try {
    const response = await fetch('/api/video-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al buscar video:', error);
    return { found: false };
  }
}