<template>
  <div class="login-page">
    <div class="login-shell">
      <div class="login-illustration">
        <img src="/kato-login/1.png" alt="Login" />
      </div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="welcome">
          <div class="welcome-line-1">Hi, Kato</div>
          <div class="welcome-line-2">Welcome Back</div>
        </div>
        <div class="inputs">
          <div class="input-field">
            <input
              v-model="username"
              type="text"
              placeholder="Username"
              autocomplete="username"
              required
            />
          </div>
          <div class="input-field">
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              required
            />
          </div>
        </div>
        <div class="submit-wrapper">
          <button 
            type="submit" 
            class="submit-button" 
            :disabled="loading || !username || !password"
            @click.prevent="handleLogin"
          >
            {{ loading ? '登录中...' : 'LOGIN' }}
          </button>
        </div>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const isAdmin = useState('isAdmin', () => false)

const { isLoggedIn } = useAdmin()

if (isLoggedIn.value) {
  navigateTo('/admin')
}

const handleLogin = async () => {
  if (loading.value) return
  
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  const requestBody = {
    username: username.value,
    password: password.value
  }
  
  errorMessage.value = ''
  loading.value = true
  
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: requestBody
    })

    if (response?.success) {
      isAdmin.value = true
      
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
      errorMessage.value = '登录失败，请检查账号密码'
    }
  } catch (err: any) {
    if (err.statusCode === 500) {
      errorMessage.value = err.data?.statusMessage || err.message || '服务器错误：请检查环境变量配置'
    } else if (err.statusCode === 401) {
      errorMessage.value = err.data?.message || '用户名或密码错误'
    } else {
      errorMessage.value = err.data?.message || err.message || '登录失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
  outline: none;
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #fbda61, #ff5acd) url('/kato-login/background.png') center/cover no-repeat;
  padding: 24px;
}

.login-shell {
  display: flex;
  justify-content: center;
  align-items: stretch;
  background: #fff;
  box-shadow: 0px 15px 40px #b6354e;
  border-radius: 15px;
  overflow: hidden;
}

.login-illustration {
  width: 330px;
  min-height: 520px;
  background: #fff;
}

.login-illustration img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-form {
  width: 320px;
  min-height: 520px;
  background-color: #fff;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 28px;
}

.welcome {
  width: 100%;
  text-align: center;
  line-height: 1.2;
}

.welcome-line-1 {
  color: #7f7f7f;
  font-size: 42px;
  font-weight: 700;
}

.welcome-line-2 {
  color: #9c9c9c;
  font-size: 26px;
  margin-top: 12px;
}

.inputs {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-field {
  padding: 13px 25px;
  border: 2px solid #6e6d6d;
  border-radius: 20px;
  display: flex;
  align-items: center;
  background: #fff;
}

.input-field input {
  width: 100%;
  font-size: 14px;
  border: 0;
  padding: 0;
  margin: 0;
  background: transparent;
}

.input-field input::placeholder {
  color: #b9b9b9;
}

.submit-wrapper {
  width: 100%;
}

.submit-button {
  width: 100%;
  color: #fff;
  font-size: 14px;
  padding: 14px 40px;
  border: 0;
  background-color: #f5506e;
  border-radius: 25px;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(245, 80, 110, 0.35);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-text {
  color: #f5506e;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
  min-height: 20px;
}

@media (max-width: 768px) {
  .login-shell {
    flex-direction: column;
    width: 100%;
    max-width: 360px;
  }

  .login-illustration {
    width: 100%;
    height: 220px;
  }

  .login-form {
    width: 100%;
  }

  .welcome-line-1 {
    font-size: 32px;
  }

  .welcome-line-2 {
    font-size: 20px;
  }
}
</style>
