// Client-side plugin to update head meta tags from app.config.ts
export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  
  // Get site config with fallbacks
  const site = appConfig.site || {}
  const title = site.title || 'Blog'
  const description = site.description || ''
  const author = site.author || ''
  const language = site.language || 'zh-CN'
  
  // Update head meta tags dynamically
  useHead({
    title: title,
    titleTemplate: `%s - ${title}`,
    htmlAttrs: {
      lang: language
    },
    meta: [
      { name: 'description', content: description },
      { name: 'author', content: author },
      { name: 'language', content: language },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:site_name', content: title },
      { property: 'og:locale', content: language.replace('-', '_') },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ]
  })
})

