jest.mock('../secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue('tok-profile') },
}));

import { changePassword } from '../profile-api.service';
import * as storage from '../secure-storage.service';

const mockGetToken = storage.secureStorage.getToken as jest.MockedFunction<
  typeof storage.secureStorage.getToken
>;

const VALID_PAYLOAD = {
  current_password: 'OldPass1!',
  password: 'NewPass1!',
  password_confirmation: 'NewPass1!',
};

describe('profile-api.service – changePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockResolvedValue('tok-profile');
    global.fetch = jest.fn();
  });

  it('retourne { ok: true } sur réponse 2xx', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Mot de passe modifié.' }),
    });

    const result = await changePassword(VALID_PAYLOAD);

    expect(result).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/mobile/auth/change-password'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer tok-profile' }),
        body: JSON.stringify(VALID_PAYLOAD),
      })
    );
  });

  it('envoie sans Authorization quand pas de token', async () => {
    mockGetToken.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await changePassword(VALID_PAYLOAD);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty('Authorization');
  });

  it('retourne { ok: false, error, fieldErrors } avec erreurs de validation', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Les données sont invalides.',
        errors: {
          password: ['Le mot de passe doit contenir au moins 8 caractères.'],
          current_password: ['Le mot de passe actuel est incorrect.'],
        },
      }),
    });

    const result = await changePassword(VALID_PAYLOAD);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Les données sont invalides.');
      expect(result.fieldErrors).toEqual({
        password: 'Le mot de passe doit contenir au moins 8 caractères.',
        current_password: 'Le mot de passe actuel est incorrect.',
      });
    }
  });

  it('retourne { ok: false, error } sans fieldErrors si pas d\'erreurs de champ', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Erreur inconnue.' }),
    });

    const result = await changePassword(VALID_PAYLOAD);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Erreur inconnue.');
      expect(result.fieldErrors).toEqual({});
    }
  });

  it('retourne { ok: false, error } en cas d\'erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

    const result = await changePassword(VALID_PAYLOAD);

    expect(result).toEqual({ ok: false, error: 'Erreur réseau. Vérifiez votre connexion.' });
  });
});
