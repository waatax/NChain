<template>
  <div class="container science-container">
    <div class="science-view-header mb-16">
      <div class="header-badge-row mb-6">
        <span class="hanko-seal">科學</span>
        <span class="catalog-subtitle text-muted">腦神經科學與認知心理學</span>
      </div>
      <h2>{{ t('記憶科學與學習原理') }}</h2>
    </div>

    <div class="card mb-24">
      <MemoryScienceInfo />
    </div>

    <div class="bottom-actions text-center mt-20">
      <router-link to="/" class="btn btn-secondary mr-8">
        📊 {{ t('返回概覽') }}
      </router-link>
      <router-link to="/palace" class="btn btn-primary">
        🏰 {{ t('探索記憶宮殿') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../utils/i18n';
import MemoryScienceInfo from '../components/MemoryScienceInfo.vue';

const { t } = useI18n();
</script>

<style scoped>
.science-container {
  padding-bottom: 80px;
}

.science-view-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
