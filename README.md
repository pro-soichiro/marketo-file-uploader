# marketo-file-uploader

# 依存関係

メールの送信にSmtpjsを利用しています。
下記利用方法のようにCDNとして読み込む必要があります。
Send email from Javascript
https://smtpjs.com/

Smtpjsを利用するためのSMTPサーバーにElasticEmailを利用しています。
SMTP Server
https://elasticemail.com/

# 利用方法

下記のHTMLをMarketoに埋め込むことで、`lead.Email`にユーザーのメールアドレスが格納されます。
ファイルをアップロードし、送信するとメールアドレスとファイルを合わせて管理者にメールが送信されます。

```html
<input type="hidden" id="mktoEmail" value="{{lead.Email Address:default=none}}" />
<input type="hidden" id="mktoId" value="{{lead.Id}}" />
<div id="app"></div>
<script src="https://smtpjs.com/v3/smtp.js"></script>

<script>
  fetch('https://pro-soichiro.github.io/marketo-file-uploader/manifest.json')
    .then((response) => response.json())
    .then((manifest) => {
      // CSSの動的追加
      let cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      cssLink.href = `https://pro-soichiro.github.io/marketo-file-uploader/${manifest['index.css']['file']}`
      document.head.appendChild(cssLink)

      // JSの動的追加
      let jsScript = document.createElement('script')
      jsScript.type = 'module'
      jsScript.crossOrigin = ''
      jsScript.src = `https://pro-soichiro.github.io/marketo-file-uploader/${manifest['index.html']['file']}`
      document.body.appendChild(jsScript)
    })
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

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
