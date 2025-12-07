import { defineNuxtPlugin } from '#app'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueViewer, {
    defaultOptions: {
      zIndex: 9999,
      toolbar: true,
      title: false,
      movable: true,
      zoomable: true,
      rotatable: false,
      scalable: false,
      tooltip: true,
      transition: true,
      fullscreen: true,
      keyboard: true,
    }
  })
})