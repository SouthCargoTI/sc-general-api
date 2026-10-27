
const crypto = require('node:crypto');

function apiKeyAuth(req, res, next) {
  const expectedKey = process.env.API_KEY;
  const providedKey = req.get('x-api-key');

  if (!expectedKey) {
    console.error('API_KEY não configurada no servidor.');

    return res.status(500).json({
      ok: false,
      mensagem: 'Autenticação não configurada no servidor.'
    });
  }

  if (typeof providedKey !== 'string') {
    return res.status(401).json({
      ok: false,
      mensagem: 'Chave de autenticação inválida.'
    });
  }

  const expectedBuffer = Buffer.from(expectedKey, 'utf8');
  const providedBuffer = Buffer.from(providedKey, 'utf8');

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return res.status(401).json({
      ok: false,
      mensagem: 'Chave de autenticação inválida.'
    });
  }

  next();
}

module.exports = apiKeyAuth;
