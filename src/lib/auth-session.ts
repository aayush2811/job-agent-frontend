import type { QueryClient } from '@tanstack/react-query';
import type { AuthSession } from '@/types/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { socketService } from '@/socket';

/**
 * After login/signup or token refresh: sync store, socket, and queries.
 */
export async function bootstrapAuthSession(
  session: AuthSession,
  queryClient?: QueryClient
) {
  useAuthStore
    .getState()
    .setSession(session.user, session.accessToken, session.refreshToken);

  socketService.reconnectWithToken(session.accessToken);

  if (queryClient) {
    await queryClient.invalidateQueries();
  }
}
