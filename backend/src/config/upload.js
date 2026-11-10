const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

function getMaxFileSize(value) {
  if (value === undefined) {
    return DEFAULT_MAX_FILE_SIZE;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error('MAX_FILE_SIZE deve ser um inteiro positivo em bytes.');
  }

  const maxFileSize = Number(value);
  if (!Number.isSafeInteger(maxFileSize) || maxFileSize < 1) {
    throw new Error('MAX_FILE_SIZE deve ser um inteiro positivo em bytes.');
  }

  return maxFileSize;
}

module.exports = { getMaxFileSize };