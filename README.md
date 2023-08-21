# marketo-file-uploader

# Dependents

Send email from Javascript
https://smtpjs.com/

SMTP Server
https://elasticemail.com/

# Usage

```html
<div id="app"></div>
<script src="https://smtpjs.com/v3/smtp.js"></script>

<script>

  fetch(
    "https://pro-soichiro.github.io/marketo-file-uploader/manifest.json"
  )
    .then((response) => response.json())
    .then((manifest) => {
      // CSSの動的追加
      let cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = `https://pro-soichiro.github.io/marketo-file-uploader/${manifest["index.css"]["file"]}`;
      document.head.appendChild(cssLink);

      // JSの動的追加
      let jsScript = document.createElement("script");
      jsScript.type = "module";
      jsScript.crossOrigin = "";
      jsScript.src = `https://pro-soichiro.github.io/marketo-file-uploader/${manifest["index.html"]["file"]}`;
      document.body.appendChild(jsScript);
    });
</script>
```

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
