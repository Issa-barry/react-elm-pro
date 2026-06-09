import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

import { useTheme } from '@/shared/contexts/ThemeContext';
import { scanService } from '../services/scan.service';
import type { ClientScan, LivraisonScan, ScanResult, UserScan } from '../types/scan.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPhone(phone: string): string {
  const m = /^\+(\d{3})(\d{3})(\d{2})(\d{2})(\d{2})$/.exec(phone);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}` : phone;
}

function initiales(nom: string, prenom?: string | null): string {
  return ((prenom?.[0] ?? '') + (nom[0] ?? '')).toUpperCase() || '?';
}

const ROLE_LABEL: Record<string, string> = {
  proprietaire: 'Propriétaire',
  livreur:      'Livreur',
};

function getRoleColor(colors: ReturnType<typeof useTheme>['colors']): Record<string, { bg: string; text: string }> {
  return {
    proprietaire: { bg: colors.infoBg,    text: colors.primary },
    livreur:      { bg: colors.successBg, text: colors.success  },
  };
}

// ─── Carte utilisateur ────────────────────────────────────────────────────────

function UserCard({ user, onClose }: Readonly<{ user: UserScan; onClose: () => void }>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles    = useMemo(() => makeCardStyles(colors), [colors]);
  const roleColor = getRoleColor(colors);

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable
        style={[styles.card, { paddingBottom: insets.bottom + 16 }]}
        onPress={e => e.stopPropagation()}>

        {/* En-tête */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initiales(user.nom, user.prenom)}</Text>
          </View>
          <View style={styles.cardTitles}>
            <Text style={styles.cardNom}>{user.nom_complet}</Text>
            <View style={styles.rolesRow}>
              {user.roles.map(r => (
                <View key={r} style={[styles.roleBadge, { backgroundColor: roleColor[r]?.bg ?? colors.surfaceAlt }]}>
                  <Text style={[styles.roleBadgeText, { color: roleColor[r]?.text ?? colors.textMuted }]}>
                    {ROLE_LABEL[r] ?? r}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Coordonnées */}
        <View style={styles.details}>
          {user.phone ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📞</Text>
              <Text style={styles.detailText}>{formatPhone(user.phone)}</Text>
            </View>
          ) : null}
          {(user.quartier || user.ville) ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText}>
                {[user.quartier, user.ville].filter(Boolean).join(', ')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Véhicules */}
        {user.vehicules.length > 0 && (
          <View style={styles.vehiculesSection}>
            <Text style={styles.vehiculesTitre}>
              Véhicule{user.vehicules.length > 1 ? 's' : ''} ({user.vehicules.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehiculesList}>
              {user.vehicules.map(v => (
                <View key={v.immatriculation} style={styles.vehiculeChip}>
                  <Text style={styles.vehiculeNom}>{v.nom}</Text>
                  <Text style={styles.vehiculeImmat}>{v.immatriculation}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>Fermer</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  );
}

// ─── Carte client ─────────────────────────────────────────────────────────────

function ClientCard({ client, onClose }: Readonly<{ client: ClientScan; onClose: () => void }>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeCardStyles(colors), [colors]);

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable
        style={[styles.card, { paddingBottom: insets.bottom + 16 }]}
        onPress={e => e.stopPropagation()}>

        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: '#7c3aed' }]}>
            <Text style={styles.avatarText}>{initiales(client.nom, client.prenom)}</Text>
          </View>
          <View style={styles.cardTitles}>
            <Text style={styles.cardNom}>{client.nom_complet || client.raison_sociale}</Text>
            <Text style={styles.cardRef}>{client.reference}</Text>
          </View>
          {!client.is_active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inactif</Text>
            </View>
          )}
        </View>

        <View style={styles.details}>
          {client.phone ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📞</Text>
              <Text style={styles.detailText}>{formatPhone(client.phone)}</Text>
            </View>
          ) : null}
          {(client.quartier || client.ville) ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText}>
                {[client.quartier, client.ville].filter(Boolean).join(', ')}
              </Text>
            </View>
          ) : null}
          {client.adresse ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🏠</Text>
              <Text style={styles.detailText}>{client.adresse}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>Fermer</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  );
}

// ─── Carte livraison / commande ───────────────────────────────────────────────

function LivraisonCard({ livraison, onClose }: Readonly<{ livraison: LivraisonScan; onClose: () => void }>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeCardStyles(colors), [colors]);

  const isCommande  = livraison.type === 'commande';
  const accentColor = isCommande ? '#7c3aed' : colors.primary;

  function Row({ icon, value }: { icon: string; value?: string | null }) {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>{icon}</Text>
        <Text style={styles.detailText}>{value}</Text>
      </View>
    );
  }

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable
        style={[styles.card, { paddingBottom: insets.bottom + 16 }]}
        onPress={e => e.stopPropagation()}>

        {/* En-tête */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: accentColor }]}>
            <Text style={styles.avatarText}>{isCommande ? '🛒' : '🚚'}</Text>
          </View>
          <View style={styles.cardTitles}>
            <Text style={styles.cardNom}>{livraison.reference}</Text>
            <Text style={styles.cardRef}>{livraison.statut_label}</Text>
          </View>
          <View style={[styles.inactiveBadge, { backgroundColor: isCommande ? '#ede9fe' : colors.primaryLight }]}>
            <Text style={[styles.inactiveBadgeText, { color: accentColor }]}>
              {livraison.nb_packs ?? 0} pack{(livraison.nb_packs ?? 0) > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Détails */}
        <View style={styles.details}>
          {isCommande ? (
            <>
              <Row icon="🏪" value={livraison.site_source} />
              <Row icon="👤" value={livraison.client_nom} />
              <Row icon="📞" value={livraison.client_telephone ? formatPhone(livraison.client_telephone) : null} />
              <Row icon="📍" value={livraison.client_adresse} />
              <Row icon="📅" value={livraison.date_commande} />
            </>
          ) : (
            <>
              <Row icon="🏪" value={`Départ : ${livraison.site_source ?? '—'}`} />
              <Row icon="📦" value={`Arrivée : ${livraison.site_destination ?? '—'}`} />
              <Row icon="📅" value={livraison.date_depart ? `Parti le ${livraison.date_depart}` : null} />
              <Row icon="🎯" value={livraison.date_arrivee_prevue ? `Attendu le ${livraison.date_arrivee_prevue}` : null} />
            </>
          )}
          <Row icon="🚐" value={livraison.vehicule ? `${livraison.vehicule.nom} — ${livraison.vehicule.immatriculation}` : null} />
          <Row icon="👥" value={livraison.equipe_nom !== '—' ? livraison.equipe_nom : null} />
        </View>

        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: accentColor }]} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>Fermer</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  );
}

// ─── Écran scanner ────────────────────────────────────────────────────────────

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeScannerStyles(colors), [colors]);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<ScanResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [zoom, setZoom]         = useState(0);
  const cooldown = useRef(false);

  function changeZoom(delta: number) {
    setZoom(z => Math.min(0.8, Math.max(0, Number.parseFloat((z + delta).toFixed(1)))));
  }

  const handleScan = useCallback(async ({ data }: { data: string }) => {
    if (cooldown.current || scanned) return;
    cooldown.current = true;
    setScanned(true);
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await scanService.scan(data);
    setLoading(false);

    if (res.ok) {
      setResult(res.data);
    } else {
      setError(res.error);
      setTimeout(() => {
        setScanned(false);
        setError(null);
        cooldown.current = false;
      }, 2000);
    }
  }, [scanned]);

  function handleClose() {
    setResult(null);
    setScanned(false);
    setError(null);
    cooldown.current = false;
  }

  // ── Permission ───────────────────────────────────────────────────────────
  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.permText}>L'accès à la caméra est nécessaire pour scanner les QR codes.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.permBtnText}>Autoriser la caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Caméra */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        zoom={zoom}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {/* Overlay sombre */}
      <View style={styles.darkOverlay} pointerEvents="none">
        <View style={styles.darkTop} />
        <View style={styles.darkMiddle}>
          <View style={styles.darkSide} />
          <View style={styles.scanFrame} />
          <View style={styles.darkSide} />
        </View>
        <View style={styles.darkBottom} />
      </View>

      {/* Coins */}
      <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
      <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />

      {/* Instruction */}
      <View style={[styles.instrBox, { top: insets.top + FRAME_TOP - 52 }]} pointerEvents="none">
        <Text style={styles.instrText}>Pointez vers le QR code</Text>
      </View>

      {/* Feedback */}
      {loading && (
        <View style={styles.feedbackBox} pointerEvents="none">
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.feedbackText}>Identification…</Text>
        </View>
      )}
      {!loading && error && (
        <View style={styles.feedbackBox} pointerEvents="none">
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.feedbackText}>{error}</Text>
        </View>
      )}

      {/* Zoom */}
      <View style={[styles.zoomRow, { top: FRAME_TOP + FRAME_SIZE + 20 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.zoomBtn} onPress={() => changeZoom(-0.1)} activeOpacity={0.7}>
          <Text style={styles.zoomBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.zoomLabel}>{Math.round(zoom * 10)}×</Text>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => changeZoom(0.1)} activeOpacity={0.7}>
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Annuler */}
      <TouchableOpacity
        style={[styles.cancelBtn, { bottom: insets.bottom + 32 }]}
        onPress={() => router.back()}
        activeOpacity={0.7}>
        <Text style={styles.cancelBtnText}>Annuler</Text>
      </TouchableOpacity>

      {/* Résultat */}
      {result?.type === 'user'      && <UserCard      user={result.data}      onClose={handleClose} />}
      {result?.type === 'client'    && <ClientCard    client={result.data}    onClose={handleClose} />}
      {result?.type === 'livraison' && <LivraisonCard livraison={result.data} onClose={handleClose} />}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const FRAME_SIZE = 240;
const FRAME_TOP  = 180;
const CORNER_LEN = 28;
const CORNER_W   = 4;
const CORNER_R   = 8;

// Styles de la caméra/scanner (fond toujours noir)
function makeScannerStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    root:     { flex: 1, backgroundColor: '#000' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24, gap: 16 },

    darkOverlay: { ...StyleSheet.absoluteFillObject },
    darkTop:     { height: FRAME_TOP, backgroundColor: 'rgba(0,0,0,0.65)' },
    darkMiddle:  { height: FRAME_SIZE, flexDirection: 'row' },
    darkSide:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
    scanFrame:   { width: FRAME_SIZE, backgroundColor: 'transparent' },
    darkBottom:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },

    corner:    { position: 'absolute', width: CORNER_LEN, height: CORNER_LEN, borderColor: '#fff', borderRadius: CORNER_R },
    cornerTL:  { top: FRAME_TOP,                              left: '50%',  marginLeft: -FRAME_SIZE / 2,  borderTopWidth: CORNER_W,    borderLeftWidth: CORNER_W  },
    cornerTR:  { top: FRAME_TOP,                              right: '50%', marginRight: -FRAME_SIZE / 2, borderTopWidth: CORNER_W,    borderRightWidth: CORNER_W },
    cornerBL:  { top: FRAME_TOP + FRAME_SIZE - CORNER_LEN,   left: '50%',  marginLeft: -FRAME_SIZE / 2,  borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W  },
    cornerBR:  { top: FRAME_TOP + FRAME_SIZE - CORNER_LEN,   right: '50%', marginRight: -FRAME_SIZE / 2, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W },

    instrBox:  { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    instrText: { color: '#fff', fontSize: 14, fontWeight: '500', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

    feedbackBox:  { position: 'absolute', top: FRAME_TOP + FRAME_SIZE + 24, left: 0, right: 0, alignItems: 'center', gap: 8 },
    feedbackText: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center', paddingHorizontal: 32 },
    errorIcon:    { fontSize: 28 },

    zoomRow:     { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
    zoomBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
    zoomBtnText: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 26 },
    zoomLabel:   { color: '#fff', fontSize: 14, fontWeight: '600', minWidth: 28, textAlign: 'center' },

    cancelBtn:     { position: 'absolute', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    cancelBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

    permText:    { fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 22 },
    permBtn:     { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 24 },
    permBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    cancelText:  { color: colors.primary, fontSize: 15 },
  });
}

// Styles de la bottom sheet résultat (surface themée)
function makeCardStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    card:    { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 20, gap: 16 },

    cardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatar:      { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText:  { color: '#fff', fontSize: 20, fontWeight: '700' },
    cardTitles:  { flex: 1, gap: 4 },
    cardNom:     { fontSize: 18, fontWeight: '700', color: colors.text },
    cardRef:     { fontSize: 13, color: colors.textMuted },

    rolesRow:      { flexDirection: 'row', gap: 6 },
    roleBadge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
    roleBadgeText: { fontSize: 12, fontWeight: '600' },

    inactiveBadge:     { backgroundColor: colors.dangerBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    inactiveBadgeText: { fontSize: 11, color: colors.danger, fontWeight: '600' },

    details:    { gap: 10 },
    detailRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detailIcon: { fontSize: 16, width: 24, textAlign: 'center' },
    detailText: { fontSize: 14, color: colors.text, flex: 1 },

    vehiculesSection: { gap: 8 },
    vehiculesTitre:   { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    vehiculesList:    { gap: 8, paddingBottom: 2 },
    vehiculeChip:     { backgroundColor: colors.surfaceAlt, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
    vehiculeNom:      { fontSize: 13, fontWeight: '600', color: colors.text },
    vehiculeImmat:    { fontSize: 12, color: colors.textMuted },

    closeBtn:     { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
    closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
}
