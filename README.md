# Kelly Morais UGC

Portfolio online da Kelly Morais, criadora de conteudo UGC.

## Publicar no GitHub Pages

1. No repositorio do GitHub, abra `Settings` > `Pages`.
2. Em `Build and deployment`, selecione `GitHub Actions` como source e salve.
3. Na pasta deste projeto, configure o remoto:

```bash
git remote add origin https://github.com/SEU_USUARIO/kelly-morais-portfolio.git
```

4. Envie a branch principal:

```bash
git push -u origin main
```

O workflow em `.github/workflows/deploy.yml` publica automaticamente o site no GitHub Pages a cada novo push em `main`.

## Atualizar o portfolio

Edite `index.html`, `styles.css` ou `script.js`, depois rode:

```bash
git add .
git commit -m "Atualiza portfolio"
git push
```

Em alguns minutos, o GitHub Pages atualiza o site.

## Conteudo

- `index.html`: estrutura e conteudo da landing page.
- `styles.css`: identidade visual e responsividade.
- `script.js`: carrosseis, filtros e interacoes.
