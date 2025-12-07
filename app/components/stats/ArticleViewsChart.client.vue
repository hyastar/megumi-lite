<template>
  <div class="chart-wrapper">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { TreemapChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

const props = defineProps<{ data: Array<{ name: string; value: number; slug: string }> }>()

// register treemap + tooltip + renderer
echarts.use([TreemapChart, TooltipComponent, CanvasRenderer])

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
const router = useRouter()

const colors = [
  '#49b1f5', '#ff7242', '#ff6b9d', '#43e97b',
  '#fa709a', '#fee140', '#30cfd0', '#9055ff'
]

const initChart = async () => {
  await nextTick()
  if (!chartRef.value) {
    return
  }
  if (chart) {
    chart.dispose()
  }

  chart = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      formatter: (params: any) => {
        return `<div style="padding:8px">
          <div style="font-weight:bold;margin-bottom:4px">${params.name}</div>
          <div>阅读量: <span style="color:#49b1f5;font-weight:bold">${params.value}</span></div>
        </div>`
      }
    },
    series: [
      {
        type: 'treemap',
        width: '95%',
        height: '95%',
        top: '2.5%',
        bottom: '2.5%',
        left: '2.5%',
        right: '2.5%',
        data: props.data || [],
        visualDimension: false,
        label: {
          show: true,
          formatter: '{b}',
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
          overflow: 'truncate',
          ellipsis: '...'
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#fff',
          gapWidth: 2,
          color: (params: any) => {
            const palette = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']
            return palette[params.dataIndex % palette.length]
          }
        },
        breadcrumb: { show: false },
        roam: false
      }
    ]
  }

  chart.setOption(option, true)

  chart.on('click', (params: any) => {
    if (params.data && params.data.slug) {
      router.push(`/articles/${params.data.slug}`)
    }
  })

  // 强制一次 resize
  setTimeout(() => {
    chart?.resize()
  }, 100)
}

const handleResize = () => chart?.resize()

onMounted(async () => {
  await initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})

watch(
  () => props.data,
  async () => {
    await initChart()
    chart?.resize()
  },
  { immediate: true, deep: false }
)
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 500px;
  min-height: 500px;
  position: relative;
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  box-sizing: border-box;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 450px;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
