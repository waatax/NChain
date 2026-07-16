<template>
  <div class="container">
    <!-- Tab Selector -->
    <div class="tabs-bar mb-16">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'overview' }" 
        @click="activeTab = 'overview'"
      >
        📊 學習概覽
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'lessons' }" 
        @click="activeTab = 'lessons'"
      >
        📚 課程目錄
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'constants' }" 
        @click="activeTab = 'constants'"
      >
        📐 科學常數
      </button>
    </div>

    <!-- OVERVIEW TAB -->
    <div v-if="activeTab === 'overview'" class="tab-panel">
      <!-- Header Summary Card -->
      <div class="dashboard-summary card mb-16">
        <div class="summary-header">
          <h2>學習概覽</h2>
          <span class="version-tag" v-if="manifest">v{{ manifest.contentVersion }}</span>
        </div>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-num">{{ stats.completedItems }} / 101</span>
            <span class="stat-label">已學習數字</span>
          </div>
          <div class="stat-item">
            <span class="stat-num text-primary">{{ appStore.dueCardCount }}</span>
            <span class="stat-label">待複習卡片</span>
          </div>
          <div class="stat-item">
            <span class="stat-num text-success">{{ stats.masteredItems }}</span>
            <span class="stat-label">精熟數字</span>
          </div>
        </div>
        <div class="quick-actions mt-16">
          <button 
            class="btn btn-primary" 
            :disabled="appStore.dueCardCount === 0"
            @click="startGlobalReview"
          >
            ⏳ 複習 ({{ appStore.dueCardCount }} 題)
          </button>
          <button 
            class="btn btn-secondary" 
            @click="startGlobalTest"
          >
            ✍️ 測驗
          </button>
          <button 
            class="btn btn-secondary" 
            @click="startFlashCards"
          >
            🃏 卡牌
          </button>
          <button 
            class="btn btn-secondary" 
            @click="startNumberEncoder"
          >
            🔗 數字編碼
          </button>
        </div>
      </div>
    </div>

    <!-- LESSONS TAB -->
    <div v-else-if="activeTab === 'lessons'" class="tab-panel">
      <!-- Lessons List -->
      <div class="lessons-list card">
        <div v-for="l in lessons" :key="l.id" class="lesson-row">
          <div class="lesson-info">
            <div class="lesson-title-container">
              <span class="lesson-mode-tag" :class="l.mode">
                {{ l.mode === 'pair' ? '配對' : '故事' }}
              </span>
              <span class="lesson-name">{{ l.title }}</span>
            </div>
            <div class="lesson-meta text-muted">
              數字範圍: {{ l.rangeStart }} – {{ l.rangeEnd }}
              <span class="dot-separator">•</span>
              已記: {{ getLessonProgress(l.id)?.completedSceneIds.length || 0 }} / {{ l.sceneIds.length }}
            </div>
          </div>
          
          <div class="lesson-actions">
            <button class="btn btn-secondary btn-sm" @click="startLesson(l.id)">
              📖 學習
            </button>
            <button class="btn btn-primary btn-sm" @click="startQuiz(l.id)">
              ✍️ 測驗
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CONSTANTS TAB -->
    <div v-else-if="activeTab === 'constants'" class="tab-panel">
      <!-- Constants list -->
      <div class="constants-container">
        <div 
          v-for="c in constants" 
          :key="c.id" 
          class="constant-card mb-12"
          :class="{ expanded: expandedConstantId === c.id }"
          :style="{ '--theme-hue': c.hue }"
          @click="toggleConstant(c.id)"
        >
          <div class="constant-header">
            <div class="constant-identity">
              <span class="constant-symbol" :style="{ color: 'var(--theme-color)', backgroundColor: 'var(--theme-glow)' }">{{ c.symbol }}</span>
              <div class="constant-title">
                <span class="constant-zh-name">{{ c.name }}</span>
                <span class="constant-en-name">{{ c.engName }}</span>
              </div>
            </div>
            <div class="constant-chevron">
              {{ expandedConstantId === c.id ? '▲' : '▼' }}
            </div>
          </div>
          
          <div class="constant-brief" v-if="expandedConstantId !== c.id">
            <div class="constant-value" v-html="c.valueHtml"></div>
            <p class="constant-tagline">{{ c.tagline }}</p>
          </div>
          
          <div class="constant-details" v-else @click.stop>
            <div class="constant-value-large mb-12">
              <span class="detail-label">定義值：</span>
              <div class="value-text" v-html="c.valueHtml"></div>
            </div>
            
            <div class="constant-value-large mb-12" v-if="c.approxValueHtml">
              <span class="detail-label">約略值：</span>
              <div class="value-text" v-html="c.approxValueHtml"></div>
            </div>
            
            <div class="detail-section mb-12">
              <div class="detail-section-title">🔬 科學內涵與物理機制</div>
              <p class="detail-text">{{ c.essence }}</p>
              <div class="detail-formula-box mt-8" v-if="c.formulaHtml" v-html="c.formulaHtml"></div>
            </div>
            
            <div class="detail-section mb-12" v-if="c.derivation">
              <div class="detail-section-title">📐 量綱與單位推導</div>
              <div class="table-responsive">
                <table class="math-table">
                  <thead>
                    <tr>
                      <th>物理量</th>
                      <th>SI 基本單位</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, i) in c.derivation" :key="i">
                      <td>{{ item.qty }}</td>
                      <td><code>{{ item.sym }}</code> <span class="dim-unit">({{ item.unit }})</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="detail-note-text mt-8" v-if="c.derivationNote">{{ c.derivationNote }}</p>
            </div>
            
            <div class="detail-section mb-12">
              <div class="detail-section-title">📜 測量歷史演進</div>
              <ul class="detail-list">
                <li v-for="(hItem, i) in c.history" :key="i">{{ hItem }}</li>
              </ul>
            </div>
            
            <div class="detail-section">
              <div class="detail-section-title">🚀 核心應用領域</div>
              <ul class="detail-list check-list">
                <li v-for="(app, i) in c.apps" :key="i">✔️ {{ app }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- SPECIAL TOPICS SECTION -->
        <div class="special-topics-header mt-24 mb-12">
          <h3>⚖️ 學術對照與深層耦合</h3>
        </div>

        <!-- TWO E COMPARE CARD -->
        <div class="topic-card mb-16">
          <div class="topic-title mb-12">兩個 「e」 的深度學術釐清</div>
          <p class="topic-desc mb-12">在科學領域中，小寫字母 <code>e</code> 同時被用作物理的「基本電荷」與數學的「歐拉數」。以下為兩者的對照：</p>
          <div class="table-responsive">
            <table class="compare-table">
              <thead>
                <tr>
                  <th>特性 / 項目</th>
                  <th>物理基本電荷 <code>e</code></th>
                  <th>數學常數（歐拉數） <code>e</code></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>本質意義</strong></td>
                  <td>自由空間單一載荷粒子（如電子）的電荷量子化尺度</td>
                  <td>連續複利與指數函數增長的極限收斂常數</td>
                </tr>
                <tr>
                  <td><strong>精密數值</strong></td>
                  <td><code>1.602176634 × 10⁻¹⁹ C</code> (精確值)</td>
                  <td><code>2.718281828459...</code> (無限不循環超越數)</td>
                </tr>
                <tr>
                  <td><strong>量綱與單位</strong></td>
                  <td>庫侖 (C = A·s)</td>
                  <td>無量綱、無單位 (純實數)</td>
                </tr>
                <tr>
                  <td><strong>代表公式</strong></td>
                  <td>量子化公式：<code>q = ne</code></td>
                  <td>微積分自相似性：<code>d/dx(eˣ) = eˣ</code></td>
                </tr>
                <tr>
                  <td><strong>應用學門</strong></td>
                  <td>電磁學、半導體器件、凝聚態物理</td>
                  <td>微積分、衰減模型、概率分布、機器學習</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- COUPLING CARD -->
        <div class="topic-card mb-16">
          <div class="topic-title mb-12">電磁特性與精細結構常數的量子耦合</div>
          <p class="topic-desc mb-8">
            在 2019 年國際單位制重新定義後，真空磁導率 <span class="math-var">μ₀</span> 與真空電容率 <span class="math-var">ε₀</span> 不再是定義常數，而是繼承了微觀無量綱物理常數——<strong>精細結構常數 (<span class="math-var">α</span>)</strong> 的實驗測量不確定度。
          </p>
          <p class="topic-desc mb-12">
            精細結構常數定義為：
            <span class="math-eq-block">α = <span class="math-fraction"><span class="math-num">e<sup>2</sup></span><span class="math-den">4π ε₀ ℏ c</span></span> = <span class="math-fraction"><span class="math-num">e<sup>2</sup> μ₀ c</span><span class="math-den">2 h</span></span></span>
            根據 CODATA 2022 最新數據，精細結構常數逆值為：
            <span class="math-eq-block">α⁻¹ = 137.035999177(21) <span class="dim-unit">(標準不確定度為 1.6 × 10⁻¹⁰)</span></span>
          </p>
          <p class="topic-desc mb-12">
            由於 <span class="math-var">h, e, c</span> 皆已固定為無誤差精確值，真空介質常數必須利用下列觀測方程精確算出：
            <span class="math-eq-block">
              μ₀ = <span class="math-fraction"><span class="math-num">2 h</span><span class="math-den">e<sup>2</sup> c</span></span> α
              <span style="margin: 0 16px;">,</span>
              ε₀ = <span class="math-fraction"><span class="math-num">1</span><span class="math-den">μ₀ c<sup>2</sup></span></span> = <span class="math-fraction"><span class="math-num">e<sup>2</sup></span><span class="math-den">2 h c</span></span> α⁻¹
            </span>
          </p>
          <div class="topic-insight">
            💡 <strong>深度探討：</strong>
            這顯示宏觀的時空電磁性質在微觀尺度上與精細結構常數完美耦合。物理常數之間並非孤立零散的拼圖，而是通過普適的自然律相互約束的調和系統。有些尖端的幾何物理學甚至嘗試從維度幾何或 orbifold 拓撲空間結構中推導出該逆值的純數學形式。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { contentRepo, progressRepo } from '../repositories';
import { Lesson, ContentManifest } from '../domain/types';
import { ProgressState } from '../repositories/ProgressRepository';

const router = useRouter();
const appStore = useAppStore();

const activeTab = ref<'overview' | 'lessons' | 'constants'>('overview');

interface Constant {
  id: string;
  name: string;
  engName: string;
  symbol: string;
  digits?: string;
  valueHtml: string;
  approxValueHtml?: string;
  tagline: string;
  hue: number;
  essence: string;
  formulaHtml?: string;
  derivation?: {
    qty: string;
    sym: string;
    unit: string;
  }[];
  derivationNote?: string;
  history: string[];
  apps: string[];
}

const constants = ref<Constant[]>([
  {
    id: 'c',
    name: '真空中光速',
    engName: 'Speed of Light in Vacuum',
    symbol: 'c',
    valueHtml: 'c = 299,792,458 m·s<sup>-1</sup>',
    approxValueHtml: 'c ≈ 3.00 × 10<sup>8</sup> m/s (每秒約 30 萬公里)',
    tagline: '因果律與資訊傳輸的宇宙絕對速度上限，相對論幾何的基礎耦合常數。',
    hue: 35,
    essence: '光速在真空中是所有電磁波的傳播速度，也是愛因斯坦相對論中時空耦合常數。任何具靜止質量的物體皆無法被加速至光速，因其動能與動量在速度接近光速時會趨於無窮大。',
    formulaHtml: '質能等價關係式：<br><span class="math-eq">E = mc<sup>2</sup></span>',
    derivation: [
      { qty: '能量 E', sym: 'J (焦耳)', unit: 'kg·m²·s⁻²' },
      { qty: '質量 m', sym: 'kg (公斤)', unit: 'kg' },
      { qty: '光速 c', sym: 'm/s (公尺每秒)', unit: 'm·s⁻¹' }
    ],
    derivationNote: '量綱代入：[E] = [Mass] × [Velocity]² = M · (L/T)² = ML²T⁻²，即 1 J = 1 kg·m²·s⁻²。1 kg 物質完全轉換釋放能量達 8.99 × 10¹⁶ J，遠超常規核反應。',
    history: [
      '1676年：丹麥天文學家羅默（Ole Rømer）觀測木星衛星（Io）掩食延遲，證實光速有限。',
      '1849年：法國物理學家斐索（Hippolyte Fizeau）設計旋轉齒輪法，首次在實驗室測出光速值。'
    ],
    apps: [
      '全球定位系統 (GPS) 訊號傳輸時間差解算',
      '光達 (LiDAR) 與雷射精密測距',
      '光纖通信與深空通訊網路',
      '高能粒子加速器設計'
    ]
  },
  {
    id: 'h',
    name: '普朗克常數',
    engName: 'Planck Constant',
    symbol: 'h',
    valueHtml: 'h = 6.62607015 × 10<sup>-34</sup> J·s',
    approxValueHtml: 'ℏ = <span class="math-fraction"><span class="math-num">h</span><span class="math-den">2π</span></span> ≈ 1.054571817... × 10<sup>-34</sup> J·s',
    tagline: '微觀世界作用量的最小單元，重新定義質量「公斤」的量子基石。',
    hue: 280,
    essence: '定義微觀粒子波動性與粒子性（波粒二象性）的耦合鏈結。微觀系統的能量交換以不連續的「能量階梯」進行，這種非連續性即量子化的本質。',
    formulaHtml: '光子能量：<span class="math-eq">E = hf</span><br>德布羅意波長：<span class="math-eq">p = <span class="math-fraction"><span class="math-num">h</span><span class="math-den">λ</span></span></span>',
    derivation: [
      { qty: '能量 E', sym: 'J (焦耳)', unit: 'kg·m²·s⁻²' },
      { qty: '頻率 f', sym: 'Hz (赫茲)', unit: 's⁻¹' },
      { qty: '常數 h', sym: 'J·s (焦耳秒)', unit: 'kg·m²·s⁻¹' }
    ],
    derivationNote: '量綱代入：[h] = [Energy] / [Frequency] = (ML²T⁻²) / T⁻¹ = ML²T⁻¹。在2019年國際單位制（SI）新體系中，h 的數值固定為無誤差精確值，重塑了質量公斤。',
    history: [
      '1900年：馬克斯·普朗克（Max Planck）為解釋黑體輻射公式，提出能量量子化假說並引入 h。',
      '現代：利用奇寶天平（Kibble Balance）將機械功率與電學量子基準（約瑟夫森效應、量子霍爾電阻基準）關聯，實現公斤的「去器物化」定義。'
    ],
    apps: [
      '超導量子計算與量子力學研究',
      '半導體器件與光電元件（雷射、LED）',
      '精密電子顯微鏡設計'
    ]
  },
  {
    id: 'Na',
    name: '亞佛加厥常數',
    engName: 'Avogadro Constant',
    symbol: 'N_A',
    valueHtml: 'N<sub>A</sub> = 6.02214076 × 10<sup>23</sup> mol<sup>-1</sup>',
    tagline: '連結微觀原子分子計數與宏觀物質量（莫耳）的核心比例常數。',
    hue: 160,
    essence: '定義 1 莫耳（mole）物質所包含的基本單元（如原子、分子）個數。2019年重新定義後為精確常數，不再依賴於碳-12的質量。',
    formulaHtml: '微觀與宏觀轉換：<br><span class="math-eq">N = n N<sub>A</sub></span>',
    derivation: [
      { qty: '物質的量 n', sym: 'mol (莫耳)', unit: 'mol' },
      { qty: '粒子總數 N', sym: '個 (純數)', unit: '無單位' }
    ],
    derivationNote: '以 18 mL 的水為例（約 18 g），其恰好等於 1 莫耳水分子，精確包含 6.02214076 × 10²³ 個 H₂O 分子實體。',
    history: [
      '1811年：義大利科學家亞佛加厥提出同溫同壓同體積的氣體含有相同數目的分子（亞佛加厥定律）。',
      '國際亞佛加厥計畫（單晶矽球法）：製造直徑形狀極接近完美球體的純矽-28單晶球，利用光學干涉儀與X光晶體學精密量度晶格常數，推導出原子數目與精確常數值。'
    ],
    apps: [
      '化學反應計量學與 Stoichiometry 計算',
      '理想氣體統計熱力學分析',
      '固態物理與高純度材料結構分析'
    ]
  },
  {
    id: 'G',
    name: '萬有引力常數',
    engName: 'Gravitational Constant',
    symbol: 'G',
    valueHtml: 'G = 6.67430(15) × 10<sup>-11</sup> m<sup>3</sup>·kg<sup>-1</sup>·s<sup>-2</sup>',
    tagline: '主掌天體運行與宇宙大尺度演化，量測不確定度最高的基本物理常數。',
    hue: 25,
    essence: '決定具有質量的物質間重力交互作用強度的普適常數。重力為四大基本力中最弱的力且無法被屏蔽，這導致引力常數是目前測量不確定度最高（22 ppm）的基本常數。',
    formulaHtml: '牛頓萬有引力定律：<br><span class="math-eq">F = G <span class="math-fraction"><span class="math-num">m<sub>1</sub>m<sub>2</sub></span><span class="math-den">r<sup>2</sup></span></span></span>',
    derivation: [
      { qty: '引力 F', sym: 'N (牛頓)', unit: 'kg·m·s⁻²' },
      { qty: '距離 r', sym: 'm (公尺)', unit: 'm' },
      { qty: '引力常數 G', sym: 'N·m²/kg²', unit: 'm³·kg⁻¹·s⁻²' }
    ],
    derivationNote: '注意常數 G 與重力加速度 g 的區別：G 是宇宙通用的物理常數，而 g 是局域的重力場強度，隨高度、緯度與星球質量而變（g = GM_planet / r²）。',
    history: [
      '1687年：艾薩克·牛頓發表萬有引力定律，但當時並未直接給出 G 的數值。',
      '1798年：英國物理學家卡文迪許（Henry Cavendish）利用細絲扭秤系統，首次精密量度大鉛球與小鉛球間極微弱引力，測出地球密度並推導出 G 值。'
    ],
    apps: [
      '人造衛星與太空探測器軌道動力學計算',
      '天文物理學中的恆星、星系演化與黑洞研究',
      '地球物理重力梯度勘探'
    ]
  },
  {
    id: 'e_charge',
    name: '基本電荷',
    engName: 'Elementary Charge',
    symbol: 'e',
    valueHtml: 'e = 1.602176634 × 10<sup>-19</sup> C',
    tagline: '微觀粒子電荷量子化的基本單元，電磁交互作用的自然尺度。',
    hue: 200,
    essence: '代表自由狀態下單個質子攜帶的正電荷量，或電子攜帶的負電荷量的絕對值。一切孤立系統的電荷量皆為此基本電荷的整數倍（電荷量子化）。',
    formulaHtml: '電荷量子化定理：<br><span class="math-eq">q = ne (n ∈ ℤ)</span>',
    derivation: [
      { qty: '電荷量 q', sym: 'C (庫侖)', unit: 'A·s (安培秒)' },
      { qty: '電子個數 N', sym: '個 (1 C 對應電子數)', unit: '6.241509 × 10¹⁸ 個' }
    ],
    derivationNote: '2019年國際單位制（SI）重新定義後，基本電荷固定為無誤差的精確值，安培（A）與庫侖（C）皆依此量子基準定義。',
    history: [
      '1909年：美國物理學家羅伯特·密立根（Robert Millikan）通過著名的「油滴實驗」，測量帶電油滴在電場與重力場中的運動速度，證實電荷量子化並首度精確測出基本電荷。'
    ],
    apps: [
      '半導體微電子與集成電路（IC）設計',
      '化學電化學、法拉第電解定律與電池設計',
      '量子電動力學（QED）與微觀粒子研究'
    ]
  },
  {
    id: 'kb',
    name: '波茲曼常數',
    engName: 'Boltzmann Constant',
    symbol: 'k_B',
    valueHtml: 'k<sub>B</sub> = 1.380649 × 10<sup>-23</sup> J·K<sup>-1</sup>',
    tagline: '跨越巨觀溫度與微觀熱運動動能的統計力學橋樑。',
    hue: 15,
    essence: '建立了熱力學絕對溫度（K）與微觀隨機熱運動平均動能（J）之間的比例對等。是克耳文溫標（K）新定義的核心基準。',
    formulaHtml: '波茲曼熵公式：<span class="math-eq">S = k<sub>B</sub> ln Ω</span><br>理想氣體方程式：<span class="math-eq">PV = Nk<sub>B</sub>T</span>',
    derivation: [
      { qty: '熵 S', sym: 'J/K', unit: 'kg·m²·s⁻²·K⁻¹' },
      { qty: '狀態數 Ω', sym: '微觀狀態數 (純數)', unit: '無單位' }
    ],
    derivationNote: '波茲曼熵公式揭述了熱力學第二定律的統計本質：孤立系統總是向微觀狀態可能性最大（亂度最大）的方向演化。',
    history: [
      '1870年代：路德維希·波茲曼（Ludwig Boltzmann）奠定統計力學基礎，將宏觀熱力學量與微觀粒子隨機運動作統計關聯。',
      '2019年：波茲曼常數被定義為無標準偏差的精確值，徹底解決了克耳文單位的「去器物化」定義。'
    ],
    apps: [
      '統計力學與化學熱力學分析',
      '半導體載流子濃度與PN結熱平衡分析',
      '電子電路中的約瑟夫森噪訊與熱雜訊分析'
    ]
  },
  {
    id: 'pi',
    name: '圓周率',
    engName: 'Pi',
    symbol: 'π',
    valueHtml: 'π = 3.14159265358979323846...',
    approxValueHtml: 'π ≈ 3.<span style="letter-spacing:0.05em">1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679</span>',
    tagline: '主宰平面幾何對稱、簡諧旋轉與所有波動現象的純數學超越常數（前 100 位精確展開）。',
    hue: 220,
    essence: '任何歐幾里得幾何平面圓的周長與直徑之比。是一個無理數且為超越數，無任何物理單位因次。',
    formulaHtml: '圓周長：<span class="math-eq">C = 2πr</span><br>球體體積：<span class="math-eq">V = <span class="math-fraction"><span class="math-num">4</span><span class="math-den">3</span></span>πr<sup>3</sup></span>',
    derivation: [
      { qty: '半徑 r', sym: 'm (公尺)', unit: 'L' },
      { qty: '面積 A', sym: 'm² (平方米)', unit: 'L²' }
    ],
    derivationNote: '完整旋轉週期：360° = 2π 弧度，這使得 π 成為描述交流電、擺動、聲波、光波等一切週期震盪現象的傅立葉分析基石。',
    history: [
      '公元263年：三國時期數學家劉徽創立「割圓術」，以圓內接正多邊形面積無限逼近圓面積，引入極限數學思想。',
      '公元五世紀：南北朝時期祖沖之算出圓周率精確介於 3.1415926 與 3.1415927 之間，提出約率 22/7 與密率 355/113（祖率），領先世界千年。'
    ],
    apps: [
      '幾何結構、航道弧度與工程設計計算',
      '傅立葉變換（Fourier Analysis）與頻域訊號處理',
      '高斯分布等概率統計學模型'
    ]
  },
  {
    id: 'e_euler',
    name: '歐拉數',
    engName: 'Euler’s Number',
    symbol: 'e',
    valueHtml: 'e = 2.71828182845904523536...',
    tagline: '自然常數，主宰自然界中連續增長、衰減與動力學演化的數學超越常數。',
    hue: 320,
    essence: '自然對數的底數，是一個無理數與超越數。它代表瞬時增長率與目前積累值成正比的連續增長極限，其導數具有絕無僅有的微分自相似性。',
    formulaHtml: '泰勒級數展開式：<br><span class="math-eq">e = <span class="math-fraction"><span class="math-num">1</span><span class="math-den">0!</span></span> + <span class="math-fraction"><span class="math-num">1</span><span class="math-den">1!</span></span> + <span class="math-fraction"><span class="math-num">1</span><span class="math-den">2!</span></span> + ... = ∑<span class="math-fraction"><span class="math-num">1</span><span class="math-den">k!</span></span></span>',
    derivation: [
      { qty: '指數函數 eˣ', sym: '微分特徵', unit: 'd/dx (eˣ) = eˣ' },
      { qty: '複利公式', sym: '連續複利極限', unit: 'lim (1 + 1/n)ⁿ = e' }
    ],
    derivationNote: '由雅各布·白努利於 1683 年在研究金融複利模型時首次發現其極限收斂性質。歐拉於 1731 年命名並以級數公式奠定其學術地位。',
    history: [
      '1683年：雅各布·白努利證明隨著利息計算次數趨向無限（連續複利），年終回報存在上限，該上限即為 e。',
      '1731年：萊昂哈德·歐拉（Leonhard Euler）首次以字母 e 命名此常數，並將其與無窮泰勒級數和自然對數建立起深刻的解析關係。'
    ],
    apps: [
      '放射性核素衰減、半衰期與考古碳-14測定',
      '電路RC/RL暫態響應分析與阻尼震盪',
      '機器學習激活函數（Sigmoid、Softmax）',
      '藥物動力學與生物細胞增長預測模型'
    ]
  }
]);

constants.value.forEach(c => {
  if (c.id === 'c') c.digits = '299792458';
  else if (c.id === 'h') c.digits = '662607015';
  else if (c.id === 'Na') c.digits = '602214076';
  else if (c.id === 'G') c.digits = '667430';
  else if (c.id === 'e_charge') c.digits = '1602176634';
  else if (c.id === 'kb') c.digits = '1380649';
  else if (c.id === 'pi') c.digits = '31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
  else if (c.id === 'e_euler') c.digits = '271828182845904523536';
});

const goToEncoder = (digits?: string) => {
  router.push({
    path: '/number-encoder',
    query: {
      number: digits || '',
      mode: 'single'
    }
  });
};

const expandedConstantId = ref<string | null>(null);

const toggleConstant = (id: string) => {
  if (expandedConstantId.value === id) {
    expandedConstantId.value = null;
  } else {
    expandedConstantId.value = id;
  }
};

const manifest = ref<ContentManifest | null>(null);
const lessons = ref<Lesson[]>([]);
const progressMap = reactive<Map<string, ProgressState>>(new Map());

const stats = reactive({
  completedItems: 0,
  masteredItems: 0
});

onMounted(async () => {
  manifest.value = contentRepo.getManifest();
  lessons.value = contentRepo.getLessons();
  
  // Load progress
  const allProgress = await progressRepo.getAllProgress();
  allProgress.forEach(p => progressMap.set(p.lessonId, p));
  
  // Calculate aggregate stats
  calculateStats();
});

const getLessonProgress = (id: string): ProgressState | undefined => {
  return progressMap.get(id);
};

const calculateStats = async () => {
  let completed = 0;
  // Calculate completed scenes
  progressMap.forEach(p => {
    completed += p.completedSceneIds.length;
  });
  stats.completedItems = Math.min(101, completed); // Approximate
  
  // Load review cards to count mastered items
  // Mastery = box >= 3
  const dbInstance = (progressRepo as any).db;
  if (dbInstance && dbInstance.reviewCards) {
    try {
      const masteredCards = await dbInstance.reviewCards.where('box').aboveOrEqual(3).toArray();
      const itemIds = masteredCards.map((c: any) => c.itemId);
      stats.masteredItems = new Set(itemIds).size;
    } catch (e) {
      console.error('Failed to calculate mastered items:', e);
    }
  }
};

const startLesson = (lessonId: string) => {
  router.push({ name: 'learn', params: { lessonId } });
};

const startQuiz = (lessonId: string) => {
  router.push({ name: 'quiz', params: { lessonId } });
};

const startGlobalReview = () => {
  router.push({ name: 'review' });
};

const startGlobalTest = () => {
  router.push({ name: 'global-test' });
};

const startFlashCards = () => {
  router.push({ name: 'flash-cards' });
};

const startNumberEncoder = () => {
  router.push({ name: 'number-encoder' });
};
</script>

<style scoped>
.tabs-bar {
  display: flex;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-speed);
}

.tab-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.tab-btn.active {
  background-color: var(--primary-glow);
  color: var(--primary);
}

.dashboard-summary {
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.summary-header h2 {
  font-size: 1.15rem;
  font-weight: 800;
}

.version-tag {
  font-size: 0.7rem;
  font-weight: 700;
  background-color: var(--primary-glow);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 20px;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 1.35rem;
  font-weight: 800;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.lessons-list {
  padding: 8px 16px;
}

.lesson-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}
.lesson-row:last-child {
  border-bottom: none;
}

.lesson-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lesson-mode-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.lesson-mode-tag.pair {
  background-color: hsla(200, 80%, 50%, 0.15);
  color: hsl(200, 80%, 40%);
}
.lesson-mode-tag.narrative {
  background-color: hsla(280, 80%, 50%, 0.15);
  color: hsl(280, 80%, 40%);
}

.lesson-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.lesson-meta {
  font-size: 0.75rem;
  margin-top: 4px;
}

.dot-separator {
  margin: 0 4px;
}

.lesson-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 6px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
}

/* Constants Panel Styles */
.constants-container {
  display: flex;
  flex-direction: column;
}

.constant-card {
  --theme-color: hsl(var(--theme-hue, 220), 85%, 55%);
  --theme-glow: hsla(var(--theme-hue, 220), 85%, 55%, 0.08);
  border: 1px solid var(--border-color);
  border-left: 5px solid var(--theme-color);
  background-color: var(--bg-card);
  border-radius: var(--border-radius-md);
  padding: 14px 18px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed), background-color var(--transition-speed);
  position: relative;
}

.constant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--theme-glow), var(--shadow-sm);
  background-color: hsl(var(--theme-hue, 220), 20%, 99%);
}

html.dark .constant-card:hover {
  background-color: hsl(var(--theme-hue, 220), 20%, 16%);
}

.constant-card.expanded {
  cursor: default;
  transform: none;
  background-color: var(--bg-card);
  border-bottom: 2px solid var(--theme-color);
}

.constant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.constant-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.constant-symbol {
  font-family: 'Outfit', var(--font-family);
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--theme-color);
  background-color: var(--theme-glow);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px hsla(var(--theme-hue, 220), 85%, 55%, 0.2);
}

.constant-title {
  display: flex;
  flex-direction: column;
}

.constant-zh-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
}

.constant-en-name {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.constant-chevron {
  font-size: 0.75rem;
  color: var(--text-muted);
  transition: transform var(--transition-speed);
}

.constant-brief {
  margin-top: 10px;
  border-top: 1px dashed var(--border-color);
  padding-top: 8px;
}

.constant-value {
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 700;
  color: var(--theme-color);
}

.constant-tagline {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* Expanded details styles */
.constant-details {
  margin-top: 14px;
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.constant-value-large {
  background-color: var(--bg-secondary);
  padding: 10px 14px;
  border-radius: var(--border-radius-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.value-text {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--theme-color);
  word-break: break-all;
  overflow-wrap: anywhere;
  line-height: 1.7;
}

.detail-section {
  border-left: 2px solid var(--border-color);
  padding-left: 10px;
}

.detail-section-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.detail-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: justify;
}

.detail-formula-box {
  background-color: var(--bg-secondary);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
  color: var(--text-primary);
  font-weight: 700;
}

/* Fractions & Superscripts styling */
.math-eq {
  font-family: 'Outfit', var(--font-family);
  font-weight: 800;
  color: var(--theme-color);
}

.math-eq-block {
  display: block;
  text-align: center;
  font-family: 'Outfit', var(--font-family);
  font-weight: 800;
  font-size: 1rem;
  margin: 8px 0;
  color: var(--primary);
  background-color: var(--bg-secondary);
  padding: 10px;
  border-radius: var(--border-radius-sm);
}

.math-var {
  font-family: 'Outfit', var(--font-family);
  font-weight: 800;
  font-style: italic;
}

.math-fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  padding: 0 4px;
}

.math-num {
  border-bottom: 1.2px solid var(--text-primary);
  padding-bottom: 1px;
  line-height: 1;
  text-align: center;
}

.math-den {
  padding-top: 1px;
  line-height: 1;
  text-align: center;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  margin-top: 6px;
}

.math-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  text-align: left;
}

.math-table th, .math-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--border-color);
}

.math-table th {
  background-color: var(--bg-secondary);
  font-weight: 800;
}

.dim-unit {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.detail-note-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
}

.detail-list {
  padding-left: 14px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.detail-list li {
  margin-bottom: 4px;
}

.detail-list.check-list {
  list-style-type: none;
  padding-left: 0;
}

/* Special topics styles */
.special-topics-header {
  border-top: 2px solid var(--border-color);
  padding-top: 16px;
}

.special-topics-header h3 {
  font-size: 1.05rem;
  font-weight: 800;
}

.topic-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.topic-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--primary);
}

.topic-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  text-align: left;
}

.compare-table th, .compare-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
}

.compare-table th:last-child, .compare-table td:last-child {
  border-right: none;
}

.compare-table th {
  background-color: var(--bg-secondary);
  font-weight: 800;
}

.topic-insight {
  background-color: var(--bg-secondary);
  border-left: 4px solid var(--primary);
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 10px;
}
</style>
