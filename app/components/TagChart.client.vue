<template>
  <div ref="chartContainer" class="tag-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'

interface TagData {
  name: string
  slug: string
  count: number
}

interface Props {
  tags: TagData[]
}

const props = defineProps<Props>()

const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// Hexo 风格的马卡龙/糖果色系
const macaronColors = [
  '#49b1f5', // 主题蓝
  '#ff7242', // 橙
  '#ff6b9d', // 粉
  '#c44569', // 深粉
  '#f093fb', // 浅粉
  '#4facfe', // 天蓝
  '#43e97b', // 绿
  '#fa709a', // 玫红
  '#fee140', // 黄
  '#30cfd0', // 青
  '#a8edea', // 浅青
  '#ff9a9e', // 浅粉红
  '#fecfef', // 淡粉
  '#fad0c4', // 淡橙
  '#ffd1ff', // 淡紫
  '#b8e6b8', // 淡绿
  '#b3d9ff', // 淡蓝
  '#ffcccb', // 淡红
]

// 处理标签数据：排序、取前15个、转换为图表格式
const chartData = computed(() => {
  if (!props.tags || props.tags.length === 0) return []
  
  // 按文章数量降序排序
  const sorted = [...props.tags].sort((a, b) => b.count - a.count)
  
  // 取前15个
  const top15 = sorted.slice(0, 15)
  
  // 转换为 ECharts 格式
  return top15.map(tag => ({
    name: tag.name,
    value: tag.count
  }))
})

// 获取当前主题颜色（用于暗色模式）
const getTextColor = () => {
  if (typeof window === 'undefined') return '#4c4948'
  
  // 检查是否处于暗色模式
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                 document.documentElement.classList.contains('dark') ||
                 document.documentElement.getAttribute('data-theme') === 'dark'
  
  return isDark ? '#e8e8e8' : '#4c4948'
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value || !chartData.value || chartData.value.length === 0) {
    return
  }

  // 如果已存在实例，先销毁
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 创建 ECharts 实例
  chartInstance = echarts.init(chartContainer.value)

  const textColor = getTextColor()

  // 配置项
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(169, 169, 169, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: textColor
      }
    },
    legend: {
      show: false // 不显示图例
    },
    series: [
      {
        name: '标签统计',
        type: 'pie',
        radius: [30, 150], // 内半径到外半径
        center: ['50%', '50%'],
        roseType: 'area', // 南丁格尔玫瑰图（面积模式）
        itemStyle: {
          borderRadius: 8, // 圆角扇形
          borderColor: 'var(--card-bg)',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}', // 显示：标签名: 数量
          fontSize: 12,
          color: textColor,
          fontWeight: 500
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            color: 'var(--text-secondary)'
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            fontSize: 14,
            fontWeight: 600
          }
        },
        data: chartData.value.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: macaronColors[index % macaronColors.length]
          }
        }))
      }
    ]
  }

  // 设置配置项并渲染
  chartInstance.setOption(option)

  // 监听窗口大小变化
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }

  window.addEventListener('resize', handleResize)

  // 使用 ResizeObserver 监听容器大小变化（更精确）
  if (window.ResizeObserver && chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      if (chartInstance) {
        chartInstance.resize()
      }
    })
    resizeObserver.observe(chartContainer.value)
  }

  // 清理函数
  return () => {
    window.removeEventListener('resize', handleResize)
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  }
}

// 监听数据变化
watch(() => chartData.value, () => {
  if (chartInstance && chartData.value && chartData.value.length > 0) {
    const textColor = getTextColor()
    const option: echarts.EChartsOption = {
      tooltip: {
        textStyle: {
          color: textColor
        }
      },
      series: [
        {
          label: {
            color: textColor
          },
          data: chartData.value.map((item, index) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: macaronColors[index % macaronColors.length]
            }
          }))
        }
      ]
    }
    chartInstance.setOption(option)
  }
}, { deep: true })

// 监听主题变化（暗色模式切换）
const observeThemeChange = () => {
  if (typeof window === 'undefined') return
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleThemeChange = () => {
    if (chartInstance && chartData.value && chartData.value.length > 0) {
      const textColor = getTextColor()
      chartInstance.setOption({
        tooltip: {
          textStyle: {
            color: textColor
          }
        },
        series: [{
          label: {
            color: textColor
          }
        }]
      })
    }
  }
  
  mediaQuery.addEventListener('change', handleThemeChange)
  
  return () => {
    mediaQuery.removeEventListener('change', handleThemeChange)
  }
}

onMounted(async () => {
  await nextTick()
  initChart()
  observeThemeChange()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style scoped lang="scss">
.tag-chart {
  width: 100%;
  height: 500px;
  min-height: 400px;
  
  @media (max-width: 768px) {
    height: 400px;
    min-height: 300px;
  }
}
</style>

