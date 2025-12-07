export default defineAppConfig({
  site: {
    title: "Fomalhaut🥝",
    description: "Future is now 🍭🍭🍭"
  },
  themeConfig: {
    menu: [
      { name: '首页', path: '/' },
      { 
        name: '文章', 
        path: '/articles',
        children: [
          { name: '归档', path: '/archives' },
          { name: '标签', path: '/tags' },
          { name: '分类', path: '/categories' }
        ]
      },
      { 
        name: '统计', 
        path: '/stats',
        children: [
          { name: '网站统计', path: '/site/census' },
          { name: '文章统计', path: '/site/echarts' }
        ]
      },
      { name: '友链', path: '/social/link' },
      { name: '关于', path: '/about' }
    ]
  }
})
