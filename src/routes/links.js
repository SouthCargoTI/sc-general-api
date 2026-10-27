
const express = require('express');
const { createTemporaryLink } = require('../services/linkService');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const router = express.Router();

router.post('/', apiKeyAuth, async (req, res) => {
  try {
    const { urlOriginal, expiracaoHoras } = req.body || {};

    if (!urlOriginal) {
      return res.status(400).json({
        ok: false,
        mensagem: 'O campo urlOriginal é obrigatório.'
      });
    }

    if (expiracaoHoras === undefined || expiracaoHoras === null) {
      return res.status(400).json({
        ok: false,
        mensagem: 'O campo expiracaoHoras é obrigatório.'
      });
    }

    const link = await createTemporaryLink(
      urlOriginal,
      expiracaoHoras
    );

    return res.status(201).json({
      ok: true,
      mensagem: 'Link temporário criado com sucesso.',
      ...link
    });
  } catch (error) {
    const validationErrors = [
      'Informe a URL original do Bookings.',
      'A URL não pode ultrapassar 2048 caracteres.',
      'A URL informada é inválida.',
      'A URL deve utilizar HTTPS.',
      'A URL não pode conter credenciais.',
      'O domínio informado não está autorizado.',
      'A expiração deve ser um número de horas maior que zero e de até 8760 horas.'
    ];

    if (validationErrors.includes(error.message)) {
      return res.status(400).json({
        ok: false,
        mensagem: error.message
      });
    }

    console.error('Erro ao criar link temporário:', error);

    return res.status(500).json({
      ok: false,
      mensagem: 'Não foi possível criar o link temporário.'
    });
  }
});

module.exports = router;
