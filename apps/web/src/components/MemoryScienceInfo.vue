<template>
  <div class="memory-science-info">
    <div class="science-header text-center mb-24">
      <div class="science-badge">
        <span class="badge-dot"></span>
        <span>大腦科學與學習機制</span>
      </div>
      <h2 class="science-main-title">數字鎖鏈記憶法</h2>
      <p class="science-subtitle">認知心理學與腦神經科學的底層原理</p>
      <p class="science-desc">
        「數字鎖鏈」不僅是一套高效的記憶技巧，其背後有著嚴謹的<strong>認知心理學</strong>與<strong>腦神經生物學</strong>基礎。透過多感官編碼、空間定位與間隔提取，直接驅動大腦突觸結構的長期改變。
      </p>
    </div>

    <!-- Interactive Navigation Pills -->
    <div class="science-nav-pills mb-24">
      <button 
        class="nav-pill" 
        :class="{ active: activeSection === 'neuro' }"
        @click="activeSection = 'neuro'"
      >
        🧠 腦神經科學
      </button>
      <button 
        class="nav-pill" 
        :class="{ active: activeSection === 'cog' }"
        @click="activeSection = 'cog'"
      >
        🧩 認知心理學
      </button>
      <button 
        class="nav-pill" 
        :class="{ active: activeSection === 'lab' }"
        @click="activeSection = 'lab'"
      >
        ⚡ 互動科學實驗室
      </button>
    </div>

    <!-- Section 1: Neuroscience -->
    <div v-show="activeSection === 'neuro'" class="science-tab-content">
      <div class="science-card mb-20">
        <div class="card-icon-title">
          <span class="topic-icon">🧬</span>
          <div>
            <h3>1.1 海馬迴 (Hippocampus)：大腦的記憶轉運站</h3>
            <span class="topic-en">Memory Consolidation & Episodic Indexing</span>
          </div>
        </div>
        <p class="card-text">
          海馬迴位於大腦顳葉深處，負責將短期工作記憶轉化為大腦皮層的永久長期記憶（記憶鞏固）。當我們學習新資訊時，資訊由大腦皮層感知後傳入海馬迴進行多感官綁定。<br><br>
          大腦在演化上天生具備強大的<strong>空間導航</strong>與<strong>視覺事件記憶</strong>能力，卻難以直接處理抽象符號。數字鎖鏈法將枯燥的數字轉換為鮮明的人物、動作與場景，直接激活海馬迴的「情節記憶」迴路，達到過目不忘的效果。
        </p>
        <div class="img-wrapper mt-16">
          <img :src="getImageUrl('hippocampal_network_1787103068773.jpg')" alt="海馬迴與記憶鞏固" class="science-img" loading="lazy" />
          <span class="img-caption">圖 1：海馬迴將多感官訊號投射並鞏固至大腦皮質各功能區</span>
        </div>
      </div>

      <div class="science-card mb-20">
        <div class="card-icon-title">
          <span class="topic-icon">⚡</span>
          <div>
            <h3>1.2 長期增強作用 (LTP) 與突觸可塑性</h3>
            <span class="topic-en">Synaptic Plasticity & "Fire Together, Wire Together"</span>
          </div>
        </div>
        <p class="card-text">
          大腦記憶的物理基礎是神經元突觸連接強度的改變（神經可塑性）。著名的赫布定律（Hebb's Rule）指出：<strong>「同步激發的神經元，會牢固地連接在一起」(Neurons that fire together, wire together)</strong>。<br><br>
          當我們將「2 (天鵝)」與「8 (雪人)」在腦海中進行生動互動時，代表這兩組概念的神經元群集在極短時間內同步放電。這會促使突觸前膜釋放大量麩胺酸 (Glutamate)，活化突觸後膜的 NMDA 受體，引發鈣離子 (\(\text{Ca}^{2+}\)) 大量內流，最終使突觸後膜生成更多 AMPA 受體，使突觸訊號傳導強度倍增（即 LTP 現象）。
        </p>
        <div class="img-grid-2 mt-16">
          <div class="img-wrapper">
            <img :src="getImageUrl('synaptic_ltp_process_1787103078880.jpg')" alt="突觸 LTP 分子機制" class="science-img" loading="lazy" />
            <span class="img-caption">圖 2：突觸間隙神經傳導與樹突棘增強</span>
          </div>
          <div class="img-wrapper">
            <img :src="getImageUrl('number_chain_neural_1787103089191.jpg')" alt="神經元同步激發" class="science-img" loading="lazy" />
            <span class="img-caption">圖 3：數字意象連鎖反應激發神經迴路超導</span>
          </div>
        </div>
      </div>

      <div class="science-card">
        <div class="card-icon-title">
          <span class="topic-icon">🔥</span>
          <div>
            <h3>1.3 杏仁核情緒強化 (Emotional Salience)</h3>
            <span class="topic-en">Amygdala Modulation & Priority Encoding</span>
          </div>
        </div>
        <p class="card-text">
          鄰近海馬迴的<strong>杏仁核 (Amygdala)</strong> 專司處理情緒與威脅。演化生物學證明：帶有驚奇、幽默、誇張或荒謬色彩的情節會觸發去甲腎上腺素與多巴胺釋放，向海馬迴發送「此資訊極重要」的生物標記，將編碼效率提升 300% 以上。
        </p>
      </div>
    </div>

    <!-- Section 2: Cognitive Psychology -->
    <div v-show="activeSection === 'cog'" class="science-tab-content">
      <div class="science-card mb-20">
        <div class="card-icon-title">
          <span class="topic-icon">🖼️</span>
          <div>
            <h3>2.1 雙碼理論 (Dual Coding Theory)</h3>
            <span class="topic-en">Paivio's Dual-Channel Cognitive Model</span>
          </div>
        </div>
        <p class="card-text">
          認知心理學家 Allan Paivio 提出的「雙碼理論」表明，人類大腦具有兩個獨立卻相輔相成的資訊處理系統：<strong>語言編碼系統（文字、數字）</strong>與<strong>非語言編碼系統（圖像、空間）</strong>。<br><br>
          傳統死記硬背僅依賴單一語言通道，極易遺忘；數字鎖鏈法讓每個數字同時具有「符號標籤」與「高清心像」，在大腦中形成雙重索引路徑。即便語言線索模糊，視覺心像仍可瞬間精準提取。
        </p>
        <div class="img-wrapper mt-16">
          <img :src="getImageUrl('dual_coding_brain_1787102788742.jpg')" alt="雙碼理論左右腦協同" class="science-img max-w-md" loading="lazy" />
          <span class="img-caption">圖 4：左腦符號邏輯與右腦意象故事的雙通道深度結合</span>
        </div>
      </div>

      <div class="science-card mb-20">
        <div class="card-icon-title">
          <span class="topic-icon">📦</span>
          <div>
            <h3>2.2 意元集組 (Chunking)：突破 \(7 \pm 2\) 工作記憶極限</h3>
            <span class="topic-en">Overcoming Working Memory Capacity Limits</span>
          </div>
        </div>
        <p class="card-text">
          心理學大師 George A. Miller 著名的研究指出，人類工作記憶（Working Memory）的瞬時容量僅為 \(7 \pm 2\) 個獨立單元（Chunks）。面對長達 20 位的長數字，大腦會迅速超載崩潰。<br><br>
          <strong>意元集組 (Chunking)</strong> 是將離散零碎的資料打包成有意義的高階單元。數字鎖鏈法將每兩個數字組合成一個具象角色（例如 45 師傅、21 鱷魚），一串 20 位的無意義數字瞬間被精簡為「一場 5 個角色的微型冒險故事」，將大腦認知負荷降低至 1/4！
        </p>
        <div class="img-wrapper mt-16">
          <img :src="getImageUrl('memory_chunking_1787102811683.jpg')" alt="意元集組壓縮視覺化" class="science-img max-w-md" loading="lazy" />
          <span class="img-caption">圖 5：散亂數字經由情節編碼壓縮為高度有序的記憶模組</span>
        </div>
      </div>

      <div class="science-card mb-20">
        <div class="card-icon-title">
          <span class="topic-icon">⏳</span>
          <div>
            <h3>2.3 艾賓浩斯遺忘曲線與間隔複習 (Spaced Repetition)</h3>
            <span class="topic-en">Ebbinghaus Forgetting Curve & The Spacing Effect</span>
          </div>
        </div>
        <p class="card-text">
          根據艾賓浩斯遺忘曲線公式 \(R = e^{-t/S}\)（\(R\) 為記憶保留率，\(t\) 為時間，\(S\) 為記憶強度），初次學習後 20 分鐘記憶即流失 42%，1 天後流失高達 67%。<br><br>
          NChain 內建的 <strong>Leitner 盒子間隔複習演算法</strong>，在記憶即將衰減的「臨界點」精準觸發複習，使遺忘曲線斜率每次複習後大幅平緩，最終以極少複習次數達成近乎永久的終身固化記憶。
        </p>
        <div class="img-wrapper mt-16">
          <img :src="getImageUrl('forgetting_curve_1787102855193.jpg')" alt="艾賓浩斯遺忘曲線與間隔複習" class="science-img max-w-md" loading="lazy" />
          <span class="img-caption">圖 6：間隔複習動態重置並平緩遺忘曲線</span>
        </div>
      </div>

      <div class="science-card">
        <div class="card-icon-title">
          <span class="topic-icon">🎯</span>
          <div>
            <h3>2.4 主動提取效應 (Testing Effect & Active Recall)</h3>
            <span class="topic-en">Retrieval Practice as a Memory Modifier</span>
          </div>
        </div>
        <p class="card-text">
          重複「閱讀」產生的僅是虛假熟悉感（Fluency Illusion）；唯有<strong>主動從大腦提取記憶（Active Recall）</strong>，才能重構神經突觸。本 App 在測驗與複習時嚴格採用「遮蔽式主動回想」設計，每一次成功提取都會釋放多巴胺，加深神經印痕。
        </p>
      </div>
    </div>

    <!-- Section 3: Interactive Science Lab -->
    <div v-show="activeSection === 'lab'" class="science-tab-content">
      <!-- Interactive Forgetting Curve Calculator -->
      <div class="science-card mb-20">
        <div class="card-icon-title">
          <span class="topic-icon">🧮</span>
          <div>
            <h3>互動實驗室 1：遺忘曲線與間隔複習動態模擬器</h3>
            <span class="topic-en">Interactive Memory Retention Calculator</span>
          </div>
        </div>
        <p class="card-text">
          調整下方參數，親身體驗「間隔複習」如何以指數級提升大腦的記憶半衰期：
        </p>

        <div class="calculator-box mt-16 p-16">
          <div class="calc-grid">
            <div class="calc-control">
              <label class="control-label">已學習天數 (Days): <strong>{{ calcDays }} 天</strong></label>
              <input type="range" v-model.number="calcDays" min="1" max="60" class="calc-slider" />
            </div>
            <div class="calc-control">
              <label class="control-label">已複習次數 (Reviews): <strong>{{ calcReviews }} 次</strong></label>
              <input type="range" v-model.number="calcReviews" min="0" max="5" class="calc-slider" />
            </div>
          </div>

          <div class="calc-results mt-16">
            <div class="calc-stat">
              <span class="stat-title">預估記憶保留率</span>
              <div class="stat-value" :class="retentionClass">
                {{ calculatedRetention }}%
              </div>
              <div class="progress-bar-bg mt-8">
                <div class="progress-bar-fill" :style="{ width: calculatedRetention + '%', backgroundColor: retentionColor }"></div>
              </div>
            </div>

            <div class="calc-advice mt-12">
              <span class="advice-badge">系統建議</span>
              <p class="advice-text">{{ retentionAdvice }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Dual-Coding Comparison Demo -->
      <div class="science-card">
        <div class="card-icon-title">
          <span class="topic-icon">⚡</span>
          <div>
            <h3>互動實驗室 2：雙碼效應瞬間心像實驗</h3>
            <span class="topic-en">Dual Coding Speed & Associative Strength Demo</span>
          </div>
        </div>
        <p class="card-text mb-16">
          點擊下方按鈕，比較「純數字」與「數字鎖鏈圖像故事」在大腦提取速度上的顯著差異：
        </p>

        <div class="lab-demo-box">
          <div class="demo-columns">
            <div class="demo-card demo-left">
              <h4>❌ 純數字無關聯模式</h4>
              <div class="demo-display">
                <span class="demo-numbers">81 35 72 04</span>
              </div>
              <p class="demo-tip text-muted">需依賴左腦聲海覆誦，約 15 秒後遺忘率高達 80%。</p>
            </div>

            <div class="demo-card demo-right">
              <h4>✨ 數字鎖鏈故事雙碼模式</h4>
              <div class="demo-display">
                <span class="demo-story">「<strong>白蟻 (81)</strong> 爬上 <strong>珊瑚 (35)</strong>，遇到一隻 <strong>企鵝 (72)</strong> 正在啃 <strong>柿子 (04)</strong>」</span>
              </div>
              <p class="demo-tip text-success">右腦瞬間生成具體畫面，雙通道編碼，長期留存率高達 95%！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const activeSection = ref<'neuro' | 'cog' | 'lab'>('neuro');

const calcDays = ref(7);
const calcReviews = ref(2);

const baseUrl = import.meta.env.BASE_URL;
const getImageUrl = (name: string) => `${baseUrl}images/${name}`;

// Ebbinghaus formula with review multiplier: R = exp(-t / (S0 * (1 + reviews * 2.5)))
const calculatedRetention = computed(() => {
  const t = calcDays.value;
  const reviews = calcReviews.value;
  // Base stability without review is ~1.8 days
  const baseStability = 1.8;
  const reviewMultiplier = Math.pow(2.6, reviews);
  const stability = baseStability * reviewMultiplier;
  
  const retention = Math.exp(-t / stability) * 100;
  return Math.max(5, Math.min(100, Math.round(retention)));
});

const retentionColor = computed(() => {
  const r = calculatedRetention.value;
  if (r >= 75) return '#10b981';
  if (r >= 50) return '#f59e0b';
  return '#ef4444';
});

const retentionClass = computed(() => {
  const r = calculatedRetention.value;
  if (r >= 75) return 'text-success';
  if (r >= 50) return 'text-warning';
  return 'text-danger';
});

const retentionAdvice = computed(() => {
  const r = calculatedRetention.value;
  if (r >= 85) return '記憶極度穩固！神經突觸 LTP 已完全建立，建議進入更長間隔複習。';
  if (r >= 65) return '記憶處於良好狀態，正處於最佳間隔複習黃金窗口，建議今日進行一輪主動回想！';
  if (r >= 40) return '記憶已出現明顯衰退，需立即啟動數字鎖鏈故事重溫與測驗。';
  return '記憶已大部分流失，建議回到「課程學習」重新連結圖像與故事樁位！';
});
</script>

<style scoped>
.memory-science-info {
  width: 100%;
}

.science-header {
  margin-bottom: 24px;
}

.science-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent-gold, #f59e0b);
}

.science-main-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.science-subtitle {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.science-desc {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 680px;
  margin: 0 auto;
}

.science-nav-pills {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-pill {
  padding: 8px 16px;
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-pill:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-pill.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.science-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg, 12px);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.card-icon-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.topic-icon {
  font-size: 1.6rem;
  line-height: 1;
}

.card-icon-title h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.topic-en {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: block;
  margin-top: 2px;
}

.card-text {
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.img-wrapper {
  text-align: center;
  background: var(--bg-secondary);
  padding: 12px;
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
}

.science-img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  border-radius: var(--border-radius-sm, 6px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.img-caption {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 8px;
  font-weight: 600;
}

.img-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .img-grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}

.calculator-box {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
}

.calc-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .calc-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.control-label {
  display: block;
  font-size: 0.88rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.calc-slider {
  width: 100%;
  cursor: pointer;
}

.calc-results {
  background: var(--bg-card);
  padding: 16px;
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
}

.stat-title {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 700;
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  margin-top: 4px;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.advice-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  background: var(--primary-light, #e0f2fe);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
}

.advice-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.lab-demo-box {
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
}

.demo-columns {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .demo-columns {
    grid-template-columns: 1fr 1fr;
  }
}

.demo-card {
  background: var(--bg-card);
  padding: 16px;
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
}

.demo-card h4 {
  font-size: 0.95rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.demo-display {
  background: var(--bg-secondary);
  padding: 14px;
  border-radius: var(--border-radius-sm, 6px);
  margin-bottom: 10px;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.demo-numbers {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  font-family: var(--font-family-mono);
  color: var(--text-muted);
}

.demo-story {
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--text-primary);
}

.demo-tip {
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

.text-success { color: #10b981; }
.text-warning { color: #f59e0b; }
.text-danger { color: #ef4444; }
</style>
