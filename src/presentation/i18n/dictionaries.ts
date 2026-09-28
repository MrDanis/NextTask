import type { Locale } from '@/shared/i18n/locale';

interface GeneratorCopyParams {
  count: number;
  min: number;
  max: number;
}

const en = {
  meta: {
    signInTitle: 'Sign in | TJ Labs',
    generatorTitle: 'Generate numbers | TJ Labs',
    description: 'Generate unique numbers that never repeat.',
  },
  header: {
    home: 'TJ Labs home',
    language: 'Language: English. Switch to German',
    signOut: 'Sign out',
    settings: 'Settings',
  },
  signIn: {
    title: 'Sign in',
    noAccount: "Don't have an account?",
    getStarted: 'Get started',
    getStartedHint:
      'New here? Generate numbers, copy them, then sign in with your email and paste the numbers as your password. Each number works for one sign-in.',
    email: 'Email address',
    password: 'Password',
    passwordPlaceholder: '6+ characters',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    generateLink: 'Generate numbers',
    submit: 'Sign in',
    submitting: 'Signing in…',
    errors: {
      email: {
        required: 'Enter your email address.',
        invalid: 'Enter a valid email address, e.g. name@example.com.',
      },
      password: {
        required: 'Enter your password.',
        tooShort: 'Password must be at least 6 characters.',
        tooLong: 'Password must be at most 128 characters.',
      },
      invalidCredentials: 'Incorrect email or password.',
      codeNotIssued: "This number wasn't generated here. Generate numbers first, then copy and paste them.",
      codeAlreadyUsed: 'This number has already been used to sign in. Generate a new one.',
    },
  },
  generator: {
    title: 'Generate numbers',
    description: ({ count, min, max }: GeneratorCopyParams) =>
      `Generate ${count} numbers between ${min} and ${max}, with no number appearing twice.`,
    submit: 'Generate',
    submitting: 'Generating…',
    submitOwn: 'Use these numbers',
    submittingOwn: 'Checking…',
    back: 'Back',
    resultLabel: 'Numbers',
    slotLabel: (position: number, total: number) => `Number ${position} of ${total}`,
    announce: (numbers: readonly number[]) => `New numbers: ${numbers.join(', ')}`,
    copy: 'Copy',
    copied: 'Copied',
    copyLabel: (code: string) => `Copy ${code}`,
    copiedHint: (code: string) =>
      `${code} copied. Go back to sign in, enter your email and paste it as your password. It works for one sign-in.`,
    copyFailed: (code: string) => `Couldn't copy automatically. Your number is ${code}.`,
    entryErrors: {
      repeated: ({ value, position }: { value: string; position: number }) =>
        `${value} is already in box ${position}. Each number may appear only once.`,
      incomplete: ({ count }: GeneratorCopyParams) => `Fill in all ${count} boxes, or clear them to generate at random.`,
      duplicate: () => 'Each number may appear only once.',
      outOfRange: ({ min, max }: GeneratorCopyParams) => `Use numbers from ${min} to ${max}.`,
    },
    errors: {
      exhausted:
        'Every possible combination has already been issued, so no new numbers can be generated without repeating one.',
      conflict: 'Several requests arrived at the same moment. Please try again.',
      alreadyIssued: 'These numbers have already been issued. Change at least one number and try again.',
      invalid: 'These numbers break the rules. Check each box and try again.',
    },
  },
  notFound: {
    title: 'Page not found',
    body: "This page doesn't exist or has moved.",
    back: 'Back to sign in',
  },
  common: {
    network: "Couldn't reach the server. Check your connection and try again.",
    internal: 'Something went wrong on our side. Please try again.',
  },
};

export type Dictionary = typeof en;

const de: Dictionary = {
  meta: {
    signInTitle: 'Anmelden | TJ Labs',
    generatorTitle: 'Zahlen generieren | TJ Labs',
    description: 'Eindeutige Zahlen generieren, die sich nie wiederholen.',
  },
  header: {
    home: 'TJ Labs Startseite',
    language: 'Sprache: Deutsch. Zu Englisch wechseln',
    signOut: 'Abmelden',
    settings: 'Einstellungen',
  },
  signIn: {
    title: 'Anmelden',
    noAccount: 'Noch kein Konto?',
    getStarted: 'Jetzt starten',
    getStartedHint:
      'Neu hier? Generiere Zahlen, kopiere sie und melde dich mit deiner E-Mail-Adresse an: Die Zahlen sind dein Passwort. Jede Zahl gilt für eine Anmeldung.',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    passwordPlaceholder: '6+ Zeichen',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort verbergen',
    generateLink: 'Zahlen generieren',
    submit: 'Anmelden',
    submitting: 'Anmeldung läuft…',
    errors: {
      email: {
        required: 'Gib deine E-Mail-Adresse ein.',
        invalid: 'Gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.',
      },
      password: {
        required: 'Gib dein Passwort ein.',
        tooShort: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        tooLong: 'Das Passwort darf höchstens 128 Zeichen lang sein.',
      },
      invalidCredentials: 'E-Mail-Adresse oder Passwort ist falsch.',
      codeNotIssued: 'Diese Zahl wurde hier nicht generiert. Generiere zuerst Zahlen, kopiere sie und füge sie ein.',
      codeAlreadyUsed: 'Mit dieser Zahl wurde bereits angemeldet. Generiere eine neue.',
    },
  },
  generator: {
    title: 'Zahlen generieren',
    description: ({ count, min, max }) =>
      `Generiere ${count} Zahlen zwischen ${min} und ${max}, wobei keine Zahl doppelt vorkommen darf.`,
    submit: 'Generieren',
    submitting: 'Wird generiert…',
    submitOwn: 'Zahlen übernehmen',
    submittingOwn: 'Wird geprüft…',
    back: 'Zurück',
    resultLabel: 'Zahlen',
    slotLabel: (position, total) => `Zahl ${position} von ${total}`,
    announce: (numbers) => `Neue Zahlen: ${numbers.join(', ')}`,
    copy: 'Kopieren',
    copied: 'Kopiert',
    copyLabel: (code) => `${code} kopieren`,
    copiedHint: (code) =>
      `${code} kopiert. Geh zurück zur Anmeldung, gib deine E-Mail-Adresse ein und füge die Zahl als Passwort ein. Sie gilt für eine Anmeldung.`,
    copyFailed: (code) => `Kopieren nicht möglich. Deine Zahl ist ${code}.`,
    entryErrors: {
      repeated: ({ value, position }) => `${value} steht schon in Feld ${position}. Jede Zahl darf nur einmal vorkommen.`,
      incomplete: ({ count }) => `Fülle alle ${count} Felder aus oder leere sie, um zufällig zu generieren.`,
      duplicate: () => 'Jede Zahl darf nur einmal vorkommen.',
      outOfRange: ({ min, max }) => `Verwende Zahlen von ${min} bis ${max}.`,
    },
    errors: {
      exhausted:
        'Alle möglichen Kombinationen wurden bereits vergeben. Neue Zahlen können nicht ohne Wiederholung generiert werden.',
      conflict: 'Mehrere Anfragen kamen gleichzeitig an. Bitte versuche es erneut.',
      alreadyIssued: 'Diese Zahlen wurden bereits vergeben. Ändere mindestens eine Zahl und versuche es erneut.',
      invalid: 'Diese Zahlen verstoßen gegen die Regeln. Prüfe jedes Feld und versuche es erneut.',
    },
  },
  notFound: {
    title: 'Seite nicht gefunden',
    body: 'Diese Seite existiert nicht oder wurde verschoben.',
    back: 'Zurück zur Anmeldung',
  },
  common: {
    network: 'Der Server ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.',
    internal: 'Auf unserer Seite ist etwas schiefgelaufen. Bitte versuche es erneut.',
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
