<template>
  <div class="container">
    <div class="card about-card">
      <div class="text-center mb-20">
        <div class="about-crest-wrapper mx-auto mb-12">
          <div class="about-crest">
            <span>宮</span>
          </div>
        </div>
        <h2>{{ t('關於 NChain 數字鎖鏈記憶學習應用程式') }}</h2>
        <div class="version-badge-row mt-6">
          <span class="hanko-seal">極致版</span>
          <span class="text-muted text-xs">v1.2.0 • Local-First PWA</span>
        </div>
      </div>

      <div class="about-section mt-16">
        <h3 class="flex items-center gap-8">
          <span>💡</span> {{ t('什麼是數字鎖鏈記憶法？') }}
        </h3>
        <p class="mt-8 leading-relaxed">
          {{ t('數字鎖鏈是一種利用「諧音聯想」與「圖像故事」將抽象數字轉化為具體畫面，並透過鏈結方式記憶超長數字的記憶法。') }}
          {{ t('本應用程式專為提供結構化關卡、Leitner 間隔複習卡片，以及各類輔助訓練工具而設計，幫助您快速精熟 00-100 的數字聯想。') }}
        </p>
      </div>

      <div class="about-section mt-20">
        <h3 class="flex items-center gap-8">
          <span>🔒</span> {{ t('隱私與資料安全性說明') }}
        </h3>
        <p class="mt-8 leading-relaxed">
          {{ t('本應用程式為') }}<strong>{{ t('純本機應用 (Local-First Web App)') }}</strong>：
        </p>
        <ul class="privacy-list mt-8">
          <li>{{ t('我們的伺服器不收集、不儲存您的任何學習數據或作答歷史。') }}</li>
          <li>{{ t('您的所有進度、複習卡片排程、錯題統計等資訊，均安全地儲存在您的瀏覽器內部資料庫 (IndexedDB) 中。') }}</li>
          <li>{{ t('您可以在「設定」頁面中，隨時將您的學習數據匯出為 JSON 備份檔，或清除所有本機進度。') }}</li>
        </ul>
      </div>

      <div class="about-section mt-24 text-center">
        <router-link to="/" class="btn btn-primary w-full py-12">{{ t('返回首頁') }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../utils/i18n';
const { t } = useI18n();
</script>

<style scoped>
.about-card {
  padding: 32px 24px;
  border-radius: var(--border-radius-lg);
}

.about-crest-wrapper {
  display: flex;
  justify-content: center;
}

.about-crest {
  width: 56px;
  height: 56px;
  border-radius: var(--border-radius-md);
  background: linear-gradient(135deg, var(--primary), var(--accent-gold));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  font-family: var(--font-family-serif);
  font-weight: 900;
  box-shadow: var(--shadow-md);
}

.version-badge-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.about-card h2 {
  font-size: 1.25rem;
  font-weight: 900;
}

.about-section h3 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary);
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 6px;
}

.about-section p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.privacy-list {
  padding-left: 20px;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

.privacy-list li {
  margin-bottom: 6px;
}
</style>
