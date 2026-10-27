
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');

// Fila para serializar as operações de leitura e escrita.
let operationQueue = Promise.resolve();

function serialize(operation) {
  const result = operationQueue.then(operation);

  // Uma falha não deve impedir as próximas operações da fila.
  operationQueue = result.catch(() => {});

  return result;
}

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    // "wx" cria o arquivo somente se ele ainda não existir.
    await fs.writeFile(DATA_FILE, '[]\n', {
      encoding: 'utf8',
      flag: 'wx'
    });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

async function readUnlocked() {
  await ensureStorage();

  const content = await fs.readFile(DATA_FILE, 'utf8');

  let links;

  try {
    links = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `O arquivo links.json contém JSON inválido: ${error.message}`
    );
  }

  if (!Array.isArray(links)) {
    throw new Error(
      'Formato inválido em links.json: era esperado um array.'
    );
  }

  return links;
}

async function writeUnlocked(links) {
  if (!Array.isArray(links)) {
    throw new TypeError('Os links devem ser informados em um array.');
  }

  await ensureStorage();

  const content = `${JSON.stringify(links, null, 2)}\n`;

  // Arquivo temporário exclusivo para esta gravação.
  const tempFile = path.join(
    DATA_DIR,
    `.links-${crypto.randomUUID()}.tmp`
  );

  try {
    // O arquivo temporário é escrito por completo antes da substituição.
    await fs.writeFile(tempFile, content, {
      encoding: 'utf8',
      flag: 'wx'
    });

    // Substitui o arquivo principal após a gravação.
    await fs.rename(tempFile, DATA_FILE);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }
}

// Lê os links de forma serializada.
function readLinks() {
  return serialize(() => readUnlocked());
}

// Substitui todo o conteúdo.
// Para operações de leitura + alteração + escrita, prefira updateLinks.
function writeLinks(links) {
  return serialize(() => writeUnlocked(links));
}

// Executa leitura, alteração e gravação como uma única operação serializada.
function updateLinks(mutator) {
  return serialize(async () => {
    const links = await readUnlocked();

    const result = await mutator(links);

    await writeUnlocked(links);

    return result;
  });
}

module.exports = {
  readLinks,
  writeLinks,
  updateLinks
};
