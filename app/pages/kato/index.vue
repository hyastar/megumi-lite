<template>
  <div class="login-page">
    <div class="login-card">
      <h1>管理员登录</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            required
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
            autocomplete="current-password"
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  ssr: false
})

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  const requestBody = {
    username: username.value,
    password: password.value
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: requestBody
    })

    if (response?.success) {
      // 等待一小段时间确保 Cookie 被浏览器保存
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 验证 Cookie 是否已设置
      const authToken = useCookie('auth_token')
      
      if (authToken.value === 'authenticated') {
        // 使用 window.location.href 强制刷新，因为 admin 路由设置了 ssr: false
        window.location.href = '/admin'
      } else {
        // 再等待一下，然后重试
        await new Promise(resolve => setTimeout(resolve, 300))
        const retryToken = useCookie('auth_token')
        if (retryToken.value === 'authenticated') {
          window.location.href = '/admin'
        } else {
          await navigateTo('/admin', { replace: true, external: false })
        }
      }
    } else {
      error.value = '登录失败，请检查账号密码'
    }
  } catch (e: any) {
    error.value = e.data?.message || '用户名或密码错误'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const { isLoggedIn } = useAdmin()
  if (isLoggedIn.value) {
    navigateTo('/admin')
  }
})
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

button {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #5568d3;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
}
</style>
