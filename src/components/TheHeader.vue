<script>
fetch('https://pro-soichiro.github.io/marketo-file-uploader/manifest.json')
  .then((response) => response.json())
  .then((manifest) => {
    let img = document.createElement('img')
    img.alt = 'furien'
    img.style.height = '2.4rem'
    img.src = `https://pro-soichiro.github.io/marketo-file-uploader/${manifest['src/assets/img/logo.svg']['file']}`
    document.getElementById('headerLogo').appendChild(img)
  })
</script>

<template>
  <header class="header">
    <div id="headerLogo" class="header__logo"></div>
    <img src="@/assets/img/logo.svg" alt="" style="display: none;">
  </header>
</template>

<style lang="scss" scoped>
.header {
  margin: 1rem 0;

  &__logo {
    text-align: center;
  }
}
</style>
