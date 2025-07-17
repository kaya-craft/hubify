<script setup lang="ts">
const state = reactive({
  email: '',
  password: ''
})

async function login() {
  const data = await $fetch('/api/auth/login', {
    method: 'POST',
    body: {
      email: state.email,
      password: state.password
    }
  })

  console.log('Login successful:', data)
}

async function register() {
  const data = await $fetch('/api/auth/register', {
    method: 'POST',
    body: {
      email: state.email,
      password: state.password
    }
  })

  console.log('Registration successful:', data)
}
</script>

<template>
  <form @submit.prevent="register">
    <input
      v-model="state.email"
      type="email"
      placeholder="Email"
    >
    <input
      v-model="state.password"
      type="password"
      placeholder="Password"
    >
    <button type="submit">
      Register
    </button>
  </form>

  <form @submit.prevent="login">
    <input
      v-model="state.email"
      type="email"
      placeholder="Email"
    >
    <input
      v-model="state.password"
      type="password"
      placeholder="Password"
    >
    <button type="submit">
      Login
    </button>
  </form>
</template>
