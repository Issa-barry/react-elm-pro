jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue('tok-test') },
}));

import { envoyerMessage } from '../contact-api.service';
import * as storage from '@/features/auth/services/secure-storage.service';

const mockGetToken = storage.secureStorage.getToken as jest.MockedFunction<
  typeof storage.secureStorage.getToken
>;

describe('contact-api.service – envoyerMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockResolvedValue('tok-test');
    global.fetch = jest.fn();
  });

  it('retourne { ok: true } sur réponse 2xx', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Envoyé' }),
    });

    const result = await envoyerMessage('Bonjour, un test.');

    expect(result).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/mobile/contact'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer tok-test' }),
        body: JSON.stringify({ message: 'Bonjour, un test.' }),
      })
    );
  });

  it('envoie sans header Authorization quand pas de token', async () => {
    mockGetToken.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await envoyerMessage('Message anonyme');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty('Authorization');
  });

  it('retourne { ok: false, error } si la réponse est non-ok avec message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Contenu invalide' }),
    });

    const result = await envoyerMessage('Test');

    expect(result).toEqual({ ok: false, error: 'Contenu invalide' });
  });

  it('retourne une erreur par défaut si data.message absent', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const result = await envoyerMessage('Test');

    expect(result).toEqual({ ok: false, error: 'Une erreur est survenue.' });
  });

  it('retourne { ok: false } en cas d\'erreur réseau', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

    const result = await envoyerMessage('Test');

    expect(result).toEqual({ ok: false, error: 'Erreur réseau. Vérifiez votre connexion.' });
  });
});
