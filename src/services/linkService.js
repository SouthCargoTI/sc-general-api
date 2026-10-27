
const crypto = require('node:crypto');
const { URL } = require('node:url');

const { updateLinks } = require('../storage/jsonStorage');

const EXPIRATION_HOURS = Number(
  process.env.LINK_EXPIRATION_HOURS || 72
);

const BASE_URL = (process.env.BASE_URL || '').replace(/\/+$/, '');

const ALLOWED_HOSTS = (
  process.env.BOOKINGS_ALLOWED_HOSTS || ''
)
  .split(',')
  .map(host => host.trim().toLowerCase())
  .filter(Boolean);

function validateConfiguration() {
  if (!BASE_URL) {
    throw new Error('BASE_URL não foi configurada.');
  }

  if (!Number.isFinite(EXPIRATION_HOURS) || EXPIRATION_HOURS <= 0) {
    throw new Error('LINK_EXPIRATION_HOURS deve ser maior que zero.');
  }

  if (ALLOWED_HOSTS.length === 0) {
    throw new Error('Nenhum domínio permitido foi configurado.');
  }
}

function validateOriginalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Informe a URL original do Bookings.');
  }

  if (value.length > 2048) {
    throw new Error('A URL não pode ultrapassar 2048 caracteres.');
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error('A URL informada é inválida.');
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new Error('A URL deve utilizar HTTPS.');
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('A URL não pode conter credenciais.');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (!ALLOWED_HOSTS.includes(hostname)) {
    throw new Error('O domínio informado não está autorizado.');
  }

  return parsedUrl.toString();
}


async function createTemporaryLink(urlOriginal, expiracaoHoras) {
  validateConfiguration();

  const validatedUrl = validateOriginalUrl(urlOriginal);

  if (
    typeof expiracaoHoras !== 'number' ||
    !Number.isFinite(expiracaoHoras) ||
    expiracaoHoras <= 0 ||
    expiracaoHoras > 8760
  ) {
    throw new Error(
      'A expiração deve ser um número de horas maior que zero e de até 8760 horas.'
    );
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const dataCriacao = new Date();

  const dataExpiracao = new Date(
    dataCriacao.getTime() + expiracaoHoras * 60 * 60 * 1000
  );

  const link = {
    token,
    urlOriginal: validatedUrl,
    dataCriacao: dataCriacao.toISOString(),
    dataExpiracao: dataExpiracao.toISOString(),
    ativo: true
  };

  await updateLinks(links => {
    links.push(link);
  });

  return {
    urlTemporaria: `${BASE_URL}/l/${token}`,
    dataCriacao: link.dataCriacao,
    dataExpiracao: link.dataExpiracao
  };
}


module.exports = {
  createTemporaryLink
};
