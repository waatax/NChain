<template>
  <div class="container">
    <div class="card about-card">
      <div class="text-center mb-16">
        <span class="logo-emoji">🧠</span>
        <h2>關於 數字鎖鏈 NChain</h2>
        <p class="text-muted mt-4">版本 1.0.0 (離線 Web App)</p>
      </div>

      <div class="about-section mt-16">
        <h3>💡 什麼是數字鎖鏈記憶法？</h3>
        <p class="mt-8">
          數字鎖鏈（Number Chain）是一種經典的記憶宮殿聯想記憶法。藉由將 00 到 100 每個數字轉換成具體的「密碼物件」
          (例如 00=鎖鏈, 01=葉子, 02=肥鵝)，並將相鄰的兩個物件用「動態、誇張、色彩鮮明、不合常理」的畫面扣連在一起，
          形成一條視覺鏈結，使你能夠在腦袋裡像看電影一樣，快速地順背、倒背，甚至是抽背整串數字。
        </p>
      </div>

      <div class="about-section mt-16">
        <h3>🔒 隱私與資料安全性說明</h3>
        <p class="mt-8">
          本應用程式為<strong>純本機應用 (Local-First Web App)</strong>：
        </p>
        <ul class="privacy-list mt-8">
          <li>我們的伺服器<strong>不收集、不儲存</strong>您的任何學習數據或作答歷史。</li>
          <li>您的所有進度、複習卡片排程、錯題統計等資訊，均安全地儲存在您的瀏覽器內部資料庫 (IndexedDB) 中。</li>
          <li>您可以在「設定」頁面中，隨時將您的學習數據匯出為 JSON 備份檔，或清除所有本機進度。</li>
        </ul>
      </div>

      <div class="about-section mt-16 text-center">
        <router-link to="/" class="btn btn-secondary w-full">返回首頁</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-card {
  padding: 24px;
  border-radius: var(--border-radius-lg);
}

.logo-emoji {
  font-size: 3.5rem;
  display: block;
}

.about-card h2 {
  font-size: 1.25rem;
  font-weight: 900;
}

.about-section h3 {
  font-size: 0.95rem;
  font-weight: 800;
  border-left: 3.5px solid var(--primary);
  padding-left: 8px;
  color: var(--text-primary);
}

.about-section p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.privacy-list {
  padding-left: 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.privacy-list li {
  margin-bottom: 6px;
}

.w-full {
  width: 100%;
}
</style>
