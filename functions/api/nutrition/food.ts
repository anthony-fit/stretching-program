import { nutritionApiService } from '../../../src/features/nutrition/adapters';

export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const details = await nutritionApiService.getFoodDetails(id);
    
    if (!details) {
      return new Response(JSON.stringify({ error: 'Food not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(details), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to fetch details' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
