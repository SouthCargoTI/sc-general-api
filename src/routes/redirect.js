
const express = require('express');
const { readLinks } = require('../storage/jsonStorage');

const router = express.Router();

const ALLOWED_HOSTS = (process.env.BOOKINGS_ALLOWED_HOSTS || '')
  .split(',')
  .map(host => host.trim().toLowerCase())
  .filter(Boolean);


function renderStatusPage(res, statusCode, title, message) {
  return res.status(statusCode).type('html').send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#102b46">

  <title>${title} | South Cargo</title>

  <style>
    :root {
      --navy: #102b46;
      --blue: #168bc4;
      --text: #263849;
      --muted: #6d7883;
      --line: #dfe5e9;
      --background: #f7f8f8;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Arial, Helvetica, sans-serif;
      color: var(--navy);
      background: var(--background);
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: inherit;
    }

    .top-line {
      height: 5px;
      background: var(--blue);
    }

    .site-header {
      background: #fff;
      border-bottom: 1px solid var(--line);
    }

    .header-inner {
      width: min(1180px, calc(100% - 64px));
      min-height: 92px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    .brand {
      display: inline-flex;
      flex-direction: column;
      text-decoration: none;
      line-height: 1;
    }

    .brand-name {
      font-size: 27px;
      font-weight: 800;
      letter-spacing: -1.5px;
      text-transform: lowercase;
    }

    .brand-caption {
      margin-top: 8px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2.4px;
      text-transform: uppercase;
      color: var(--muted);
    }

    .header-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      color: var(--muted);
    }

    main {
      width: min(1180px, calc(100% - 64px));
      margin: 0 auto;
    }

    .content {
      min-height: 590px;
      display: grid;
      grid-template-columns: 1fr 0.85fr;
      align-items: center;
      gap: 90px;
      padding: 85px 0;
    }

    .eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 30px;
      color: var(--blue);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .eyebrow::before {
      content: "";
      display: block;
      width: 35px;
      height: 2px;
      background: var(--blue);
    }

    h1 {
      max-width: 600px;
      margin: 0;
      font-size: clamp(44px, 5.8vw, 76px);
      line-height: 0.99;
      font-weight: 700;
      letter-spacing: -4px;
      text-transform: lowercase;
    }

    h1 span {
      color: var(--blue);
    }

    .description {
      max-width: 475px;
      margin: 28px 0 0;
      font-size: 17px;
      line-height: 1.9;
      color: var(--text);
    }

    .action-area {
      margin-top: 34px;
    }

    .button {
      display: inline-flex;
      min-height: 52px;
      align-items: center;
      justify-content: center;
      gap: 24px;
      padding: 0 22px;
      border: 1px solid var(--navy);
      background: var(--navy);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s;
    }

    .button:hover {
      background: var(--blue);
      border-color: var(--blue);
    }

    .button-arrow {
      font-size: 20px;
      font-weight: 400;
    }

    .visual {
      position: relative;
      min-height: 390px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--navy);
    }

    .visual::before,
    .visual::after {
      content: "";
      position: absolute;
      width: 290px;
      height: 290px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 50%;
    }

    .visual::before {
      transform: translate(-35px, -30px);
    }

    .visual::after {
      width: 210px;
      height: 210px;
      transform: translate(30px, 35px);
    }

    .visual-content {
      position: relative;
      z-index: 1;
      width: 100%;
      padding: 40px;
      color: #fff;
    }

    .visual-icon {
      display: flex;
      width: 66px;
      height: 66px;
      align-items: center;
      justify-content: center;
      margin-bottom: 45px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #fff;
    }

    .visual-icon svg {
      width: 32px;
      height: 32px;
    }

    .visual-kicker {
      margin-bottom: 16px;
      color: #72c9ef;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .visual-title {
      max-width: 320px;
      font-size: clamp(27px, 3vw, 39px);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -1px;
    }

    .visual-description {
      max-width: 300px;
      margin-top: 16px;
      color: #d5e0e9;
      font-size: 14px;
      line-height: 1.8;
    }

    .footer {
      border-top: 1px solid var(--line);
      background: #fff;
    }

    .footer-inner {
      width: min(1180px, calc(100% - 64px));
      min-height: 85px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .footer-brand {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: lowercase;
    }

    .footer-note {
      font-size: 11px;
      color: var(--muted);
      text-align: right;
    }

    @media (max-width: 800px) {
      .header-inner,
      main,
      .footer-inner {
        width: calc(100% - 40px);
      }

      .header-inner {
        min-height: 78px;
      }

      .header-label {
        font-size: 9px;
        letter-spacing: 1px;
        text-align: right;
      }

      .content {
        min-height: auto;
        grid-template-columns: 1fr;
        gap: 45px;
        padding: 65px 0 55px;
      }

      h1 {
        font-size: clamp(46px, 10vw, 68px);
        letter-spacing: -2.5px;
      }

      .description {
        font-size: 16px;
      }

      .visual {
        min-height: 300px;
      }

      .visual-content {
        padding: 32px;
      }

      .visual-icon {
        margin-bottom: 30px;
      }

      .footer-inner {
        min-height: 78px;
      }
    }

    @media (max-width: 420px) {
      .brand-name {
        font-size: 23px;
      }

      .brand-caption {
        font-size: 8px;
        letter-spacing: 1.5px;
      }

      .header-label {
        max-width: 110px;
        line-height: 1.6;
      }

      .footer-note {
        max-width: 150px;
        line-height: 1.6;
      }
    }
  </style>
</head>

<body>
  <div class="top-line"></div>

  <header class="site-header">
    <div class="header-inner">
      <a class="brand"
         href="https://southcargo.com/"
         aria-label="South Cargo - página inicial">
        <span class="brand-name">south cargo</span>
        <span class="brand-caption">conectando você ao mundo</span>
      </a>

      <div class="header-label">
        Conexões que movem o mundo
      </div>
    </div>
  </header>

  <main>
    <section class="content">
      <div class="text-content">
        <div class="eyebrow">Link de agendamento</div>

        <h1>${title === 'Este link expirou'
          ? 'o tempo deste link <span>chegou ao fim.</span>'
          : title === 'Link não encontrado'
            ? 'não encontramos <span>este link.</span>'
            : 'este link está <span>indisponível.</span>'}
        </h1>

        <p class="description">${message}</p>

        <div class="action-area">
          <a class="button"
             href="https://southcargo.com/"
             target="_blank"
             rel="noopener noreferrer">
            Acesse a South Cargo
            <span class="button-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <aside class="visual" aria-label="Informações sobre o agendamento">
        <div class="visual-content">
          <div class="visual-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.4"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 7v5l3 2"></path>
            </svg>
          </div>

          <div class="visual-kicker">Vamos manter a conexão</div>

          <div class="visual-title">
            Novos caminhos começam com uma nova conexão.
          </div>

        </div>
      </aside>
    </section>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">south cargo</div>
      <div class="footer-note">
        Conectando empresas e pessoas ao redor do mundo.
      </div>
    </div>
  </footer>
</body>
</html>`);
}

router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return renderStatusPage(
        res,
        404,
        'Link não encontrado',
        'Não foi possível encontrar o link solicitado. Verifique o endereço recebido.'
      );
    }

    const links = await readLinks();
    const link = links.find(item => item.token === token);

    if (!link) {
      return renderStatusPage(
        res,
        404,
        'Link não encontrado',
        'Este link não existe ou não está mais disponível.'
      );
    }

    if (link.ativo !== true) {
      return renderStatusPage(
        res,
        410,
        'Link indisponível',
        'Este link foi desativado e não pode mais ser utilizado.'
      );
    }

    const expiracao = Date.parse(link.dataExpiracao);

    if (!Number.isFinite(expiracao) || Date.now() >= expiracao) {
      return renderStatusPage(
        res,
        410,
        'Este link expirou',
        'O prazo de validade deste link de agendamento chegou ao fim.'
      );
    }

    let destino;

    try {
      destino = new URL(link.urlOriginal);
    } catch {
      return renderStatusPage(
        res,
        410,
        'Link indisponível',
        'Não foi possível validar o destino deste link.'
      );
    }

    if (
      destino.protocol !== 'https:' ||
      destino.username ||
      destino.password ||
      !ALLOWED_HOSTS.includes(destino.hostname.toLowerCase())
    ) {
      return renderStatusPage(
        res,
        410,
        'Link indisponível',
        'O destino deste link não pode ser acessado com segurança.'
      );
    }

    return res.redirect(302, destino.toString());

  } catch (error) {
    console.error('Erro ao validar link temporário:', error);

    return res.status(500).type('html').send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erro temporário | South Cargo</title>
</head>
<body style="font-family:Arial,sans-serif;text-align:center;padding:60px 20px;color:#102b46">
  <h1>Não foi possível acessar o link</h1>
  <p>Ocorreu um erro temporário. Tente novamente mais tarde.</p>
  <a href="https://southcargo.com/">Acessar o site da South Cargo</a>
</body>
</html>`);
  }
});

module.exports = router;
