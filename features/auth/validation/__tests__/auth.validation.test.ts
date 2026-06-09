import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateStep1,
  validateStep2,
  validateStepEmail,
  validateStepPassword,
} from '../auth.validation';

// ─── validateEmail ────────────────────────────────────────────────────────────

describe('validateEmail', () => {
  it('retourne une erreur si vide', () => {
    expect(validateEmail('')).not.toBeNull();
  });

  it('retourne une erreur si commence par un point', () => {
    expect(validateEmail('.test@example.com')).not.toBeNull();
  });

  it('retourne une erreur si format invalide (sans @)', () => {
    expect(validateEmail('testexample.com')).not.toBeNull();
  });

  it('retourne une erreur si format invalide (sans domaine)', () => {
    expect(validateEmail('test@')).not.toBeNull();
  });

  it('accepte un email valide', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });

  it('accepte un email avec sous-domaine', () => {
    expect(validateEmail('user@mail.example.co')).toBeNull();
  });

  it('retourne une erreur si que des espaces', () => {
    expect(validateEmail('   ')).not.toBeNull();
  });
});

// ─── validatePassword ─────────────────────────────────────────────────────────

describe('validatePassword', () => {
  it('retourne une erreur si vide', () => {
    expect(validatePassword('')).not.toBeNull();
  });

  it('retourne une erreur si moins de 8 caractères', () => {
    expect(validatePassword('Ab1@')).not.toBeNull();
  });

  it('retourne une erreur si pas de majuscule', () => {
    expect(validatePassword('abcdef1@')).not.toBeNull();
  });

  it('retourne une erreur si pas de minuscule', () => {
    expect(validatePassword('ABCDEF1@')).not.toBeNull();
  });

  it('retourne une erreur si pas de chiffre', () => {
    expect(validatePassword('Abcdefg@')).not.toBeNull();
  });

  it('retourne une erreur si pas de caractère spécial', () => {
    expect(validatePassword('Abcdef12')).not.toBeNull();
  });

  it('accepte un mot de passe valide', () => {
    expect(validatePassword('Test@1234')).toBeNull();
  });

  it('accepte un mot de passe avec différents spéciaux', () => {
    expect(validatePassword('Hello#World9')).toBeNull();
  });
});

// ─── validatePhone ────────────────────────────────────────────────────────────

describe('validatePhone', () => {
  it('retourne une erreur si vide', () => {
    expect(validatePhone('', 'GN')).not.toBeNull();
  });

  it('retourne une erreur si contient des lettres', () => {
    expect(validatePhone('62abc5678', 'GN')).not.toBeNull();
  });

  it('retourne une erreur si trop court pour la Guinée (9 chiffres requis)', () => {
    expect(validatePhone('6212345', 'GN')).not.toBeNull();
  });

  it('accepte un numéro guinéen valide (9 chiffres sans 0)', () => {
    expect(validatePhone('621234567', 'GN')).toBeNull();
  });

  it('accepte un numéro guinéen avec 0 initial (normalisé)', () => {
    expect(validatePhone('0621234567', 'GN')).toBeNull();
  });

  it('retourne une erreur si trop court pour le Sénégal (9 chiffres)', () => {
    expect(validatePhone('7712345', 'SN')).not.toBeNull();
  });

  it('accepte un numéro sénégalais valide', () => {
    expect(validatePhone('771234567', 'SN')).toBeNull();
  });
});

// ─── validateStep1 ────────────────────────────────────────────────────────────

describe('validateStep1', () => {
  it('est invalide si le téléphone est vide', () => {
    const r = validateStep1({ codePays: 'GN', prefix: '+224', telephoneLocal: '', telephone: '' });
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty('telephoneLocal');
  });

  it('est invalide si le codePays est absent', () => {
    const r = validateStep1({ codePays: '', prefix: '+224', telephoneLocal: '621234567', telephone: '' });
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty('codePays');
  });

  it('est valide avec un téléphone guinéen correct', () => {
    const r = validateStep1({ codePays: 'GN', prefix: '+224', telephoneLocal: '621234567', telephone: '+224621234567' });
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
  });
});

// ─── validateStep2 ────────────────────────────────────────────────────────────

describe('validateStep2', () => {
  it('est invalide si prénom manquant', () => {
    const r = validateStep2({ prenom: '', nom: 'CAMARA', prefilled: false });
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty('prenom');
  });

  it('est invalide si prénom trop court', () => {
    const r = validateStep2({ prenom: 'A', nom: 'CAMARA', prefilled: false });
    expect(r.valid).toBe(false);
  });

  it('est invalide si nom manquant', () => {
    const r = validateStep2({ prenom: 'Moussa', nom: '', prefilled: false });
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty('nom');
  });

  it('est valide avec prénom et nom corrects', () => {
    const r = validateStep2({ prenom: 'Moussa', nom: 'CAMARA', prefilled: false });
    expect(r.valid).toBe(true);
  });
});

// ─── validateStepEmail ────────────────────────────────────────────────────────

describe('validateStepEmail', () => {
  it('est invalide si email vide', () => {
    const r = validateStepEmail('');
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty('email');
  });

  it('est invalide si commence par un point', () => {
    const r = validateStepEmail('.user@domain.com');
    expect(r.valid).toBe(false);
  });

  it('est valide avec email correct', () => {
    const r = validateStepEmail('user@domain.com');
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
  });
});

// ─── validateStepPassword ────────────────────────────────────────────────────

describe('validateStepPassword', () => {
  it('est invalide si mot de passe trop faible', () => {
    const r = validateStepPassword('weak', 'weak');
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty('password');
  });

  it('est invalide si les mots de passe ne correspondent pas', () => {
    const r = validateStepPassword('Test@1234', 'Test@5678');
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveProperty('passwordConfirmation');
  });

  it('est valide si mot de passe fort et confirmé', () => {
    const r = validateStepPassword('Test@1234', 'Test@1234');
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
  });
});
