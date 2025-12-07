<template>
  <div ref="chartContainer" class="category-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface CategoryData {
  name: string
  value: number
  slug: string
}

interface Props {
  data: CategoryData[]
}

const props = defineProps<Props>()

const chartContainer = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// 马卡龙配色方案（清新风格）
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

// 初始化图表
const initChart = () => {
  if (!chartContainer.value || !props.data || props.data.length === 0) {
    return
  }

  // 如果已存在实例，先销毁
  if (chartInstance) {
    chartInstance.dispose()
  }

  // 创建 ECharts 实例
  chartInstance = echarts.init(chartContainer.value)

  // 配置项
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(169, 169, 169, 0.2)',
      borderWidth: 1,
      textStyle: {
        color: 'var(--text-color)'
      }
    },
    legend: {
      show: false // 不显示图例，因为标签已经显示在图表上
    },
    series: [
      {
        name: '分类统计',
        type: 'pie',
        radius: ['20%', '70%'], // 内半径和外半径，形成环形
        center: ['50%', '50%'],
        roseType: 'area', // 南丁格尔玫瑰图
        itemStyle: {
          borderRadius: 8, // 圆角
          borderColor: 'var(--card-bg)',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}\n({d}%)',
          fontSize: 12,
          color: 'var(--text-color)',
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
        data: props.data.map((item, index) => ({
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
watch(() => props.data, () => {
  if (chartInstance && props.data && props.data.length > 0) {
    const option: echarts.EChartsOption = {
      series: [
        {
          data: props.data.map((item, index) => ({
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

onMounted(async () => {
  await nextTick()
  initChart()
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
.category-chart {
  width: 100%;
  height: 500px;
  min-height: 400px;
  
  @media (max-width: 768px) {
    height: 400px;
    min-height: 300px;
  }
}
</style>

