import {
  encryptData,
  decryptData,
  downloadBackup,
  restoreFromFile,
  readFileAsText
} from '../utils/backupRestore';

// Mock CryptoJS for deterministic tests
jest.mock('crypto-js', () => {
  // Simple reversible "encryption" for testing
  return {
    AES: {
      encrypt: jest.fn((data, password) => {
        // Combine data and password into a string, then base64
        const payload = JSON.stringify(data) + '|' + password;
        return {
          toString: () => Buffer.from(payload).toString('base64')
        };
      }),
      decrypt: jest.fn((cipherText, password) => {
        // cipherText is the base64 string from encrypt().toString()
        if (typeof cipherText !== 'string') {
          throw new Error('Invalid ciphertext');
        }
        try {
          const payload = Buffer.from(cipherText, 'base64').toString('utf8');
          const [jsonStr, pwd] = payload.split('|');
          if (pwd !== password) {
            throw new Error('Incorrect password');
          }
          return {
            toString: () => jsonStr
          };
        } catch (e) {
          throw new Error('Decryption failed');
        }
      })
    },
    enc: {
      Utf8: {
        stringify: (data) => data,
        parse: (str) => str
      }
    }
  };
});

// Mock document.createElement and URL.createObjectURL
const mockClick = jest.fn();
const mockRevoke = jest.fn();
beforeEach(() => {
  global.document.createElement = jest.fn(() => ({
    click: mockClick,
    remove: jest.fn()
  }));
  global.URL.createObjectURL = jest.fn(() => 'blob:test');
  global.URL.revokeObjectURL = mockRevoke;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Backup/Restore Utilities', () => {
  const testData = {
    version: 1,
    exportedAt: '2026-03-28T12:00:00Z',
    reminders: [
      { id: '1', title: 'Test Reminder', completed: false }
    ],
    journal: [
      { id: 'j1', title: 'Test Journal', mood: '😊' }
    ]
  };
  const password = 'securepassword123';

  describe('encryptData', () => {
    test('returns an encrypted string', () => {
      const encrypted = encryptData(testData, password);
      expect(typeof encrypted).toBe('string');
      // Should be a base64 string (no prefix)
      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    test('throws without password', () => {
      expect(() => encryptData(testData, '')).toThrow('Password is required for encryption');
    });
  });

  describe('decryptData', () => {
    test('returns original data', () => {
      const encrypted = encryptData(testData, password);
      const decrypted = decryptData(encrypted, password);
      expect(decrypted).toEqual(testData);
    });

    test('throws without password', () => {
      const encrypted = encryptData(testData, password);
      expect(() => decryptData(encrypted, '')).toThrow('Password is required for decryption');
    });

    test('throws with wrong password', () => {
      const encrypted = encryptData(testData, password);
      expect(() => decryptData(encrypted, 'wrong')).toThrow('Failed to decrypt data');
    });

    test('throws on corrupted data', () => {
      expect(() => decryptData('invalid-ciphertext', password)).toThrow('Failed to decrypt data');
    });
  });

  describe('downloadBackup', () => {
    test('creates and downloads a file', () => {
      downloadBackup(testData, password, 'my-backup.json.enc');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      const link = document.createElement.mock.results[0].value;
      expect(link.download).toBe('my-backup.json.enc');
      expect(link.href).toBe('blob:test');
      expect(mockClick).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
    });

    test('uses default filename if none provided', () => {
      downloadBackup(testData, password);
      const link = document.createElement.mock.results[0].value;
      expect(link.download).toBe('backup-numdum.json.enc');
    });
  });

  describe('readFileAsText', () => {
    test('reads file content as text', async () => {
      const mockFile = new Blob(['encrypted content'], { type: 'text/plain' });
      const text = await readFileAsText(mockFile);
      expect(text).toBe('encrypted content');
    });
  });

  describe('restoreFromFile', () => {
    test('decrypts and returns data', async () => {
      const encrypted = encryptData(testData, password);
      const mockFile = new Blob([encrypted], { type: 'text/plain' });
      const result = await restoreFromFile(mockFile, password);
      expect(result).toEqual(testData);
    });

    test('throws on invalid file content', async () => {
      const mockFile = new Blob(['not-encrypted'], { type: 'text/plain' });
      await expect(restoreFromFile(mockFile, password)).rejects.toThrow('Failed to decrypt data');
    });
  });
});
