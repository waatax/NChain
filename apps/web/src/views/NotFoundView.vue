<template>
  <div class="container text-center mt-16">
    <div class="card error-card">
      <span class="icon">🔍</span>
      <h2>404 - 找不到頁面</h2>
      <p class="text-muted mt-8">您訪問的頁面不存在或已被移動。</p>
      <router-link to="/" class="btn btn-primary mt-16">返回主頁</router-link>
    </div>
  </div>
</template>

<style scoped>
.error-card {
  padding: 40px 24px;
  border-radius: var(--border-radius-lg);
}

.icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
}
</style>
