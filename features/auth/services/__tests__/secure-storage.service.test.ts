jest.mock('expo-secure-store', () => ({
  setItemAsync:    jest.fn().mockResolvedValue(undefined),
  getItemAsync:    jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

import * as SecureStore from 'expo-secure-store';
import { secureStorage } from '../secure-storage.service';

const mockSet    = SecureStore.setItemAsync    as jest.MockedFunction<typeof SecureStore.setItemAsync>;
const mockGet    = SecureStore.getItemAsync    as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const mockDelete = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(null);
  });

  // ── saveToken / getToken ───────────────────────────────────────────────────

  it('saveToken stocke le token avec la clé auth_token', async () => {
    await secureStorage.saveToken('abc-123');
    expect(mockSet).toHaveBeenCalledWith('auth_token', 'abc-123');
  });

  it('getToken retourne la valeur stockée', async () => {
    mockGet.mockResolvedValue('stored-token');
    const token = await secureStorage.getToken();
    expect(token).toBe('stored-token');
    expect(mockGet).toHaveBeenCalledWith('auth_token');
  });

  it('getToken retourne null si rien n\'est stocké', async () => {
    mockGet.mockResolvedValue(null);
    const token = await secureStorage.getToken();
    expect(token).toBeNull();
  });

  // ── saveUser / getUser ─────────────────────────────────────────────────────

  it('saveUser sérialise l\'objet en JSON et le stocke', async () => {
    const user = { id: 'u1', prenom: 'Moussa', nom: 'CAMARA' };
    await secureStorage.saveUser(user);
    expect(mockSet).toHaveBeenCalledWith('auth_user', JSON.stringify(user));
  });

  it('getUser désérialise et retourne l\'objet', async () => {
    const user = { id: 'u1', prenom: 'Moussa', nom: 'CAMARA', roles: ['livreur'] };
    mockGet.mockResolvedValue(JSON.stringify(user));

    const result = await secureStorage.getUser<typeof user>();

    expect(result).toEqual(user);
    expect(mockGet).toHaveBeenCalledWith('auth_user');
  });

  it('getUser retourne null si rien n\'est stocké', async () => {
    mockGet.mockResolvedValue(null);
    const result = await secureStorage.getUser();
    expect(result).toBeNull();
  });

  it('getUser retourne null si le JSON est invalide', async () => {
    mockGet.mockResolvedValue('not-valid-json{{{');
    const result = await secureStorage.getUser();
    expect(result).toBeNull();
  });

  // ── clear ──────────────────────────────────────────────────────────────────

  it('clear supprime les deux clés', async () => {
    await secureStorage.clear();
    expect(mockDelete).toHaveBeenCalledWith('auth_token');
    expect(mockDelete).toHaveBeenCalledWith('auth_user');
    expect(mockDelete).toHaveBeenCalledTimes(2);
  });
});
