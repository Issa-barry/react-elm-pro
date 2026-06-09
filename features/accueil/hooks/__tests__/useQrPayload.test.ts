jest.mock('../../services/accueil.service', () => ({
  accueilService: { getQrPayload: jest.fn() },
}));

import { renderHook, act } from '@testing-library/react-native';
import { useQrPayload } from '../useQrPayload';
import { accueilService } from '../../services/accueil.service';

const mockGetQrPayload = accueilService.getQrPayload as jest.MockedFunction<
  typeof accueilService.getQrPayload
>;

describe('useQrPayload', () => {
  beforeEach(() => jest.clearAllMocks());

  it('état initial: loading=true, qrPayload=null', () => {
    mockGetQrPayload.mockResolvedValue({ ok: true, data: null });
    const { result } = renderHook(() => useQrPayload());
    expect(result.current.loading).toBe(true);
    expect(result.current.qrPayload).toBeNull();
  });

  it('charge le qrPayload depuis le service', async () => {
    mockGetQrPayload.mockResolvedValue({ ok: true, data: 'abc123' });
    const { result } = renderHook(() => useQrPayload());
    await act(async () => { await result.current.load(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.qrPayload).toBe('abc123');
  });

  it('qrPayload=null si le service retourne data=null', async () => {
    mockGetQrPayload.mockResolvedValue({ ok: true, data: null });
    const { result } = renderHook(() => useQrPayload());
    await act(async () => { await result.current.load(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.qrPayload).toBeNull();
  });

  it('qrPayload=null si le service échoue', async () => {
    mockGetQrPayload.mockResolvedValue({ ok: false, error: 'Connexion impossible.' });
    const { result } = renderHook(() => useQrPayload());
    await act(async () => { await result.current.load(); });
    expect(result.current.loading).toBe(false);
    expect(result.current.qrPayload).toBeNull();
  });
});
