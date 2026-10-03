# Nicole Krause Massagista — site com painel administrativo

Projeto pronto para publicação na Netlify com integração contínua pelo GitHub.

## O que está incluído

- Site responsivo com páginas dos quatro serviços.
- Painel protegido em `/admin`.
- Login apenas para usuários convidados pelo Netlify Identity.
- Cadastro, edição, ocultação e exclusão de depoimentos.
- Edição dos principais textos, WhatsApp, telefone e Instagram.
- Dados persistidos no Netlify Blobs por funções serverless.
- Conteúdo padrão de segurança caso a função não esteja disponível.

## Publicar pelo GitHub e Netlify

1. Extraia este pacote e envie todos os arquivos para um repositório no GitHub.
2. Na Netlify, escolha **Add new project → Import an existing project → GitHub**.
3. Selecione o repositório. A Netlify lerá `netlify.toml`; não é preciso informar comando de build. Publique o site.
4. No painel da Netlify, abra **Identity**, habilite o serviço e configure o registro como **Invite only**.
5. Em **Identity → Invite users**, convide o e-mail que administrará o site.
6. Abra o e-mail do convite, defina a senha e acesse `https://SEU-SITE.netlify.app/admin`.

Depois disso, todo `push` para a branch principal do GitHub atualiza o site automaticamente. As alterações feitas pelo painel são publicadas imediatamente e não exigem um novo deploy.

## Desenvolvimento e verificação

Requer Node.js 18 ou superior.

```bash
npm install
npm run check
npx netlify dev
```

O servidor local do Netlify simula as funções. O login completo exige um site Netlify com Identity habilitado.

## Estrutura

- `dist/`: site público e painel.
- `netlify/functions/`: leitura pública e gravação autenticada do conteúdo.
- `netlify.toml`: configuração de publicação, funções e cabeçalhos.
- `tests/`: testes da validação do conteúdo.
