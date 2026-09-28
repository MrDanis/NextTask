import { NextResponse, type NextRequest } from 'next/server';
import type { DrawDto } from '@/application/generator/dto';
import { getContainer } from '@/infrastructure/container';
import { errorResponse, handleError, isCrossSite } from '../../_server/http';

/**
 * Issues one new draw. Every call is a new draw, so this is POST and never cached.
 *
 * - No body: a random draw.
 * - `{ "numbers": [...] }`: the user's own numbers, issued only if they follow
 *   the same rules and have never been issued before.
 */
export async function POST(request: NextRequest) {
  if (isCrossSite(request)) return errorResponse(403, { code: 'FORBIDDEN' });

  const body: unknown = await request.json().catch(() => null);
  const numbers = typeof body === 'object' && body !== null && 'numbers' in body ? body.numbers : undefined;
  if (numbers !== undefined && !Array.isArray(numbers)) return errorResponse(422, { code: 'INVALID_DRAW' });

  try {
    const { generateDraw, claimDraw } = await getContainer();
    const draw = numbers ? await claimDraw.execute(numbers) : await generateDraw.execute();
    return NextResponse.json<DrawDto>(draw, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return handleError(error);
  }
}
