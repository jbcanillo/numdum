import * as CryptoJS from 'crypto-js';

/**
 * Encrypt data using AES-256 with a password.
 * @param {Object} data - The data to encrypt (will be JSON stringified)
 * @param {string} password - The encryption password
 * @returns {string} Encrypted JSON string (CryptoJS format)
 */
export const encryptData = (data, password) => {
  if (!password) {
    throw new Error('Password is required for encryption');
  }
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
  return encrypted;
};

/**
 * Decrypt data encrypted with encryptData.
 * @param {string} encryptedString - The encrypted string
 * @param {string} password - The decryption password
 * @returns {Object} Decrypted data
 * @throws {Error} If decryption fails (wrong password or corrupted data)
 */
export const decryptData = (encryptedString, password) => {
  if (!password) {
    throw new Error('Password is required for decryption');
  }
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedString, password);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonString) {
      throw new Error('Decryption failed - possibly wrong password');
    }
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Failed to decrypt data: ' + error.message);
  }
};

/**
 * Trigger a download of encrypted backup file.
 * @param {Object} backupData - The data to backup (usually reminders + journal entries)
 * @param {string} password - Encryption password
 * @param {string} [filename='backup-numdum.json.enc'] - File name
 */
export const downloadBackup = (backupData, password, filename = 'backup-numdum.json.enc') => {
  const encrypted = encryptData(backupData, password);
  const blob = new Blob([encrypted], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read a file and return its contents as text.
 * @param {File} file - The file to read
 * @returns {Promise<string>} File contents
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

/**
 * Restore data from an encrypted backup file.
 * @param {File} file - The backup file to restore
 * @param {string} password - Decryption password
 * @returns {Promise<Object>} Decrypted backup data
 */
export const restoreFromFile = async (file, password) => {
  const encrypted = await readFileAsText(file);
  return decryptData(encrypted, password);
};
