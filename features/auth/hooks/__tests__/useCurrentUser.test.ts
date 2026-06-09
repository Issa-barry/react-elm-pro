import { act, renderHook } from '@testing-library/react-native';
import { useCurrentUser } from '../useCurrentUser';
import { secureStorage } from '../../services/secure-storage.service';
import type { AuthUser } from '../../types/auth.types';

jest.mock('../../services/secure-storage.service', () => ({
  secureStorage: { getUser: jest.fn() },
}));

const mockGetUser = secureStorage.getUser as jest.MockedFunction<typeof secureStorage.getUser>;

const USER_FIXTURE: AuthUser = {
  id: 'u1',
  prenom: 'Moussa',
  nom: 'CAMARA',
  telephone: '+224621234567',
  roles: ['livreur'],
};

describe('useCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('démarre avec loading=true et user=null', () => {
    mockGetUser.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('charge l\'utilisateur depuis secureStorage et met loading=false', async () => {
    mockGetUser.mockResolvedValue(USER_FIXTURE);
    const { result } = renderHook(() => useCurrentUser());

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(USER_FIXTURE);
  });

  it('retourne user=null si aucun utilisateur n\'est stocké', async () => {
    mockGetUser.mockResolvedValue(null);
    const { result } = renderHook(() => useCurrentUser());

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
