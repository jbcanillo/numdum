import {
  encryptData,
  decryptData,
  downloadBackup,
  restoreFromFile,
  readFileAsText
} from '../utils/backupRestore';

// Mock document.createElement and URL.createObjectURL
const mockClick = jest.fn();
const mockRevoke = jest.fn();

beforeEach(() => {
  global.document.createElement = jest.fn(() => ({
    click: mockClick,
    remove: jest.fn()
  }));
  
  // Mock document.body using jest.spyOn to avoid DOM errors
  const mockBody = {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  };
  jest.spyOn(document, 'body', 'get').mockReturnValue(mockBody);
  
  global.URL.createObjectURL = jest.fn(() => 'blob:test');
  global.URL.revokeObjectURL = mockRevoke;
  
  // Mock CryptoJS module
  const mockEncrypt = (data, password) => {
    const payload = JSON.stringify(data);
    return {
      toString: () => btoa(payload + '|' + password)
    };
  };
  
  const mockDecrypt = (cipherText, password) => {
    if (typeof cipherText !== 'string') {
      throw new Error('Invalid ciphertext');
    }
    try {
      const decoded = atob(cipherText);
      const [jsonStr, pwd] = decoded.split('|');
      if (pwd !== password) {
        throw new Error('Incorrect password');
      }
      return {
        toString: (enc) => {
          if (enc && enc.toString === 'stringify') {
            return jsonStr;
          }
          return jsonStr;
        }
      };
    } catch (e) {
      throw new Error('Decryption failed');
    }
  };
  
  // Mock the crypto-js module
  jest.mock('crypto-js', () => ({
    AES: {
      encrypt: mockEncrypt,
      decrypt: mockDecrypt
    },
    enc: {
      Utf8: {
        stringify: (val) => val?.toString?.() || ''
      }
    }
  }));
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
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