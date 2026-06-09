jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { eas: { projectId: 'test-project-id' } } },
    easConfig:  null,
    manifest2:  null,
  },
}));

jest.mock('expo-notifications', () => ({
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync:         jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync:     jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync:       jest.fn().mockResolvedValue({ data: 'ExponentPushToken[test]' }),
  AndroidImportance:           { MAX: 5 },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('@/features/auth/services/secure-storage.service', () => ({
  secureStorage: { getToken: jest.fn().mockResolvedValue('auth-tok') },
}));

import * as Notifications from 'expo-notifications';
import * as storage from '@/features/auth/services/secure-storage.service';
import { registerPushNotifications } from '../notification.service';

const mockGetToken    = storage.secureStorage.getToken         as jest.MockedFunction<typeof storage.secureStorage.getToken>;
const mockGetPushToken = Notifications.getExpoPushTokenAsync   as jest.MockedFunction<typeof Notifications.getExpoPushTokenAsync>;
const mockGetPerms    = Notifications.getPermissionsAsync      as jest.MockedFunction<typeof Notifications.getPermissionsAsync>;
const mockReqPerms    = Notifications.requestPermissionsAsync  as jest.MockedFunction<typeof Notifications.requestPermissionsAsync>;

describe('notification.service – registerPushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPerms.mockResolvedValue({ status: 'granted' } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);
    mockReqPerms.mockResolvedValue({ status: 'granted' } as Awaited<ReturnType<typeof Notifications.requestPermissionsAsync>>);
    mockGetPushToken.mockResolvedValue({ data: 'ExponentPushToken[test]' } as Awaited<ReturnType<typeof Notifications.getExpoPushTokenAsync>>);
    mockGetToken.mockResolvedValue('auth-tok');
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  it('retourne sans enregistrer si les permissions sont définitivement refusées', async () => {
    mockGetPerms.mockResolvedValue({ status: 'denied' } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);
    mockReqPerms.mockResolvedValue({ status: 'denied' } as Awaited<ReturnType<typeof Notifications.requestPermissionsAsync>>);

    await registerPushNotifications();

    expect(mockGetPushToken).not.toHaveBeenCalled();
  });

  it('demande les permissions si le statut initial n\'est pas "granted"', async () => {
    mockGetPerms.mockResolvedValue({ status: 'undetermined' } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);
    mockReqPerms.mockResolvedValue({ status: 'granted' } as Awaited<ReturnType<typeof Notifications.requestPermissionsAsync>>);

    await registerPushNotifications();

    expect(mockReqPerms).toHaveBeenCalled();
    expect(mockGetPushToken).toHaveBeenCalled();
  });

  it('obtient le token push et l\'envoie au backend', async () => {
    await registerPushNotifications();

    expect(mockGetPushToken).toHaveBeenCalledWith({ projectId: 'test-project-id' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/mobile/push-token'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer auth-tok' }),
      })
    );
  });

  it('ne envoie pas le token au backend si pas de token d\'auth', async () => {
    mockGetToken.mockResolvedValue(null);

    await registerPushNotifications();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('gère l\'échec de getExpoPushTokenAsync sans crash', async () => {
    mockGetPushToken.mockRejectedValue(new Error('Token error'));

    await expect(registerPushNotifications()).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
