<template>
  <div class="container py-24">
    <!-- Header Nav -->
    <div class="header-nav mb-24">
      <button class="btn btn-secondary back-btn" @click="goBack">
        ◀ 返回主頁
      </button>
      <h2 class="page-title mt-12">🔗 數字編碼記憶器 (Number Encoder)</h2>
    </div>

    <!-- Input Card -->
    <div class="card p-24 mb-24 max-w-2xl mx-auto">
      <h3 class="input-title">輸入欲記憶的任意數字串</h3>
      <p class="text-muted mt-4">輸入如電話號碼、身分證字號、或密碼，系統會自動切成雙位數，並排出對應的聯想圖卡幫助您快速串聯記憶。</p>
      
      <div class="input-container mt-16 flex gap-12">
        <input 
          type="text" 
          v-model="inputString" 
          placeholder="例如：0912345678 或 12345" 
          class="number-input"
          @input="sanitizeInput"
        />
        <button class="btn btn-primary px-24" @click="clearInput" :disabled="!inputString">
          清除
        </button>
      </div>

      <div class="quick-examples mt-12 flex gap-8 items-center flex-wrap">
        <span class="text-muted text-xs">熱門範例：</span>
        <button class="example-tag" @click="setExample('1234567890')">1234567890</button>
        <button class="example-tag" @click="setExample('0912345678')">電話號碼</button>
        <button class="example-tag" @click="setExample('5201314')">5201314</button>
      </div>
    </div>

    <!-- RESULTS DISPLAY -->
    <div v-if="encodedSegments.length > 0" class="results-container max-w-4xl mx-auto">
      <div class="results-header mb-16 flex justify-between items-center">
        <h4 class="section-title">🧩 編碼圖卡鏈結 (共 {{ encodedSegments.length }} 組)</h4>
        <span class="segment-rule text-muted text-xs">自動切分規則：每兩位數為一組記憶點</span>
      </div>

      <!-- Multi-row Grid: 3 cards per row -->
      <div class="mnemonic-grid mb-24">
        <div v-for="(seg, idx) in encodedSegments" :key="idx" class="grid-node-wrapper">
          <!-- Node Card -->
          <div class="chain-node card">
            <span class="node-index">#{{ idx + 1 }}</span>
            
            <!-- Graphic / Placeholder -->
            <div 
              class="node-graphic-container mb-8 clickable" 
              @click="navigateToDetail(seg.number)"
              title="點擊查看記憶詳情"
            >
              <img 
                v-if="hasIcon(seg.itemId)" 
                :src="getIconUrl(seg.itemId)" 
                @error="handleIconError(seg.itemId)"
                class="node-graphic-img" 
                alt="icon" 
              />
              <div v-else class="node-graphic-placeholder">
                <span class="node-placeholder-char">{{ seg.keyword ? seg.keyword[0] : '？' }}</span>
              </div>
            </div>

            <!-- Info -->
            <div class="node-meta mt-8">
              <span class="node-number">{{ seg.number }}</span>
              <span class="node-keyword">{{ seg.keyword || '未定義' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chaining Story Helper -->
      <div class="story-helper-card card p-24">
        <h3 class="story-title flex items-center gap-8">
          <span>🧠 記憶串聯建議 (Memory Chaining)</span>
        </h3>
        <p class="text-secondary mt-8 leading-relaxed">
          試著將上述圖卡順序，在腦海中想像成一個荒謬、有趣的連續劇畫面。
          例如：
          <span class="font-bold text-primary">
            {{ encodedSegments.map(s => `【${s.keyword}】`).join(' ➔ ') }}
          </span>。
          想像一個動態情節將它們串在一起，動作越誇張、越不合邏輯，大腦就越容易留下永久記憶！
        </p>
      </div>
    </div>
    
    <!-- EMPTY STATE -->
    <div v-else class="empty-results text-center py-48 card max-w-2xl mx-auto">
      <span class="empty-icon">🔗</span>
      <p class="text-muted mt-12">請在上方輸入框輸入數字，系統將立刻為您生成記憶編碼鏈結。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { contentRepo } from '../repositories';

const router = useRouter();
const inputString = ref('');

const navigateToDetail = (number: string) => {
  router.push({ path: '/catalog', query: { number } });
};

const failedIcons = ref<Set<string>>(new Set());

const handleIconError = (itemId: string) => {
  if (!itemId) return;
  const num = itemId.split('-')[1];
  failedIcons.value.add(num);
};

const hasIcon = (itemId: string): boolean => {
  if (!itemId) return false;
  const num = itemId.split('-')[1];
  return !failedIcons.value.has(num);
};

const getIconUrl = (itemId: string): string => {
  const num = itemId.split('-')[1];
  return `${import.meta.env.BASE_URL || '/'}assets/icons/icon_${num}.png?v=3`;
};

// Filter input to only allow numbers, spaces, commas, hyphens, and dots
const sanitizeInput = () => {
  inputString.value = inputString.value.replace(/[^0-9\s,.-]/g, '');
};

const clearInput = () => {
  inputString.value = '';
};

const setExample = (val: string) => {
  inputString.value = val;
};

// Segments calculation
interface EncodedSegment {
  number: string;
  keyword: string;
  itemId: string;
}

const encodedSegments = computed<EncodedSegment[]>(() => {
  const raw = inputString.value.trim();
  if (!raw) return [];

  // Check if there's any delimiter like space, comma, dot, hyphen
  const hasDelimiter = /[\s,.-]/.test(raw);
  let segments: string[] = [];

  if (hasDelimiter) {
    // Split by delimiters, filter out empty strings, and keep each as is
    segments = raw.split(/[\s,.-]+/).filter(s => s.length > 0 && /^\d+$/.test(s));
  } else {
    // Standard 2-digit splitting
    let i = 0;
    while (i < raw.length) {
      if (i === raw.length - 1) {
        // Odd digit leftover -> Keep as a single digit now that 0-9 are core codes!
        segments.push(raw[i]);
        i++;
      } else {
        segments.push(raw.substring(i, i + 2));
        i += 2;
      }
    }
  }

  const allItems = contentRepo.getItems();

  return segments.map(num => {
    // Match segment to mnemonic item (number pad e.g. 05 or single digit e.g. 5)
    const matched = allItems.find(item => item.number === num);
    return {
      number: num,
      keyword: matched ? matched.canonicalKeyword : '未知',
      itemId: matched ? matched.id : ''
    };
  });
});

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.number-input {
  flex: 1;
  padding: 14px 18px;
  font-size: 1.15rem;
  border-radius: 12px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: monospace;
  letter-spacing: 2px;
  transition: all var(--transition-speed);
}

.number-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.quick-examples {
  font-size: 0.85rem;
}

.example-tag {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 2px 8px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.example-tag:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

/* Horizontal Chaining Mnemonic Strip */
.mnemonic-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 480px) {
  .mnemonic-grid {
    gap: 8px;
  }
}

.chain-node {
  width: 100%;
  max-width: 140px;
  padding: 12px 6px;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
}

.node-index {
  position: absolute;
  top: 6px;
  left: 8px;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
}

.node-graphic-container {
  width: 100%;
  height: 105px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.node-graphic-container.clickable {
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease;
}

.node-graphic-container.clickable:hover {
  transform: scale(1.08);
}

.node-graphic-img {
  width: 96px;
  height: 96px;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
}

.node-graphic-placeholder {
  width: 84px;
  height: 84px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--border-color);
}

.node-placeholder-char {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.node-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

.node-number {
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--primary);
  background: rgba(139, 92, 246, 0.08);
  padding: 1px 5px;
  border-radius: 4px;
}

.node-keyword {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-secondary);
}



/* Chaining Suggestion */
.story-helper-card {
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(0, 0, 0, 0) 100%);
}

.story-title {
  font-size: 1.1rem;
  font-weight: 800;
}

.empty-results {
  border: 1.5px dashed var(--border-color);
  background: transparent;
}

.empty-icon {
  font-size: 2.5rem;
}
</style>
