export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public

  // 51.la
  if (config.analyticsProvider === '51la' && config.laId && config.laCk) {
    useHead({
      script: [
        {
          src: '//sdk.51.la/js-sdk-pro.min.js',
          id: 'LA_COLLECT',
          charset: 'UTF-8'
        },
        {
          innerHTML: `LA.init({id:"${config.laId}",ck:"${config.laCk}",hashMode:true})`,
          type: 'text/javascript'
        }
      ]
    })
    console.log('✅ 51.la Analytics loaded')
  }
  // Umami
  else if (config.analyticsProvider === 'umami' && config.umamiId && config.umamiHost) {
    useHead({
      script: [
        {
          src: `${config.umamiHost}/script.js`,
          async: true,
          'data-website-id': config.umamiId
        }
      ]
    })
    console.log('✅ Umami Analytics loaded')
  }
})
