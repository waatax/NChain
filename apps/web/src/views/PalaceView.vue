<template>
  <div class="container palace-container">
    <div class="palace-header mb-16">
      <div class="header-badge-row mb-6">
        <span class="hanko-seal">宮殿</span>
        <span class="catalog-subtitle text-muted">記憶法教學與應用</span>
      </div>
      <h2>{{ t('記憶宮殿 (Method of Loci)') }}</h2>
    </div>

    <div class="card mb-16">
      <div class="markdown-body" v-html="tutorialHtml"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../utils/i18n';
import tutorialContent from '../data/palace_tutorial.html?raw';

const { t } = useI18n();
const baseUrl = import.meta.env.BASE_URL;
const processedContent = tutorialContent ? tutorialContent.replace(/src="\/images\//g, `src="${baseUrl}images/`) : '';
const tutorialHtml = ref(processedContent || '<p>Loading...</p>');

</script>

<style scoped>
.palace-container {
  padding-bottom: 80px; /* Safe area for mobile nav */
}

.palace-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.markdown-body {
  line-height: 1.8;
  font-size: 1rem;
  color: var(--text-primary);
}

.markdown-body :deep(h1) {
  font-size: 1.5rem;
  margin-top: 1em;
  margin-bottom: 0.5em;
  border-bottom: 2px solid var(--primary-light);
  padding-bottom: 0.3em;
}

.markdown-body :deep(h2) {
  font-size: 1.3rem;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: var(--primary);
}

.markdown-body :deep(h3) {
  font-size: 1.1rem;
  margin-top: 1.2em;
  margin-bottom: 0.5em;
}

.markdown-body :deep(p) {
  margin-bottom: 1em;
}

.markdown-body :deep(ul), .markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 1em;
}

.markdown-body :deep(li) {
  margin-bottom: 0.5em;
}

.markdown-body :deep(strong) {
  color: var(--accent-gold);
  font-weight: 800;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: var(--border-radius-md);
  margin: 1em 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
