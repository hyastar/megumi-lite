// server/utils/seo-push.ts

export const pushToSearchEngines = async (path: string) => {
  const config = useRuntimeConfig()

  // 🛡️ 安全锁：本地开发、localhost、非生产环境坚决不推
  if (
    process.env.NODE_ENV !== 'production' ||
    config.public.siteUrl.includes('localhost') ||
    config.public.siteUrl.includes('127.0.0.1')
  ) {
    console.log('🚧 [SEO Dev] 模拟推送 (已跳过):', path)
    return
  }

  // 拼接完整 URL: https://blog.hyastar.net/blog/xxx
  const fullUrl = `${config.public.siteUrl}${path}`
  console.log('🚀 [SEO Prod] 开始全网推送:', fullUrl)

  const promises = []

  // 1. 百度主动推送 (国内核心)
  if (config.baiduToken) {
    const baiduUrl = `http://data.zz.baidu.com/urls?site=${config.public.siteUrl}&token=${config.baiduToken}`
    const baiduPush = $fetch(baiduUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: fullUrl,
    })
      .then(res => console.log('✅ [Baidu] 推送成功:', res))
      .catch(e => console.error('❌ [Baidu] 推送失败:', e.message))

    promises.push(baiduPush)
  }

  // 2. IndexNow 推送 (涵盖 Bing, Yahoo, Yandex 等国际引擎)
  // IndexNow 是目前最高效的国际推送协议
  if (config.indexNowKey) {
    const domain = config.public.siteUrl.replace(/^https?:\/\//, '') // 去掉 https://
    const indexNowBody = {
      host: domain,
      key: config.indexNowKey,
      keyLocation: `${config.public.siteUrl}/${config.indexNowKey}.txt`, // 验证文件位置
      urlList: [fullUrl],
    }

    const bingPush = $fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: indexNowBody,
    })
      .then(() => console.log('✅ [IndexNow/Bing] 推送成功'))
      .catch(e => console.error('❌ [IndexNow/Bing] 推送失败:', e.message))

    promises.push(bingPush)
  }

  // 3. Google (Google 已停止 Ping 接口，完全依赖 Sitemap)
  // 我们不需要做任何操作，只要保证 sitemap.xml 是最新的即可。

  // 并行执行所有推送，不阻塞主线程
  await Promise.allSettled(promises)
}
