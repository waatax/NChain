<template>
  <div class="top-student-methods">
    <!-- Anchor for scrolling to top -->
    <div ref="methodsTopRef" class="methods-anchor-top"></div>

    <!-- Header Summary -->
    <div class="methods-hero text-center mb-20">
      <div class="hero-badge">
        <span class="badge-dot"></span>
        <span>頂尖學霸思維系統・擴展旗艦版</span>
      </div>
      <h3 class="hero-title">北一女・建中・台大 9 大高效記憶學習法</h3>
      <p class="hero-subtitle">
        全面擴充認知神經科學機制、各學科實戰演練，每法均配備雙重視覺流程圖與雙重結構化分析表
      </p>
    </div>

    <!-- Mobile Quick-Select Bar (Shown on small screens) -->
    <div class="mobile-methods-dropdown-bar mb-12">
      <div class="dropdown-tag">
        <span class="hanko-seal">大綱</span>
        <span class="text-muted text-xs">快速跳轉：</span>
      </div>
      <select v-model="currentTab" class="methods-dropdown-select" @change="scrollToTop">
        <option v-for="m in methodList" :key="m.id" :value="m.id">
          {{ m.icon }} {{ m.shortName }}
        </option>
      </select>
    </div>

    <!-- Navigation Tabs (Horizontal Scroll on Mobile/Tablet) -->
    <div class="methods-nav-bar mb-20">
      <button
        v-for="m in methodList"
        :key="m.id"
        class="nav-tab-btn"
        :class="{ active: currentTab === m.id }"
        @click="goToMethod(m.id)"
      >
        <span class="tab-icon">{{ m.icon }}</span>
        <span class="tab-label">{{ m.shortName }}</span>
      </button>
    </div>

    <!-- Dual Layout: Desktop Sticky Sidebar + Main Content -->
    <div class="methods-viewer-layout">
      <!-- Desktop Sidebar TOC (Visible on >= 1024px) -->
      <aside class="desktop-toc-sidebar">
        <div class="toc-card card p-14">
          <div class="toc-header mb-12">
            <span class="toc-title">📚 9 大記憶法目錄</span>
            <span class="toc-count badge">{{ currentIndex + 1 }}/{{ methodList.length }}</span>
          </div>
          <div class="toc-items">
            <button
              v-for="m in methodList"
              :key="m.id"
              class="toc-item-btn"
              :class="{ active: currentTab === m.id }"
              @click="goToMethod(m.id)"
            >
              <span class="toc-icon">{{ m.icon }}</span>
              <span class="toc-name">{{ m.shortName }}</span>
              <span v-if="currentTab === m.id" class="toc-active-marker">●</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Method Card Area -->
      <div class="methods-card-area">

    <!-- Method 1: 北一女三色階梯錯題本消滅法 -->
    <div v-if="currentTab === 'error-book'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">北一女中・聯考榜首</span>
          <span class="tag-type">元認知監控 / 前扣帶迴 ACC 誤差偵測</span>
        </div>
        <h4>1. 三色階梯錯題本消滅法 (Three-Color Error Log & Elimination)</h4>
        <p class="motto">「錯題本不是拿來抄漂亮的，而是用來『越讀越薄』的思維手術刀。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            大腦極容易產生<strong>「流暢性錯覺 (Illusion of Fluency)」</strong>——看解答時誤以為自己懂了。
            三色法運用<strong>前扣帶迴（ACC）誤差負波 (ERN)</strong> 與<strong>多巴胺預測誤差學習 (Prediction Error Learning)</strong>，
            將原始錯誤路徑與正確破題點強烈對比，刺激前額葉皮質（PFC）重構神經突觸權重，打破思維死角。
          </p>
        </div>

        <!-- 圖示 1: 階梯消滅過濾漏斗 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 1-1</span>
            <span>錯題消滅生命週期與三階過濾漏斗 (3-7-21 法則)</span>
          </div>
          <div class="flow-steps">
            <div class="step-node">
              <div class="node-icon bg-light">📝</div>
              <div class="node-title">錯題入庫</div>
              <div class="node-desc">影印剪貼/標籤列印<br>拒絕浪費時間抄題</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-icon bg-primary-soft">🔬</div>
              <div class="node-title">三色診斷</div>
              <div class="node-desc">黑筆(還原錯誤)<br>紅筆(關鍵解點)<br>藍筆(思維警語)</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-icon bg-warning-soft">⏳</div>
              <div class="node-title">階梯過濾</div>
              <div class="node-desc">Day 3 遮蓋盲算<br>Day 7 變形題重測<br>Day 21 考前總清點</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-icon bg-success-soft">✨</div>
              <div class="node-title">筆記薄化</div>
              <div class="node-desc">累計滿 3 個 ✓<br>螢光筆劃除消滅<br>考前僅讀極薄盲區</div>
            </div>
          </div>
        </div>

        <!-- 圖示 2: 錯題診斷決策樹 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 1-2</span>
            <span>錯題篩選與入庫處置決策樹</span>
          </div>
          <div class="decision-grid">
            <div class="decision-card">
              <span class="d-badge text-muted">情境 A</span>
              <h6>純計算粗心 (如 3×7=24)</h6>
              <p>處置：<strong>當場訂正即可，絕不入錯題本</strong>。避免無效筆記膨脹，降低噪訊。</p>
            </div>
            <div class="decision-card">
              <span class="d-badge text-warning">情境 B</span>
              <h6>概念完全不會 (知識黑洞)</h6>
              <p>處置：<strong>暫停刷題，回課本精研該章節原理</strong>，先做課本例題重建基模。</p>
            </div>
            <div class="decision-card highlight-card">
              <span class="d-badge text-danger">情境 C (核心黃金題)</span>
              <h6>題型辨識模糊 / 邊界忽略</h6>
              <p>處置：<strong>立即剪貼入庫！</strong>黑筆寫卡殼點，紅筆標突破口，藍筆提煉防禦口訣。</p>
            </div>
          </div>
        </div>

        <!-- 表格 1: 三色筆規範與歸因表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 1-1</span>
            <span>北一女三色筆註記規範與認知歸因維度分析表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>顏色分區</th>
                  <th>紀錄內容與工具</th>
                  <th>認知防禦心法</th>
                  <th>實戰示範警語</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="color-dot black-dot"></span><strong>黑色 (Black)</strong></td>
                  <td>原題剪貼 + 當時考場真實算式</td>
                  <td><strong>直面斷點</strong>：忠實暴露思維在哪一步產生邏輯跳躍，不粉飾錯誤。</td>
                  <td><em>「誤將等比首項代為 1，忽略邊界 n=0」</em></td>
                </tr>
                <tr>
                  <td><span class="color-dot red-dot"></span><strong>紅色 (Red)</strong></td>
                  <td>破題突破口 (Trigger Point)</td>
                  <td><strong>突觸錨定</strong>：只寫由卡住到豁然開朗的關鍵 1~2 步核心定理。</td>
                  <td><em>「令 t = x + 1/x，由算幾不等式求極值」</em></td>
                </tr>
                <tr>
                  <td><span class="color-dot blue-dot"></span><strong>藍色 (Blue)</strong></td>
                  <td>錯誤歸因標籤 + 警語 + 進度(✓)</td>
                  <td><strong>元認知反思</strong>：標註知識盲點、程序失誤或條件遺漏。</td>
                  <td><em>「【警語】看見對數必先寫真數 > 0！進度：[✓][✓][ ]」</em></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 3-7-21 追蹤檢核表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 1-2</span>
            <span>學霸錯題本 3-7-21 階梯動態追蹤檢核表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>複習週期</th>
                  <th>檢驗形式</th>
                  <th>合格標準 (Pass)</th>
                  <th>失誤處置 (Fail)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Day 3 盲測</strong></td>
                  <td>用白紙完全遮住解答，重新手算。</td>
                  <td>無卡頓一氣呵成，標註第一個 [✓]。</td>
                  <td>重新閱讀紅筆突破口，藍筆加註警語，重置天數。</td>
                </tr>
                <tr>
                  <td><strong>Day 7 變形題</strong></td>
                  <td>演練同類型變形題或反向提問。</td>
                  <td>準確識別出題核心，標註第二個 [✓]。</td>
                  <td>歸為易混淆模型，退回 Day 3 重新排程。</td>
                </tr>
                <tr>
                  <td><strong>Day 21 總清點</strong></td>
                  <td>考前綜合測驗隨機抽檢。</td>
                  <td>秒殺破題，連續滿三個 [✓] 螢光筆劃除消滅。</td>
                  <td>保留至考前最後一晚極薄重點清單。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 北一女學霸避坑叮嚀：</span>
          <p>千萬別把錯題本當「書法展示本」！只要題目抄太慢，就會產生心理負擔導致放棄。重點在於<strong>「藍筆的歸因」</strong>與<strong>「後續動態劃掉消滅」</strong>。</p>
        </div>
      </div>
    </div>

    <!-- Method 2: 費曼輸出學習法 -->
    <div v-else-if="currentTab === 'feynman'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">建國中學・台大學霸</span>
          <span class="tag-type">生成效應 / 布羅卡語言網絡重構</span>
        </div>
        <h4>2. 費曼輸出學習法 (The Feynman Technique: Teach to Learn)</h4>
        <p class="motto">「如果你不能向一個 8 歲小孩把概念解釋清楚，代表你根本還沒真正搞懂。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            基於<strong>生成效應 (Generation Effect)</strong>：主動產出語句時，大腦會調動左半球布羅卡區（Broca）與威尼克區（Wernicke），
            將散落神經元重新組裝為結構化的語意網絡，徹底粉碎「知識的詛咒（Curse of Knowledge）」與「解釋深度錯覺」。
          </p>
        </div>

        <!-- 圖示 1: 費曼閉環 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 2-1</span>
            <span>費曼閉環回饋與知識除錯循環</span>
          </div>
          <div class="feynman-cycle">
            <div class="cycle-card">
              <span class="cycle-num">01</span>
              <h6>鎖定概念</h6>
              <p>選定單一定律或抽象主題</p>
            </div>
            <div class="cycle-arrow">➔</div>
            <div class="cycle-card">
              <span class="cycle-num">02</span>
              <h6>向外行講述</h6>
              <p>禁絕術語，使用大白話與童趣比喻</p>
            </div>
            <div class="cycle-arrow">➔</div>
            <div class="cycle-card alert-card">
              <span class="cycle-num">03</span>
              <h6>定位卡殼</h6>
              <p>發現語塞或「本來就這樣」的假懂</p>
            </div>
            <div class="cycle-arrow">➔</div>
            <div class="cycle-card success-card">
              <span class="cycle-num">04</span>
              <h6>查書重構</h6>
              <p>精研盲點並二度簡化至無懈可擊</p>
            </div>
          </div>
        </div>

        <!-- 圖示 2: 雙通道神經資訊流向模型 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 2-2</span>
            <span>被動閱讀 vs 費曼主動輸出之神經激發路徑對比</span>
          </div>
          <div class="neural-compare-grid">
            <div class="neural-pane pane-passive">
              <div class="pane-title">❌ 被動閱讀路徑 (留存率 ~ 20%)</div>
              <div class="pane-flow">
                課本符號 ➔ 初級視覺皮質 V1 ➔ 短期工作記憶 ➔ (15秒後迅速衰減)
              </div>
            </div>
            <div class="neural-pane pane-active">
              <div class="pane-title">✅ 費曼輸出神經網絡 (留存率 ~ 90%)</div>
              <div class="pane-flow">
                前額葉解構 ➔ 布羅卡語言重構 ➔ 運動皮質口述 ➔ 聽覺雙向反饋 ➔ 海馬迴 LTP 固化
              </div>
            </div>
          </div>
        </div>

        <!-- 表格 1: 費曼轉譯對照表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 2-1</span>
            <span>高階抽象概念轉譯成 8 歲孩童生活隱喻對照表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>專業學術主題</th>
                  <th>教科書生硬定義</th>
                  <th>費曼轉譯：8 歲小孩聽得懂的比喻</th>
                  <th>生活認知錨點</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>熱力學：熵增定律</strong></td>
                  <td>孤立系統總混亂度恆增，熱量不可逆自低溫流向高溫。</td>
                  <td>「就像你的房間：如果不主動花力氣去收拾打掃，它只會自己變得越來越亂，絕不會自己變乾淨！」</td>
                  <td>不作功 ➔ 不花力氣<br>熵增 ➔ 房間變亂</td>
                </tr>
                <tr>
                  <td><strong>計算機：快取記憶體</strong></td>
                  <td>位於 CPU 與 RAM 間超高速暫存記憶體，減少存取延遲。</td>
                  <td>「就像書桌抽屜：常用鉛筆放抽屜伸手拿（Cache），整套書放遠處大書架（RAM）。」</td>
                  <td>存取層級 ➔ 抽屜 vs 書架</td>
                </tr>
                <tr>
                  <td><strong>神經科學：突觸可塑性</strong></td>
                  <td>神經元間突觸傳導強度隨頻繁刺激增強或減弱 (LTP)。</td>
                  <td>「草地上本來沒路，但只要兩家小朋友天天互相走動串門，草地就會被踩出一條又寬又平的大大道。」</td>
                  <td>赫布定律 ➔ 常走踩出大道</td>
                </tr>
                <tr>
                  <td><strong>化學：化學平衡移動</strong></td>
                  <td>系統受到外界條件改變時，平衡將朝減弱此外界改變方向移動。</td>
                  <td>「就像在擁擠的捷運車廂：右邊門突然湧進一大群人，大家就會不由自主地往左邊空位挪過去。」</td>
                  <td>勒沙特列 ➔ 捷運人潮挪移</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 費曼講述四步評估量規 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 2-2</span>
            <span>費曼輸出自我診斷評估量規 (Rubric)</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>評估維度</th>
                  <th>卓越 (Level 4)</th>
                  <th>合格 (Level 3)</th>
                  <th>待加強 (Level 2)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>術語剝離度</strong></td>
                  <td>全篇無專有名詞，全用生活日常語言通俗表達。</td>
                  <td>偶爾夾雜名詞，但能即時追溯解釋。</td>
                  <td>嚴重依賴名詞朗誦，脫離課本即無法成句。</td>
                </tr>
                <tr>
                  <td><strong>類比精準度</strong></td>
                  <td>生活類比極度生動且邏輯邊界完全契合。</td>
                  <td>能借用現成比喻，基本涵蓋主要機制。</td>
                  <td>比喻牽強附會，存在明顯邏輯漏洞。</td>
                </tr>
                <tr>
                  <td><strong>卡殼感知力</strong></td>
                  <td>敏銳感知自己在何處「不得不說這本來就這樣」。</td>
                  <td>能意識到某步公式自己推導不出來。</td>
                  <td>自欺欺人，以為自己含糊念過就懂了。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 台大學霸實踐妙計：</span>
          <p>找不到真人聽你講？試試「小黃鴨調試法」——桌上擺一隻玩偶，對著它把這道物理大題或解剖學路徑從頭講一遍。一旦卡住，就是你考試會丟分的地方！</p>
        </div>
      </div>
    </div>

    <!-- Method 3: 台大醫科白紙骨架回想法 -->
    <div v-else-if="currentTab === 'blank-sheet'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">台大醫科・奧賽國手</span>
          <span class="tag-type">提取練習 / 海馬迴 CA3 模式完成</span>
        </div>
        <h4>3. 台大醫科「白紙骨架回想法」 (Blank Sheet Retrieval & Reconstruction)</h4>
        <p class="motto">「合上書能默寫出來的骨架，才是考場上帶得走的真本事。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            認知心理學經典<strong>提取練習效應 (Testing Effect)</strong>：單純看書 4 次（SSSS），一週後記憶留存率僅剩 20%；
            而讀 1 次後進行 3 次白紙強制回想（STTT），留存率高達 <strong>80% 以上</strong>。
            觸發海馬迴 CA3 區之<strong>模式完成 (Pattern Completion)</strong>，促使樹突棘（Dendritic spines）迅速增大固化。
          </p>
        </div>

        <!-- 圖示 1: 白紙演進圖 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 3-1</span>
            <span>「先骨架、後血肉、再補洞」白紙演進模型</span>
          </div>
          <div class="blank-sheet-flow">
            <div class="sheet-phase phase-1">
              <div class="phase-title">階段一：閉卷畫骨架 (5 min)</div>
              <div class="phase-mockup">
                <div class="mock-trunk">[核心章節主幹]</div>
                <div class="mock-branches">
                  <span>├─ 1. 原理前提</span>
                  <span>├─ 2. 核心公式推導</span>
                  <span>└─ 3. 常考題型模型</span>
                </div>
              </div>
              <div class="phase-foot">用黑筆默寫大章節與層次關係</div>
            </div>
            <div class="phase-arrow">➔</div>
            <div class="sheet-phase phase-2">
              <div class="phase-title">階段二：填塞血肉細節 (15 min)</div>
              <div class="phase-mockup">
                <div class="mock-flesh">
                  <p>• 公式：v = v0 + at</p>
                  <p>• 條件：等加速度、直線</p>
                  <p class="mock-unknown">• 臨界摩擦... ❓ (想不起來先跳過)</p>
                </div>
              </div>
              <div class="phase-foot">嚴禁偷看書！卡殼打問號</div>
            </div>
            <div class="phase-arrow">➔</div>
            <div class="sheet-phase phase-3">
              <div class="phase-title">階段三：紅筆開卷補洞 (10 min)</div>
              <div class="phase-mockup red-patch">
                <div class="mock-patch">
                  <p>🟥 補齊：臨界摩擦角 tanθ = μs</p>
                  <p>🟥 補正：漏掉系統動量守恆之前提外力為 0</p>
                </div>
              </div>
              <div class="phase-foot">紅筆標出漏洞，即為專屬提分清單</div>
            </div>
          </div>
        </div>

        <!-- 圖示 2: 突觸分子信號流 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 3-2</span>
            <span>白紙主動提取引發突觸長時程增強 (LTP) 之生化分子流向</span>
          </div>
          <div class="synapse-flow">
            <div class="synapse-step">
              <span class="s-step-num">Step 1</span>
              <h6>前額葉檢索強刺激</h6>
              <p>白紙閉卷迫使神經元高頻放電</p>
            </div>
            <div class="synapse-arrow">➔</div>
            <div class="synapse-step">
              <span class="s-step-num">Step 2</span>
              <h6>麩胺酸大量釋放</h6>
              <p>突觸前膜釋放神經傳導物質</p>
            </div>
            <div class="synapse-arrow">➔</div>
            <div class="synapse-step">
              <span class="s-step-num">Step 3</span>
              <h6>NMDA受體開啟+鈣內流</h6>
              <p>觸發胞內第二傳訊因子激活</p>
            </div>
            <div class="synapse-arrow">➔</div>
            <div class="synapse-step highlight-step">
              <span class="s-step-num">Step 4</span>
              <h6>AMPA受體增生 (LTP)</h6>
              <p>突觸傳導強度倍增，記憶焊死</p>
            </div>
          </div>
        </div>

        <!-- 表格 1: 對照表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 3-1</span>
            <span>被動重複閱讀法 vs 白紙主動回想法 全維度科學對照表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>比較指標</th>
                  <th>被動重複閱讀 (Passive Rereading)</th>
                  <th>白紙骨架回想法 (Active Blank Retrieval)</th>
                  <th>神經生理機制說明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>大腦涉入度</strong></td>
                  <td>低度（僅初級視覺皮質 V1 接收光訊號）</td>
                  <td><strong>極高（前額葉、顳葉、海馬迴同步高頻放電）</strong></td>
                  <td>無提取，不記憶；被動閱讀難以生長突觸新棘。</td>
                </tr>
                <tr>
                  <td><strong>主觀感受</strong></td>
                  <td>舒服、順暢、有虛假成就感</td>
                  <td>費力、大腦有燃燒感、直面遺忘的挫折</td>
                  <td>認知心理學名詞：<strong>「有益的困難 (Desirable Difficulties)」</strong>。</td>
                </tr>
                <tr>
                  <td><strong>一週後記憶留存</strong></td>
                  <td>急速崩跌至 15% ~ 25%</td>
                  <td><strong>穩固維持在 70% ~ 85%</strong></td>
                  <td>多次主動打撈促使短期記憶鞏固為大腦皮質長期記憶。</td>
                </tr>
                <tr>
                  <td><strong>考場遷移應變</strong></td>
                  <td>換個題型就想不起公式</td>
                  <td>架構在腦中成網，隨調隨用</td>
                  <td>具備高解析度心智索引（Mental Schema）。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 跨學科白紙回想演練指引 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 3-2</span>
            <span>跨學科白紙回想演練範本與時間規劃表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>學科領域</th>
                  <th>階段一：骨架默寫 (5 min)</th>
                  <th>階段二：血肉填充 (15 min)</th>
                  <th>階段三：紅筆補洞重點 (10 min)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>高中數學</strong></td>
                  <td>章節定理、幾何定義、適用前提。</td>
                  <td>公式推導、邊界極端值、反例圖形。</td>
                  <td>忽略定義域條件（如分母非 0、真數 > 0）。</td>
                </tr>
                <tr>
                  <td><strong>物理化學</strong></td>
                  <td>基本守恆定律、狀態方程式名稱。</td>
                  <td>受力自由體圖、反應機構方程式。</td>
                  <td>遺忘適用邊界（如理想氣體、孤立系統）。</td>
                </tr>
                <tr>
                  <td><strong>生物地科</strong></td>
                  <td>生理調控流程大綱、地質分期。</td>
                  <td>拮抗激素機制、胞器特徵、岩石分類。</td>
                  <td>上下游回饋迴路混淆、專有名詞記錯。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 台大醫科學長忠告：</span>
          <p>第一次在白紙上寫不出東西是 100% 正常的！這說明你平時上課聽懂只是「假懂」。只要堅持每學完一章就默寫一張 A4 紙，考前你根本不需要再抱佛腳。</p>
        </div>
      </div>
    </div>

    <!-- Method 4: 康乃爾 5R 筆記法 -->
    <div v-else-if="currentTab === 'cornell'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">北一女榜首筆記・長春藤名校</span>
          <span class="tag-type">意元集組 / 雙碼理論編碼</span>
        </div>
        <h4>4. 康乃爾 5R 筆記法 (Cornell 5R System & Triple-Zone Layout)</h4>
        <p class="motto">「把一頁筆記變成一張隨時可以自我測驗的動態考卷。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            運用<strong>意元集組 (Chunking)</strong> 突破人類工作記憶 $7 \pm 2$ 的極限。
            主筆記欄（右）容納海量細節，線索欄（左）壓縮成高階關鍵詞；配合遮蓋背誦，直接將筆記轉化為神經提取的「線索觸發器」。
          </p>
        </div>

        <!-- 圖示 1: 康乃爾黃金版面架構 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 4-1</span>
            <span>康乃爾三分割黃金版面配置與動線幾何圖</span>
          </div>
          <div class="cornell-preview">
            <div class="cornell-top-meta">
              <span>📚 主題：電磁感應與法拉第定律</span>
              <span>📅 日期：2026-09-23</span>
              <span>🏷️ 頁數：01</span>
            </div>
            <div class="cornell-split">
              <div class="cornell-cues">
                <div class="col-tag">【線索 / 提問欄】 (寬 30%)</div>
                <div class="cue-item">Q1: 磁通量改變的本質是什麼？</div>
                <div class="cue-item">Q2: 負號的物理意義是？(冷次定律)</div>
                <div class="cue-item">Q3: 動生 vs 感生電動勢區別？</div>
                <div class="cue-tag">#電磁感應 #核心考點</div>
              </div>
              <div class="cornell-notes">
                <div class="col-tag">【課堂主筆記欄】 (寬 70%)</div>
                <p>1. 法拉第電磁感應定律：<strong>ε = -N (dΦB / dt)</strong></p>
                <p>2. 負號詮釋：感應電流磁場恆抵抗原磁通量之改變（能量守恆之展現）。</p>
                <p>3. 動生電動勢公式：<strong>ε = B · L · v</strong> (導線垂直切割磁力線)。</p>
                <p>4. 旋轉線圈在均勻磁場中產生正弦交流電：ε = NBAω sin(ωt)。</p>
              </div>
            </div>
            <div class="cornell-summary">
              <div class="col-tag">【底部總結摘要欄】 (高約 5~7cm，佔 20%)</div>
              <p>📌 <strong>核心本質：</strong>電磁感應的關鍵在於「改變率」而非磁場大小。解題時先判斷是面積變（動生 BLv）還是磁場變（感生 dB/dt），再用冷次定律定方向。</p>
            </div>
          </div>
        </div>

        <!-- 圖示 2: 5R 流程動態循環 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 4-2</span>
            <span>康乃爾 5R 記憶週期動態流向</span>
          </div>
          <div class="flow-steps">
            <div class="step-node">
              <div class="node-title">1. Record</div>
              <div class="node-desc">課堂記錄主幹<br>適度留白</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-title">2. Reduce</div>
              <div class="node-desc">24h 提煉關鍵詞<br>寫左欄問題</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-title">3. Recite</div>
              <div class="node-desc">遮右看左<br>強制口述默想</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-title">4. Reflect</div>
              <div class="node-desc">底部精煉摘要<br>跨單元貫通</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-title">5. Review</div>
              <div class="node-desc">週末間隔抽查<br>對抗遺忘曲線</div>
            </div>
          </div>
        </div>

        <!-- 表格 1: 5R 流程表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 4-1</span>
            <span>康乃爾 5R 執行週期時間分配與具體操作指引表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>5R 階段</th>
                  <th>時機與頻率</th>
                  <th>占用時間</th>
                  <th>產出成果與檢驗標準</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1. Record (記錄)</strong></td>
                  <td>課堂聽講 / 閱讀時</td>
                  <td>約 45 分鐘</td>
                  <td>右側主筆記：記錄骨幹概念、公式推導與例題，適度留白。</td>
                </tr>
                <tr>
                  <td><strong>2. Reduce (簡化)</strong></td>
                  <td>課後當天 (黃金 24h 內)</td>
                  <td>10~15 分鐘</td>
                  <td>左側線索欄：提煉出 3~5 個「提問式標題」與核心關鍵詞組。</td>
                </tr>
                <tr>
                  <td><strong>3. Recite (背誦)</strong></td>
                  <td>隔日早讀 / 自習前</td>
                  <td>10 分鐘</td>
                  <td>手遮右側，只看左側線索提問，能否 100% 流暢口述出右側答案。</td>
                </tr>
                <tr>
                  <td><strong>4. Reflect (反思)</strong></td>
                  <td>單元學習結束時</td>
                  <td>5 分鐘</td>
                  <td>底部填入 2~3 句本質總結，思考其與前後單元之跨科關聯。</td>
                </tr>
                <tr>
                  <td><strong>5. Review (複習)</strong></td>
                  <td>週末統整與考前一週</td>
                  <td>5 分鐘/頁</td>
                  <td>快速掃描底部精華與左側題目，無延遲反應即可打勾通關。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 跨學科應用表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 4-2</span>
            <span>康乃爾筆記法跨學科版面實戰應用對照表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>學科類型</th>
                  <th>左欄線索 (Reduce)</th>
                  <th>右欄筆記 (Record)</th>
                  <th>底欄摘要 (Summary)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>數理計算科</strong></td>
                  <td>題型識別特徵提問（何時用動量而非能量？）</td>
                  <td>典型母題推導、幾何輔助線作法。</td>
                  <td>提煉解題口訣與常見邊界陷阱。</td>
                </tr>
                <tr>
                  <td><strong>文史社會科</strong></td>
                  <td>歷史轉折關鍵詞、制度利弊提問。</td>
                  <td>年代事件演進、因果分析、經濟結構。</td>
                  <td>一句話總結該時代本質特徵。</td>
                </tr>
                <tr>
                  <td><strong>外語學習科</strong></td>
                  <td>核心單字、詞根詞綴、介系詞提問。</td>
                  <td>道地例句、長難句語法分析。</td>
                  <td>用所學新詞造一段完整情境短文。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 北一女學姐心法：</span>
          <p>複習時千萬不要直接看右邊！先拿一張紙把右邊整個遮住，把自己當考生，只看左邊的 Q1、Q2 回答。能回答出來的才算真正記住。</p>
        </div>
      </div>
    </div>

    <!-- Method 5: 目錄架構與知識樹編碼法 -->
    <div v-else-if="currentTab === 'knowledge-tree'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">台大法律・醫科國考</span>
          <span class="tag-type">基模理論 / 頂層認知加工 / 空間認知地圖</span>
        </div>
        <h4>5. 目錄架構與知識樹編碼法 (TOC Knowledge Tree & Mental Anchoring)</h4>
        <p class="motto">「先背目錄再讀書；沒有地圖的旅人，只會在知識森林中迷路。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            依據<strong>基模理論 (Schema Theory)</strong>：新知識必須附著在既有心智框架上。
            透過<strong>頂層加工 (Top-Down Processing)</strong> 與海馬迴<strong>空間認知地圖 (Cognitive Map)</strong>，
            先在腦中建立章節階層樹，新吸收的公式、法條或考題便有精準的「認知掛鉤 (Mental Hooks)」，檢索時可達到毫秒級定位。
          </p>
        </div>

        <!-- 圖示 1: 知識樹階層圖 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 5-1</span>
            <span>學科知識樹階層式結構與心智錨定圖</span>
          </div>
          <div class="tree-visual">
            <div class="tree-root-node">
              <span class="tree-badge">樹幹 (Trunk)</span>
              <strong>【高中物理知識樹總幹】</strong>
            </div>
            <div class="tree-branches-row">
              <div class="tree-branch-card">
                <div class="branch-head">🌿 第 1 章：牛頓運動力學</div>
                <div class="branch-twigs">
                  <span>1.1 牛頓三大運動定律</span>
                  <span>1.2 摩擦力與斜面模型</span>
                  <span>1.3 圓周運動與向心力</span>
                </div>
                <div class="branch-leaves">
                  🍂 葉片考點：靜滑塊臨界下滑角 tanθ = μs
                </div>
              </div>
              <div class="tree-branch-card">
                <div class="branch-head">🌿 第 2 章：功與功能定理</div>
                <div class="branch-twigs">
                  <span>2.1 功的純量積 W = F·s·cosθ</span>
                  <span>2.2 功能定理 ΔK = W_total</span>
                  <span>2.3 力學能守恆定律</span>
                </div>
                <div class="branch-leaves">
                  🍂 葉片考點：彈簧振子 + 圓形軌道綜合極值題
                </div>
              </div>
              <div class="tree-branch-card">
                <div class="branch-head">🌿 第 3 章：動量與碰撞</div>
                <div class="branch-twigs">
                  <span>3.1 衝量與動量變化 J = Δp</span>
                  <span>3.2 碰撞模型 (彈性/完全非彈)</span>
                  <span>3.3 質心運動定理</span>
                </div>
                <div class="branch-leaves">
                  🍂 葉片考點：彈性碰撞一維速度反彈公式
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 圖示 2: 綜合大題枝條交匯 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 5-2</span>
            <span>跨章節綜合大題之知識樹枝條交匯破題流程</span>
          </div>
          <div class="branch-converge-flow">
            <div class="converge-source">
              <div class="c-leaf">電磁感應 (第 5 章): BLv 電動勢</div>
              <div class="c-leaf">牛頓力學 (第 1 章): F = ma 阻尼運動</div>
              <div class="c-leaf">能量守恆 (第 2 章): 動能轉化為焦耳熱</div>
            </div>
            <div class="converge-arrow">➔➔➔</div>
            <div class="converge-target">
              <strong>【壓軸大題核心破題】</strong><br>
              建立微分方程與能量積分式，避免盲目套單一公式！
            </div>
          </div>
        </div>

        <!-- 表格 1: 知識樹對照表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 5-1</span>
            <span>傳統線性逐頁閱讀 vs 目錄知識樹心智錨定 全維度比較</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>對比指標</th>
                  <th>傳統線性逐頁閱讀 (Linear Reading)</th>
                  <th>目錄知識樹編碼 (TOC Tree Anchoring)</th>
                  <th>實戰成績差距</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>心智全貌感知</strong></td>
                  <td>只見樹木不見森林，讀到後面忘了前面。</td>
                  <td><strong>胸有成竹、居高臨下俯瞰全局地圖。</strong></td>
                  <td>考卷題目一稍微變形，樹狀學習者能秒認出題單元。</td>
                </tr>
                <tr>
                  <td><strong>新資訊吸收效率</strong></td>
                  <td>像往無序雜物間塞東西，越塞越亂。</td>
                  <td><strong>新知識精確掛載至對應枝椏，井然有序。</strong></td>
                  <td>同化吸收時間節省 50% 以上。</td>
                </tr>
                <tr>
                  <td><strong>考場提取速度</strong></td>
                  <td>苦思「我好像在哪看過但想不起」。</td>
                  <td><strong>毫秒級定位：「第 2 章 ➔ 第 3 節 ➔ 公式 2」。</strong></td>
                  <td>徹底根絕考場上「大腦一片空白」的恐慌現象。</td>
                </tr>
                <tr>
                  <td><strong>跨章節大題破解</strong></td>
                  <td>無從下手，看不出考點關聯。</td>
                  <td><strong>一眼看出融合了「力學」與「電磁學」兩根大枝。</strong></td>
                  <td>攻克聯考最後壓軸綜合大題的關鍵核心。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 知識樹三階段施工表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 5-2</span>
            <span>一本教材知識樹工程三階段施工指引表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>施工階段</th>
                  <th>時間預算</th>
                  <th>核心產出物</th>
                  <th>驗收合格檢驗標準</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>立幹分枝</strong></td>
                  <td>開學前 2 小時</td>
                  <td>手繪全書目錄骨架樹。</td>
                  <td>閉眼默背出 10 大章標題與先後邏輯鏈。</td>
                </tr>
                <tr>
                  <td><strong>生枝添葉</strong></td>
                  <td>每週隨堂 1 小時</td>
                  <td>補齊關鍵定義、公式及 1~2 道母題。</td>
                  <td>翻開課本任一頁，能指出其在樹上的座標。</td>
                </tr>
                <tr>
                  <td><strong>疏枝穿引</strong></td>
                  <td>考前兩週 3 小時</td>
                  <td>畫出跨章節彩色虛線關聯。</td>
                  <td>能指出任兩章交集概念，跨單元融會貫通。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 台大學霸操作密技：</span>
          <p>開學第一週，先把課本「目錄」撕下來（或影印一張）貼在書桌最顯眼處。每次讀書前花 30 秒看一眼目錄，問自己「我今天在建造哪一根樹枝？」，學習效率瞬間翻倍。</p>
        </div>
      </div>
    </div>

    <!-- Method 6: 艾賓浩斯間隔重複盒 (Leitner Box) -->
    <div v-else-if="currentTab === 'leitner'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">建中數理資優班・Anki 底層演算法</span>
          <span class="tag-type">間隔重複 / 突觸長期鞏固</span>
        </div>
        <h4>6. 艾賓浩斯間隔重複盒 (Leitner Box & Spaced Repetition)</h4>
        <p class="motto">「在即將忘記的臨界點提取，記憶將被神經突觸牢牢焊接。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            根據<strong>艾賓浩斯遺忘曲線</strong>，新記憶在 24 小時內流失最快。
            萊特納盒（Leitner Box）在卡片即將滑落遺忘臨界點時觸發主動提取；
            每次成功回想，海馬迴便向大腦皮質發送鞏固訊號，使遺忘曲線變得越來越平緩。
          </p>
        </div>

        <!-- 圖示 1: 5 級升降盒狀態機 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 6-1</span>
            <span>萊特納 5 級卡盒升降與懲罰重練狀態轉移圖</span>
          </div>
          <div class="leitner-boxes-flow">
            <div class="l-box box-1">
              <div class="l-box-head">Box 1</div>
              <div class="l-freq">每日 1 測</div>
              <div class="l-desc">所有新卡片起點</div>
            </div>
            <div class="l-transition">
              <span class="arrow-up text-success">答對 ➔</span>
              <span class="arrow-down text-danger">🠔 答錯</span>
            </div>
            <div class="l-box box-2">
              <div class="l-box-head">Box 2</div>
              <div class="l-freq">每 3 天</div>
              <div class="l-desc">初期突觸穩固</div>
            </div>
            <div class="l-transition">
              <span class="arrow-up text-success">答對 ➔</span>
              <span class="arrow-down text-danger">🠔 答錯</span>
            </div>
            <div class="l-box box-3">
              <div class="l-box-head">Box 3</div>
              <div class="l-freq">每 7 天</div>
              <div class="l-desc">皮層中期轉移</div>
            </div>
            <div class="l-transition">
              <span class="arrow-up text-success">答對 ➔</span>
              <span class="arrow-down text-danger">🠔 答錯</span>
            </div>
            <div class="l-box box-4">
              <div class="l-box-head">Box 4</div>
              <div class="l-freq">每 14 天</div>
              <div class="l-desc">長期網絡鎖定</div>
            </div>
            <div class="l-transition">
              <span class="arrow-up text-success">答對 ➔</span>
              <span class="arrow-down text-danger">🠔 答錯</span>
            </div>
            <div class="l-box box-5">
              <div class="l-box-head">Box 5</div>
              <div class="l-freq">每 30 天+</div>
              <div class="l-desc">永久反射級神經記憶</div>
            </div>
          </div>
          <div class="rule-alert mt-12 text-center">
            ⚠️ <strong>【鐵血懲罰法則】：</strong>任何盒子（即便在 Box 4 或 5）只要答錯 1 次，<strong>立刻打回 Box 1 重新起步！</strong>
          </div>
        </div>

        <!-- 圖示 2: 留存率曲線對比 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 6-2</span>
            <span>無複習急速衰退 vs 間隔提取加固之留存率對照</span>
          </div>
          <div class="retention-curve-mock">
            <div class="curve-item curve-bad">
              <span class="c-title">無複習遺忘曲線</span>
              <div class="c-bar bar-0">100% 學習當下</div>
              <div class="c-bar bar-1">58% 20分鐘後</div>
              <div class="c-bar bar-2">33% 1天後</div>
              <div class="c-bar bar-3">20% 1週後 (幾近歸零)</div>
            </div>
            <div class="curve-item curve-good">
              <span class="c-title">萊特納間隔加固曲線</span>
              <div class="c-bar gbar-1">D+1 提取 ➔ 回彈至 100%</div>
              <div class="c-bar gbar-2">D+3 提取 ➔ 衰減大幅放緩</div>
              <div class="c-bar gbar-3">D+7 提取 ➔ 轉化為皮質長期記憶</div>
              <div class="c-bar gbar-4">D+30 提取 ➔ 恆定保存在 > 95%</div>
            </div>
          </div>
        </div>

        <!-- 表格 1: 遺忘臨界排程表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 6-1</span>
            <span>遺忘曲線臨界間隔時間排程與 5 級卡盒檢驗頻率表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>卡盒等級</th>
                  <th>複習間隔週期</th>
                  <th>大腦留存率預估</th>
                  <th>升級 / 降級判定條件</th>
                  <th>神經生理狀態</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Box 1 (衝刺盒)</strong></td>
                  <td><strong>每日 (Day 1)</strong></td>
                  <td>~ 50%</td>
                  <td>答對 ➔ 升 Box 2；答錯 ➔ 留在 Box 1 稍後再測</td>
                  <td>海馬迴剛寫入短期記憶，極易遺忘。</td>
                </tr>
                <tr>
                  <td><strong>Box 2 (初級盒)</strong></td>
                  <td><strong>每 3 天 (Day 3)</strong></td>
                  <td>~ 65%</td>
                  <td>答對 ➔ 升 Box 3；答錯 ➔ 跌回 Box 1 重練</td>
                  <td>初級突觸強度增加，首次抗阻遺忘。</td>
                </tr>
                <tr>
                  <td><strong>Box 3 (中級盒)</strong></td>
                  <td><strong>每 7 天 (Day 7)</strong></td>
                  <td>~ 75%</td>
                  <td>答對 ➔ 升 Box 4；答錯 ➔ 跌回 Box 1 重練</td>
                  <td>訊號由海馬迴向顳葉皮層投射轉化。</td>
                </tr>
                <tr>
                  <td><strong>Box 4 (鞏固盒)</strong></td>
                  <td><strong>每 14 天 (Day 14)</strong></td>
                  <td>~ 85%</td>
                  <td>答對 ➔ 升 Box 5；答錯 ➔ 跌回 Box 1 重練</td>
                  <td>皮質神經迴路建立完備，抗干擾力強。</td>
                </tr>
                <tr>
                  <td><strong>Box 5 (永久盒)</strong></td>
                  <td><strong>每 30 天 (Day 30+)</strong></td>
                  <td><strong>> 95%</strong></td>
                  <td>答對 ➔ 保持在 Box 5；答錯 ➔ 跌回 Box 1 重練</td>
                  <td>長時程永久固化，達到直覺反射。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 卡片製作規範表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 6-2</span>
            <span>高品質記憶卡製作標準與避坑指南</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>設計維度</th>
                  <th>優質卡片標準 (High Yield)</th>
                  <th>低效卡片避坑 (Low Yield)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>資訊原子化</strong></td>
                  <td>一卡一問（如：光的干涉臨界條件式？）。</td>
                  <td>整頁筆記全部塞進一張卡片。</td>
                </tr>
                <tr>
                  <td><strong>雙向翻轉</strong></td>
                  <td>A 面問公式名稱，B 面問公式推導。</td>
                  <td>只有單向被動死記，無法靈活調用。</td>
                </tr>
                <tr>
                  <td><strong>圖像錨定</strong></td>
                  <td>搭配簡潔草圖或 NChain 00-99 形象符號。</td>
                  <td>只有枯燥文字，無視覺雙碼支持。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 配合 NChain 的應用：</span>
          <p>在 NChain 的「閃卡測驗 (Flash Cards)」與「快速記憶 (Flash Memory)」中，系統已自動內建此間隔重複邏輯，答對拉長間隔，答錯自動納入高頻重測隊列！</p>
        </div>
      </div>
    </div>

    <!-- Method 7: 西蒙切片學習法與莫法特交替專注 -->
    <div v-else-if="currentTab === 'simon-moffat'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">諾貝爾獎西蒙・建中奧賽隊</span>
          <span class="tag-type">大腦皮質交替 / 50,000 心理組塊擊穿</span>
        </div>
        <h4>7. 西蒙切片學習法與莫法特交替專注 (Simon Chunking & Moffat Switching)</h4>
        <p class="motto">「集中全部火力攻其一點；善用大腦不同分區交替休息，實現全天無疲勞超高效衝刺。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            諾貝爾獎得主赫伯特·西蒙提出：專家能力源自大腦儲存的 <strong>50,000 個心理組塊 (Chunking)</strong>。
            結合莫法特（Moffat）大腦分區理論：負責高階邏輯運算的前額葉容易神經疲乏；
            此時不應純躺平，而是切換至語言、空間或運動皮質，讓邏輯神經元<strong>「在切換中進行主動修復」</strong>。
          </p>
        </div>

        <!-- 圖示 1: 西蒙切片與能量漏斗 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 7-1</span>
            <span>西蒙單點切片聚焦與微技能衝刺漏斗</span>
          </div>
          <div class="simon-funnel">
            <div class="funnel-layer f-layer-1">
              <span class="f-title">1. 鎖定單一攻堅領域</span>
              <span class="f-desc">例如：一個月徹底拿下「微積分極限與導數」</span>
            </div>
            <div class="funnel-layer f-layer-2">
              <span class="f-title">2. 切片分解為 30 個微技能組塊</span>
              <span class="f-desc">極限定義 ➔ 夾擠定理 ➔ 羅必達法則 ➔ 泰勒公式展開</span>
            </div>
            <div class="funnel-layer f-layer-3">
              <span class="f-title">3. 90 分鐘專注衝刺 (單純聚焦)</span>
              <span class="f-desc">隔絕所有干擾，集中全力擊穿該單一模塊至反射級</span>
            </div>
            <div class="funnel-layer f-layer-4">
              <span class="f-title">4. 組塊合流 ➔ 建立專家心智模型</span>
              <span class="f-desc">拿下該科目核心主幹，邁向下一攻堅目標</span>
            </div>
          </div>
        </div>

        <!-- 圖示 2: 莫法特大腦分區輪替模型 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 7-2</span>
            <span>莫法特大腦皮質分區交替激發流動</span>
          </div>
          <div class="cortical-grid">
            <div class="c-zone zone-pfc">
              <span class="z-badge">上午 08:30-10:00</span>
              <h6>背外側前額葉 (dlPFC)</h6>
              <p>📐 高階數理邏輯高強度推演</p>
            </div>
            <div class="c-zone-arrow">➔</div>
            <div class="c-zone zone-temp">
              <span class="z-badge">中午 10:15-11:30</span>
              <h6>左顳葉語意區 (Temporal)</h6>
              <p>📖 外語長難句與文言文語感</p>
            </div>
            <div class="c-zone-arrow">➔</div>
            <div class="c-zone zone-parietal">
              <span class="z-badge">下午 13:30-15:00</span>
              <h6>右頂枕葉空間區 (Parietal)</h6>
              <p>🗺️ 地理等高線與立體化學構型</p>
            </div>
            <div class="c-zone-arrow">➔</div>
            <div class="c-zone zone-cerebellum">
              <span class="z-badge">傍晚 15:15-16:00</span>
              <h6>運動皮質與小腦 (Motor)</h6>
              <p>🏃 慢跑運動促分泌 BDNF 因子</p>
            </div>
          </div>
        </div>

        <!-- 表格 1: 莫法特大腦輪替排程表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 7-1</span>
            <span>莫法特學習排程：大腦皮質神經活化分區與學科輪替調度表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>學習時段</th>
                  <th>學科任務</th>
                  <th>主導大腦皮質區域</th>
                  <th>神經生理機制</th>
                  <th>疲勞防禦與切換技巧</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>時段一 (08:30-10:00)</strong></td>
                  <td><strong>高階微積分 / 物理競賽題</strong></td>
                  <td>背外側前額葉 (dlPFC)、頂葉聯合區</td>
                  <td>深度邏輯推演，大量消耗神經葡萄糖與傳導物。</td>
                  <td>時間一到強制停筆，閉目放空深呼吸 10 分鐘。</td>
                </tr>
                <tr>
                  <td><strong>時段二 (10:15-11:30)</strong></td>
                  <td><strong>文言文語感 / 英文生字閱讀</strong></td>
                  <td>左顳葉、布羅卡區 (Broca)、海馬迴</td>
                  <td>邏輯皮質進入休眠，語意與發音神經網全面接手。</td>
                  <td>大聲朗讀，調動聽覺與語音雙重反饋。</td>
                </tr>
                <tr>
                  <td><strong>時段三 (13:30-15:00)</strong></td>
                  <td><strong>立體化學構型 / 地理地形圖</strong></td>
                  <td>枕葉視覺區、右頂下小葉 (IPL)</td>
                  <td>語言區休息，3D 空間想像、色彩旋轉全力運轉。</td>
                  <td>動手手繪立體圖，落實雙碼理論。</td>
                </tr>
                <tr>
                  <td><strong>時段四 (15:15-16:00)</strong></td>
                  <td><strong>慢跑 / 伸展瑜珈 / 樂器練習</strong></td>
                  <td>運動皮質、小腦、基底核</td>
                  <td>全大腦皮質減壓，分泌內啡肽與 BDNF 促神經新生。</td>
                  <td>運動後大腦重獲清醒，迎接晚間高效複習。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 30天西蒙切片甘特表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 7-2</span>
            <span>高難度學科 30 天西蒙切片擊穿甘特排程表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>階段日程</th>
                  <th>切片任務模塊</th>
                  <th>每日專注時數</th>
                  <th>合格驗收指標</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Day 1 ~ 7</strong></td>
                  <td>基礎核心組塊建立</td>
                  <td>3.5 小時 (分 2 組 90 min)</td>
                  <td>推導全單元定理，白紙默寫通過率 100%。</td>
                </tr>
                <tr>
                  <td><strong>Day 8 ~ 18</strong></td>
                  <td>核心題型原型攻堅</td>
                  <td>4.0 小時</td>
                  <td>刷透 50 道典型母題，每題整理 2 種解法。</td>
                </tr>
                <tr>
                  <td><strong>Day 19 ~ 25</strong></td>
                  <td>跨模塊合流挑戰</td>
                  <td>4.0 小時</td>
                  <td>限時挑戰歷屆壓軸大題，調用反應 < 10 秒。</td>
                </tr>
                <tr>
                  <td><strong>Day 26 ~ 30</strong></td>
                  <td>閉卷大考弱點封閉</td>
                  <td>3.0 小時</td>
                  <td>全真模擬考 3 回，錯題本劃掉消滅。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 建中奧賽國手秘訣：</span>
          <p>不要一整天只算數學！算到頭昏腦脹還硬撐，只會加深錯誤迴路的形成。及時切換到英文或去慢跑，大腦在背景（預設模式網絡 DMN）會自動整理剛才的解題靈感！</p>
        </div>
      </div>
    </div>

    <!-- Method 8: 北一女時空雙軸年表與地理套疊筆記法 -->
    <div v-else-if="currentTab === 'chrono-spatial'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">北一女中・社會科榜首</span>
          <span class="tag-type">海馬迴位置與時間細胞協同 / 立體多維檢索</span>
        </div>
        <h4>8. 北一女「時空雙軸年表與地理套疊筆記法」 (Spatiotemporal Mapping)</h4>
        <p class="motto">「背歷史不是背年代，背地理不是背地名；將時間與空間套疊，大腦便是活的 Google Earth。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            2014 年諾貝爾生理醫學獎證實，海馬迴中同時存在表徵「空間位置」的<strong>位置細胞 (Place Cells)</strong> 與表徵「時間流動」的<strong>時間細胞 (Time Cells)</strong>。
            當歷史事件被綁定到具體地圖座標上時，大腦是在利用生物演化中最古老強大的<strong>導航迴路</strong>來記住抽象文史，達到立體過目不忘。
          </p>
        </div>

        <!-- 圖示 1: 時空雙軸立體套疊模型 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 8-1</span>
            <span>時空雙軸矩陣立體套疊模型 (橫軸時間 × 縱軸空間)</span>
          </div>
          <div class="matrix-visual">
            <div class="m-row m-head">
              <span class="m-cell cell-label">地理分區 ↓ / 時間軸 ➔</span>
              <span class="m-cell">1500 (16 世紀初)</span>
              <span class="m-cell">1550 (16 世紀中)</span>
              <span class="m-cell">1600 (17 世紀初)</span>
            </div>
            <div class="m-row">
              <span class="m-cell cell-label"><strong>歐洲大陸</strong></span>
              <span class="m-cell">⛵ 大航海地理大發現</span>
              <span class="m-cell">✝️ 馬丁路德宗教改革</span>
              <span class="m-cell">👑 西班牙無敵艦隊覆滅</span>
            </div>
            <div class="m-row">
              <span class="m-cell cell-label"><strong>美洲新大陸</strong></span>
              <span class="m-cell">⚔️ 阿茲特克/印加遭征服</span>
              <span class="m-cell">⛏️ 波托西銀礦爆發開採</span>
              <span class="m-cell">🚢 馬尼拉大帆船跨太平洋</span>
            </div>
            <div class="m-row">
              <span class="m-cell cell-label"><strong>東亞 (明朝/日本)</strong></span>
              <span class="m-cell">🏯 日本戰國時代展開</span>
              <span class="m-cell">💰 白銀大量湧入 / 一條鞭法</span>
              <span class="m-cell">🌸 德川幕府建立 / 鎖國前夕</span>
            </div>
          </div>
          <div class="matrix-link-note mt-8 text-center">
            🔗 <strong>跨區因果貫通：</strong>美洲銀礦開採 ➔ 經太平洋大帆船 ➔ 流入明朝推動稅賦折銀 (一條鞭法)！
          </div>
        </div>

        <!-- 圖示 2: 全球化因果推演網絡 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 8-2</span>
            <span>歷史重大事件全球因果連鎖推演網絡</span>
          </div>
          <div class="flow-steps">
            <div class="step-node">
              <div class="node-title">1. 地理大發現</div>
              <div class="node-desc">新航路開闢<br>西班牙美洲殖民</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-title">2. 波托西銀礦</div>
              <div class="node-desc">大量白銀產出<br>馬尼拉航線建立</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-title">3. 東亞貿易網絡</div>
              <div class="node-desc">白銀換取中國生絲<br>明朝白銀貨幣化</div>
            </div>
            <div class="flow-arrow">➔</div>
            <div class="step-node">
              <div class="node-title">4. 歐洲物價革命</div>
              <div class="node-desc">貨幣貶值物價飛漲<br>封建地主實力衰落</div>
            </div>
          </div>
        </div>

        <!-- 表格 1: 時空雙軸版面規範表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 8-1</span>
            <span>北一女時空雙軸筆記法版面結構規劃與繪製規範表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>軸線/圖層</th>
                  <th>版面空間</th>
                  <th>填寫內容與視覺符號</th>
                  <th>考場實戰破題威力</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>橫向經線 (時間)</strong></td>
                  <td>上方 5 公分橫欄</td>
                  <td>世紀年代刻度、重大分期節點。</td>
                  <td>根除「同時期不同地區歷史無法串聯」的死角。</td>
                </tr>
                <tr>
                  <td><strong>縱向緯線 (區域)</strong></td>
                  <td>主體分成 3~4 橫帶</td>
                  <td>東亞 / 歐洲 / 美洲 / 伊斯蘭世界。</td>
                  <td>橫看跨區互動，縱看本土演進，視角自由切換。</td>
                </tr>
                <tr>
                  <td><strong>物質貿易流 (綠)</strong></td>
                  <td>綠色實線雙向箭頭</td>
                  <td>白銀、香料、黑奴、絲綢、洋流路線。</td>
                  <td>秒殺近代世界貿易與全球化大題。</td>
                </tr>
                <tr>
                  <td><strong>思想制度流 (紫)</strong></td>
                  <td>紫色虛線氣泡框</td>
                  <td>宗教傳播、啟蒙思想、政體改革。</td>
                  <td>掌控文化跨國交融與制度比較。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 16 世紀跨國同期對照表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 8-2</span>
            <span>16 世紀跨國跨區域同期歷史對照與地理套疊分析範本表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>地理區域</th>
                  <th>政治演替 (橙)</th>
                  <th>經濟物流 (綠)</th>
                  <th>思想文化 (紫)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>歐洲大陸</strong></td>
                  <td>哈布斯堡帝國擴張；宗教戰爭爆發。</td>
                  <td>物價革命；商路轉移至大西洋。</td>
                  <td>宗教改革；哥白尼日心說。</td>
                </tr>
                <tr>
                  <td><strong>東亞 (明/日)</strong></td>
                  <td>明世宗嘉靖倭亂；日本戰國織豐時期。</td>
                  <td>美洲白銀大量流入；一條鞭法實施。</td>
                  <td>陽明心學流行；利瑪竇來華傳西學。</td>
                </tr>
                <tr>
                  <td><strong>美洲新大陸</strong></td>
                  <td>阿茲特克/印加被滅；西印度總督區成立。</td>
                  <td>波托西銀礦開採；黑奴種植園。</td>
                  <td>天主教方濟各會傳播；古文明遭滅。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 北一女社會科學霸心法：</span>
          <p>畫筆記時千萬不要只是死板畫表格！右側務必隨手手繪簡易等高線或海岸線輪廓圖，標出戰略隘口與洋流季風。地理決定歷史，把地圖畫出來，歷史事件便有了發生的必然性！</p>
        </div>
      </div>
    </div>

    <!-- Method 9: 建中原型母題拆解與一題多解收斂法 -->
    <div v-else-if="currentTab === 'mother-problem'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">建國中學・數理資優班 / 奧賽金牌</span>
          <span class="tag-type">基模遷移理論 / 題眼提煉 / 認知靈活性</span>
        </div>
        <h4>9. 建中「原型母題拆解與一題多解收斂法」 (Paradigm Problem & Multi-Angle Convergence)</h4>
        <p class="motto">「做一題通十題，而不是做十題懂一題；一道經典母題，勝過一千道機械盲刷題。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>🧠 腦科學與認知底層原理</h5>
          <p>
            依據<strong>基模遷移理論 (Schema Transfer Theory)</strong>：單一解法只能建立僵化的局部突觸連結；
            當對同一核心問題調用不同腦區（幾何直覺調用枕葉，坐標代數調用頂葉）進行多解推導時，
            大腦能抽取出抽象的<strong>「深層結構基模 (Deep Schema)」</strong>，大幅提升前額葉的<strong>認知靈活性 (Cognitive Flexibility)</strong>。
          </p>
        </div>

        <!-- 圖示 1: 母題族譜衍生圖 -->
        <div class="diagram-box mb-16">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 9-1</span>
            <span>原型母題衍生變形題族譜與思維收斂模型</span>
          </div>
          <div class="mother-tree-visual">
            <div class="mother-box">
              <span class="m-badge">核心原型母題</span>
              <h6>【橢圓焦點三角形面積最大值】</h6>
              <p>核心條件：半長軸 a, 半短軸 b, 半焦距 c 與離心率 e</p>
            </div>
            <div class="mother-branches">
              <div class="m-branch-col">
                <span class="b-title">多維度破解法</span>
                <div class="b-card">解法 1: 幾何正切半角 S = b² tan(θ/2)</div>
                <div class="b-card">解法 2: 坐標代數法 S = 1/2 |y_P · 2c|</div>
                <div class="b-card">解法 3: 三角參數式求導極值法</div>
              </div>
              <div class="m-branch-col">
                <span class="b-title">衍生變形題族譜</span>
                <div class="b-card">變形 1: 雙曲線焦點三角形 (符號反轉)</div>
                <div class="b-card">變形 2: 拋物線焦點弦長極值 (e = 1)</div>
                <div class="b-card">變形 3: 空間二次曲面立體截面極值</div>
              </div>
            </div>
            <div class="mother-converge-foot">
              🎯 <strong>深層基模收斂：</strong>圓錐曲線統一光學幾何定義與焦半徑特性，一題穿透整個解析幾何章節！
            </div>
          </div>
        </div>

        <!-- 圖示 2: 一題多解決策流 -->
        <div class="diagram-box mb-20">
          <div class="diagram-header">
            <span class="diagram-badge">圖示 9-2</span>
            <span>考場一題多解思維切換與解法效率決策流</span>
          </div>
          <div class="decision-grid">
            <div class="decision-card">
              <span class="d-badge text-success">維度 1: 純幾何/向量法</span>
              <h6>對稱性強、特殊角明顯</h6>
              <p>特性：<strong>3 行搞定，節省 80% 時間</strong>。適合選擇題搶分。</p>
            </div>
            <div class="decision-card">
              <span class="d-badge text-primary">維度 2: 坐標解析幾何法</span>
              <h6>幾何直覺卡死、垂直條件多</h6>
              <p>特性：<strong>暴力建系聯立方程式，絕對保底</strong>。適合計算題穩拿步驟分。</p>
            </div>
            <div class="decision-card">
              <span class="d-badge text-warning">維度 3: 參數代換與求導</span>
              <h6>題目尋求「極大極小、範圍區間」</h6>
              <p>特性：<strong>化二元為一元函數</strong>，利用微積分或算幾不等式一招制勝。</p>
            </div>
          </div>
        </div>

        <!-- 表格 1: 四重解法維度表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 9-1</span>
            <span>經典母題之四重解法維度與思維路徑對比表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>解法維度</th>
                  <th>核心數學工具</th>
                  <th>思維優勢與痛點</th>
                  <th>大考最佳適用情境</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1. 綜合幾何法</strong></td>
                  <td>輔助圓、角平分線、相似形。</td>
                  <td><strong>極快極優雅</strong>；但依賴瞬間靈感，若找不到輔助線易卡死。</td>
                  <td>選擇題、填空題，需 1 分鐘內秒殺。</td>
                </tr>
                <tr>
                  <td><strong>2. 向量分析法</strong></td>
                  <td>向量內積、外積、柯西不等式。</td>
                  <td><strong>避開繁瑣坐標</strong>；公式簡潔，運算量適中。</td>
                  <td>出現夾角、模長、投影或垂直條件。</td>
                </tr>
                <tr>
                  <td><strong>3. 坐標解析法</strong></td>
                  <td>平面直角坐標系、直線與二次曲線聯立。</td>
                  <td><strong>絕對保底通用</strong>；無靈感也能做，但運算量大易算錯。</td>
                  <td>大考非選計算題，穩健賺取過程分數。</td>
                </tr>
                <tr>
                  <td><strong>4. 參數與求導法</strong></td>
                  <td>三角代換 (x = a·cosθ)、一階導數。</td>
                  <td><strong>化二元為一元函數</strong>；降維打擊，直搗極值邊界。</td>
                  <td>專門破解「最大值、最小值、範圍」極值大題。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 表格 2: 母題庫篩選表 -->
        <div class="table-box mb-16">
          <div class="table-header">
            <span class="diagram-badge">表格 9-2</span>
            <span>學霸「母題庫」建檔規範與題目篩選指標表</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>篩選維度</th>
                  <th>合格母題標準 (Pass)</th>
                  <th>淘汰劣質題目 (Drop)</th>
                  <th>資優班學長心法</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>代表性 (Archetype)</strong></td>
                  <td>涵蓋 2 個以上核心定理，為歷年模考或聯考原型。</td>
                  <td>死記硬背或偏門怪異的冷僻技巧題。</td>
                  <td>「做一題通十題，絕不做十題懂一題。」</td>
                </tr>
                <tr>
                  <td><strong>衍生性 (Extensibility)</strong></td>
                  <td>可透過增添條件衍生出 3 道以上變形題。</td>
                  <td>條件極度特化，稍微改動一點條件便無法求解。</td>
                  <td>能繪製出母子題譜系者方為好題。</td>
                </tr>
                <tr>
                  <td><strong>解法多樣性 (Diversity)</strong></td>
                  <td>至少具備 2 種不同思考切角（如幾何與代數雙解）。</td>
                  <td>只有唯一一種死板運算法。</td>
                  <td>訓練思維切換與考場交叉驗算。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="tips-box">
          <span class="tips-title">💡 建中資優班學長叮嚀：</span>
          <p>不要沉迷於刷題數量的虛榮！考前刷 5000 題的同學，往往輸給精研 50 道母題、把每道母題的 4 種解法與 3 個變形搞得滾瓜爛熟的同學！</p>
        </div>
      </div>
    </div>

    <!-- Overview / Synthesis Tab -->
    <div v-else-if="currentTab === 'overview'" class="method-card">
      <div class="method-header">
        <div class="header-tags">
          <span class="tag-origin">跨學科學霸綜合心法</span>
          <span class="tag-type">知識鏈閉環 / NChain 系統全方位賦能</span>
        </div>
        <h4>9 大學霸學習法跨系統整合矩陣</h4>
        <p class="motto">「掌握單一方法是戰術，將 9 大方法連成認知閉環才是終極戰略。」</p>
      </div>

      <div class="method-body">
        <div class="info-block mb-16">
          <h5>⚡ 學霸終極認知閉環總公式</h5>
          <div class="formula-block-wrap">
            <div class="formula-head">
              <span class="formula-tag">高階認知模型</span>
              <span class="formula-name">學霸高效記憶與解題閉環方程式</span>
            </div>
            <div class="formula-equation-row">
              <div class="formula-factor-card">
                <span class="factor-label">全域宏觀地圖</span>
                <span class="factor-expr">知識樹 + 時空雙軸</span>
                <span class="factor-desc">認知基模與空間定位</span>
              </div>
              <span class="factor-op">✕</span>
              <div class="formula-factor-card">
                <span class="factor-label">多維神經加工</span>
                <span class="factor-expr">費曼輸出 + 白紙回想 + 一題多解</span>
                <span class="factor-desc">主動提取激發 LTP 突觸固化</span>
              </div>
              <span class="factor-op">✕</span>
              <div class="formula-factor-card">
                <span class="factor-label">動態弱點消滅</span>
                <span class="factor-expr">三色錯題 + 萊特納盒</span>
                <span class="factor-desc">精準阻斷艾賓浩斯遺忘曲線</span>
              </div>
              <span class="factor-op">✕</span>
              <div class="formula-factor-card highlight-card">
                <span class="factor-label">極致單點擊穿</span>
                <span class="factor-expr">西蒙切片模組</span>
                <span class="factor-desc">組塊聚焦突破工作記憶極限</span>
              </div>
            </div>
            <div class="formula-foot">
              <span>＝ 頂尖學霸終極解題戰力與終身永久記憶</span>
            </div>
          </div>
        </div>

        <!-- 整合總覽對照表格 -->
        <div class="table-box mb-20">
          <div class="table-header">
            <span class="diagram-badge">全景矩陣</span>
            <span>9 大記憶學習法於 NChain 系統之落地功能指引</span>
          </div>
          <div class="table-responsive">
            <table class="zen-table">
              <thead>
                <tr>
                  <th>學習法名稱</th>
                  <th>核心代表名校/學霸</th>
                  <th>核心神經心理機制</th>
                  <th>對應 NChain 系統模組</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1. 三色階梯錯題本</strong></td>
                  <td>北一女中・聯考榜首</td>
                  <td>元認知校準、預測誤差學習</td>
                  <td><router-link to="/review">錯題複習中心 (ReviewView)</router-link></td>
                </tr>
                <tr>
                  <td><strong>2. 費曼輸出學習法</strong></td>
                  <td>建國中學・物理學霸</td>
                  <td>生成效應、語言網絡重構</td>
                  <td><router-link to="/flash-cards">字卡聯想自述 (FlashCardView)</router-link></td>
                </tr>
                <tr>
                  <td><strong>3. 白紙骨架回想法</strong></td>
                  <td>台大醫科・解剖生理神人</td>
                  <td>提取練習效應、突觸 LTP 固化</td>
                  <td><router-link to="/global-test">全域無提示盲測 (GlobalTestView)</router-link></td>
                </tr>
                <tr>
                  <td><strong>4. 康乃爾 5R 筆記法</strong></td>
                  <td>北一女筆記・長春藤盟校</td>
                  <td>意元集組 (Chunking)、雙碼理論</td>
                  <td><router-link to="/catalog">結構化編碼圖鑑 (CatalogView)</router-link></td>
                </tr>
                <tr>
                  <td><strong>5. 知識樹架構法</strong></td>
                  <td>台大法律・醫科國考榜首</td>
                  <td>基模理論 (Schema)、頂層加工</td>
                  <td><router-link to="/palace">記憶宮殿空間圖譜 (PalaceView)</router-link></td>
                </tr>
                <tr>
                  <td><strong>6. 萊特納間隔盒</strong></td>
                  <td>建中資優班・Anki 開發者</td>
                  <td>對抗遺忘曲線、間隔提取效應</td>
                  <td><router-link to="/flash-memory">間隔重複快速記憶 (FlashMemoryView)</router-link></td>
                </tr>
                <tr>
                  <td><strong>7. 西蒙切片莫法特</strong></td>
                  <td>諾貝爾獎西蒙・跨領域自學者</td>
                  <td>大腦皮質分區輪替、心理組塊擊穿</td>
                  <td><router-link to="/learn/1">10 組循序漸進學習 (LearnView)</router-link></td>
                </tr>
                <tr>
                  <td><strong>8. 時空雙軸套疊法</strong></td>
                  <td>北一女中・社會科榜首</td>
                  <td>位置與時間細胞協同編碼</td>
                  <td><router-link to="/palace">記憶宮殿時空樁位 (PalaceView)</router-link></td>
                </tr>
                <tr>
                  <td><strong>9. 原型母題多解法</strong></td>
                  <td>建國中學・奧賽金牌隊</td>
                  <td>深層結構基模、認知靈活性</td>
                  <td><router-link to="/number-encoder">數字雙編碼多重聯想 (NumberEncoderView)</router-link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="docs-link-card">
          <div class="docs-icon">📚</div>
          <div>
            <strong>閱讀完整深度研究論文：</strong>
            <p>本專案根目錄 <code>docs/Top_Students_Learning_and_Memory_Methods.md</code> 已收錄完整 36 組架構圖表與萬字詳盡考證，歡迎隨時參閱學習！</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Unified Method Footer Pagination (Always accessible across all 10 tabs) -->
    <div class="method-footer-pagination card mt-20">
      <div class="pagination-inner">
        <button 
          v-if="prevMethod" 
          class="btn btn-secondary nav-page-btn" 
          @click="goToMethod(prevMethod.id)"
          :title="`前往上一法：${prevMethod.shortName}`"
        >
          ⬅ 上一法：{{ prevMethod.shortName }}
        </button>
        <div v-else class="nav-page-placeholder"></div>

        <button 
          class="btn btn-secondary nav-page-btn overview-btn" 
          @click="goToMethod('overview')"
          :class="{ 'btn-primary': currentTab === 'overview' }"
          title="查看 9 大法跨系統落地整合矩陣"
        >
          🌐 9 大法整合總覽
        </button>

        <button 
          v-if="nextMethod" 
          class="btn btn-primary nav-page-btn" 
          @click="goToMethod(nextMethod.id)"
          :title="`前往下一法：${nextMethod.shortName}`"
        >
          下一法：{{ nextMethod.shortName }} ➔
        </button>
        <div v-else class="nav-page-placeholder"></div>
      </div>
    </div>

    </div> <!-- Close methods-card-area -->
    </div> <!-- Close methods-viewer-layout -->
  </div> <!-- Close top-student-methods -->
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import ReaderToolbar from './ReaderToolbar.vue';
import { soundFx } from '../utils/sound';

const currentTab = ref('error-book');
const methodsTopRef = ref<HTMLElement | null>(null);

const methodList = [
  { id: 'error-book', icon: '📝', shortName: '1. 北一女錯題本' },
  { id: 'feynman', icon: '🗣️', shortName: '2. 費曼輸出法' },
  { id: 'blank-sheet', icon: '📄', shortName: '3. 台大白紙回想' },
  { id: 'cornell', icon: '📑', shortName: '4. 康乃爾 5R' },
  { id: 'knowledge-tree', icon: '🌳', shortName: '5. 目錄知識樹' },
  { id: 'leitner', icon: '📦', shortName: '6. 萊特納間隔盒' },
  { id: 'simon-moffat', icon: '⚡', shortName: '7. 西蒙與莫法特' },
  { id: 'chrono-spatial', icon: '🗺️', shortName: '8. 時空雙軸套疊' },
  { id: 'mother-problem', icon: '🎯', shortName: '9. 原型母題多解' },
  { id: 'overview', icon: '🌐', shortName: '🌟 9 大法總覽' },
];

const currentIndex = computed(() => methodList.findIndex(m => m.id === currentTab.value));

const prevMethod = computed(() => {
  const idx = currentIndex.value;
  return idx > 0 ? methodList[idx - 1] : null;
});

const nextMethod = computed(() => {
  const idx = currentIndex.value;
  return idx >= 0 && idx < methodList.length - 1 ? methodList[idx + 1] : null;
});

const scrollToTop = () => {
  nextTick(() => {
    if (methodsTopRef.value) {
      methodsTopRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
};

const goToMethod = (id: string) => {
  soundFx.playTap();
  currentTab.value = id;
  scrollToTop();
};
</script>

<style scoped>
.top-student-methods {
  width: 100%;
}

.methods-hero {
  padding: 16px 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-light, #e0e7ff);
  color: var(--primary, #4338ca);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--border-radius-pill, 9999px);
  margin-bottom: 10px;
}

.hero-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.hero-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Nav Bar */
.methods-nav-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}

.nav-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--border-radius-pill, 9999px);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.nav-tab-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light, #eef2ff);
}

.nav-tab-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(67, 56, 202, 0.25);
}

/* Method Card */
.method-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 12px);
  padding: 24px;
  box-shadow: var(--shadow-sm, 0 4px 12px rgba(0,0,0,0.03));
}

.method-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.header-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.tag-origin {
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--primary-light, #eef2ff);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-type {
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 4px;
}

.method-header h4 {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.motto {
  font-size: 0.9rem;
  font-style: italic;
  color: var(--primary);
  margin: 0;
}

.info-block {
  background: var(--bg-secondary);
  padding: 14px 18px;
  border-radius: var(--border-radius-sm, 8px);
  border-left: 4px solid var(--primary);
}

.info-block h5 {
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.info-block p {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Diagram Container */
.diagram-box {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm, 8px);
  padding: 16px;
}

.diagram-header, .table-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
}

.diagram-badge {
  background: var(--primary);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: var(--border-radius-pill);
}

/* Flow Steps Diagram */
.flow-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 0;
}

.step-node {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 12px;
  text-align: center;
  min-width: 110px;
  flex: 1;
}

.node-icon {
  font-size: 1.5rem;
  margin-bottom: 6px;
}

.node-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.node-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.flow-arrow {
  color: var(--primary);
  font-weight: 800;
  font-size: 1.1rem;
}

/* Decision Grid */
.decision-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.decision-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}

.decision-card.highlight-card {
  border-color: #fca5a5;
  background: #fff5f5;
}

.d-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.decision-card h6 {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.decision-card p {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

/* Zen Table */
.table-box {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 16px;
}

.table-responsive {
  overflow-x: auto;
}

.zen-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.zen-table th {
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 700;
  padding: 10px 12px;
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.zen-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  line-height: 1.5;
  vertical-align: top;
}

.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}
.black-dot { background: #1e293b; }
.red-dot { background: #ef4444; }
.blue-dot { background: #3b82f6; }

/* Feynman Cycle */
.feynman-cycle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow-x: auto;
}

.cycle-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 12px;
  text-align: center;
  min-width: 110px;
  flex: 1;
}

.cycle-num {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary);
  background: var(--primary-light);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 6px;
}

.cycle-card h6 {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.cycle-card p {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.3;
  margin: 0;
}

.cycle-card.alert-card {
  border-color: #fca5a5;
  background: #fef2f2;
}

.cycle-card.success-card {
  border-color: #86efac;
  background: #f0fdf4;
}

.cycle-arrow {
  color: var(--primary);
  font-size: 1.1rem;
}

/* Neural Compare Grid */
.neural-compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.neural-pane {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.pane-passive {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.pane-active {
  background: #ecfdf5;
  border-color: #6ee7b7;
}

.pane-title {
  font-weight: 800;
  font-size: 0.82rem;
  margin-bottom: 6px;
}

.pane-flow {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Blank Sheet Mockup */
.blank-sheet-flow {
  display: flex;
  gap: 12px;
  align-items: stretch;
  overflow-x: auto;
}

.sheet-phase {
  flex: 1;
  min-width: 140px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.phase-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.phase-mockup {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 6px;
  font-family: var(--font-family-mono, monospace);
  font-size: 0.72rem;
  flex: 1;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.mock-trunk { font-weight: 800; color: var(--primary); margin-bottom: 4px; }
.mock-branches span { display: block; color: var(--text-secondary); margin-bottom: 2px; }
.mock-unknown { color: #dc2626; font-weight: 700; }
.phase-mockup.red-patch { background: #fef2f2; border: 1px dashed #ef4444; }
.mock-patch p { margin: 0 0 4px; color: #dc2626; font-weight: 600; }
.phase-foot { font-size: 0.72rem; color: var(--text-muted); text-align: center; }
.phase-arrow { display: flex; align-items: center; color: var(--primary); font-size: 1.1rem; }

/* Synapse Flow */
.synapse-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow-x: auto;
}

.synapse-step {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  min-width: 100px;
  flex: 1;
}

.synapse-step.highlight-step {
  border-color: #10b981;
  background: #f0fdf4;
}

.s-step-num {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--primary);
}

.synapse-step h6 {
  font-size: 0.8rem;
  font-weight: 700;
  margin: 4px 0 2px;
}

.synapse-step p {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin: 0;
}

.synapse-arrow {
  color: var(--primary);
  font-size: 1.1rem;
}

/* Cornell Layout */
.cornell-preview {
  background: #fff;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.8rem;
  color: #334155;
}

.cornell-top-meta {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #94a3b8;
  padding-bottom: 6px;
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 0.78rem;
}

.cornell-split {
  display: flex;
  gap: 12px;
  min-height: 140px;
}

.cornell-cues {
  flex: 3;
  border-right: 2px solid #94a3b8;
  padding-right: 10px;
}

.cornell-notes {
  flex: 7;
  padding-left: 4px;
}

.col-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 6px;
}

.cue-item {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
  font-size: 0.75rem;
}

.cue-tag {
  color: var(--primary);
  font-size: 0.7rem;
  margin-top: 10px;
}

.cornell-summary {
  border-top: 2px solid #94a3b8;
  margin-top: 8px;
  padding-top: 6px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 4px;
}

/* Tree Visual */
.tree-visual {
  background: var(--bg-card);
  padding: 12px;
  border-radius: 8px;
}

.tree-root-node {
  text-align: center;
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 14px;
  color: var(--primary);
}

.tree-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  background: var(--primary);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

.tree-branches-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.tree-branch-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
}

.branch-head {
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--text-primary);
  margin-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 4px;
}

.branch-twigs span {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 3px;
}

.branch-leaves {
  margin-top: 8px;
  font-size: 0.72rem;
  color: #b45309;
  background: #fef3c7;
  padding: 4px 6px;
  border-radius: 4px;
  line-height: 1.3;
}

.branch-converge-flow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.converge-source {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.c-leaf {
  background: var(--bg-card);
  padding: 6px 10px;
  border-radius: 6px;
  border-left: 3px solid var(--primary);
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.converge-arrow {
  color: var(--primary);
  font-weight: 800;
}

.converge-target {
  flex: 1;
  background: #f0fdf4;
  border: 1px solid #86efac;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #166534;
}

/* Leitner Box Visual */
.leitner-boxes-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  overflow-x: auto;
  padding: 8px 0;
}

.l-box {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 8px;
  text-align: center;
  min-width: 90px;
  flex: 1;
}

.l-box-head {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--primary);
}

.l-freq {
  font-size: 0.72rem;
  font-weight: 700;
  color: #d97706;
  margin: 3px 0;
}

.l-desc {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.l-box.box-5 {
  border-color: #10b981;
  background: #ecfdf5;
}

.l-transition {
  display: flex;
  flex-direction: column;
  font-size: 0.68rem;
  font-weight: 700;
  text-align: center;
}

.rule-alert {
  font-size: 0.8rem;
  color: #dc2626;
  background: #fef2f2;
  padding: 6px 12px;
  border-radius: 6px;
}

.retention-curve-mock {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.curve-item {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
}

.c-title {
  font-size: 0.8rem;
  font-weight: 800;
  display: block;
  margin-bottom: 8px;
}

.c-bar {
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 0.72rem;
}

.bar-0 { background: #e2e8f0; width: 100%; }
.bar-1 { background: #cbd5e1; width: 58%; }
.bar-2 { background: #94a3b8; width: 33%; color: #fff; }
.bar-3 { background: #fca5a5; width: 20%; color: #dc2626; }

.gbar-1 { background: #dcfce7; color: #166534; }
.gbar-2 { background: #bbf7d0; color: #166534; }
.gbar-3 { background: #86efac; color: #166534; }
.gbar-4 { background: #4ade80; color: #166534; font-weight: 700; }

/* Simon Funnel */
.simon-funnel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.funnel-layer {
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 5px solid var(--primary);
  display: flex;
  flex-direction: column;
}

.f-layer-1 { background: #e0e7ff; }
.f-layer-2 { background: #eef2ff; margin-left: 10px; }
.f-layer-3 { background: #f8fafc; margin-left: 20px; border-left-color: #f59e0b; }
.f-layer-4 { background: #ecfdf5; margin-left: 30px; border-left-color: #10b981; }

.f-title {
  font-weight: 800;
  font-size: 0.85rem;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.f-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.cortical-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow-x: auto;
}

.c-zone {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  min-width: 120px;
  flex: 1;
}

.z-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--primary);
  display: block;
  margin-bottom: 4px;
}

.c-zone h6 {
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.c-zone p {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin: 0;
}

.c-zone-arrow {
  color: var(--primary);
  font-size: 1.1rem;
}

/* Matrix Visual (Method 8) */
.matrix-visual {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow-x: auto;
}

.m-row {
  display: grid;
  grid-template-columns: 160px 1fr 1fr 1fr;
  border-bottom: 1px solid var(--border-color);
}

.m-row:last-child {
  border-bottom: none;
}

.m-head {
  background: var(--bg-secondary);
  font-weight: 800;
  font-size: 0.78rem;
}

.m-cell {
  padding: 10px;
  font-size: 0.76rem;
  border-right: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}

.m-cell:last-child {
  border-right: none;
}

.cell-label {
  background: var(--primary-light);
  color: var(--primary);
}

.matrix-link-note {
  font-size: 0.8rem;
  color: var(--primary);
  background: var(--primary-light);
  padding: 8px;
  border-radius: 6px;
}

/* Mother Tree Visual (Method 9) */
.mother-tree-visual {
  background: var(--bg-card);
  padding: 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.mother-box {
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 14px;
}

.m-badge {
  font-size: 0.7rem;
  font-weight: 800;
  background: var(--primary);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}

.mother-box h6 {
  font-size: 0.95rem;
  font-weight: 800;
  margin: 6px 0 2px;
  color: var(--primary);
}

.mother-box p {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.mother-branches {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.m-branch-col {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 8px;
}

.b-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--text-primary);
  display: block;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 4px;
}

.b-card {
  background: var(--bg-card);
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 0.74rem;
  margin-bottom: 6px;
  border-left: 3px solid var(--primary);
}

.mother-converge-foot {
  margin-top: 12px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #166534;
  text-align: center;
}

/* Formula Banner */
.formula-banner {
  background: var(--bg-card);
  padding: 12px;
  border-radius: 8px;
  border: 1px dashed var(--primary);
  font-size: 0.95rem;
  text-align: center;
  color: var(--primary);
  font-weight: 700;
  overflow-x: auto;
}

/* Formula Block Component */
.formula-block-wrap {
  background: var(--bg-card);
  border: 1.5px solid var(--primary-border, #cbd5e1);
  border-radius: var(--border-radius-md, 12px);
  padding: 16px;
  box-shadow: var(--shadow-xs);
}

.formula-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.formula-tag {
  background: var(--primary);
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: var(--border-radius-pill);
}

.formula-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-primary);
}

.formula-equation-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}

.formula-factor-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: center;
}

.formula-factor-card.highlight-card {
  border-color: var(--primary);
  background: var(--primary-light);
}

.factor-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
}

.factor-expr {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--primary);
}

.factor-desc {
  font-size: 0.68rem;
  color: var(--text-secondary);
}

.factor-op {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--text-muted);
  user-select: none;
}

.formula-foot {
  margin-top: 12px;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--success, #16a34a);
  background: var(--success-bg, #ecfdf5);
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(22, 163, 74, 0.2);
}

/* Mobile Quick Selector Bar */
.mobile-methods-dropdown-bar {
  display: none;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 8px 12px;
}

.dropdown-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.methods-dropdown-select {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xs);
  padding: 6px 10px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
}

/* Desktop TOC Sidebar & Layout */
.methods-viewer-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  width: 100%;
}

.desktop-toc-sidebar {
  display: none;
  width: 250px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

.toc-card {
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  scrollbar-width: thin;
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.toc-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-primary);
}

.toc-count {
  font-size: 0.7rem;
}

.toc-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-item-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 7px 10px;
  border-radius: var(--border-radius-xs);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
  position: relative;
  width: 100%;
}

.toc-item-btn:hover {
  background: var(--bg-secondary);
  color: var(--primary);
}

.toc-item-btn.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 800;
}

.toc-icon {
  font-size: 0.95rem;
  flex-shrink: 0;
}

.toc-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-active-marker {
  font-size: 0.6rem;
  color: var(--primary);
}

.methods-card-area {
  flex: 1;
  min-width: 0;
  width: 100%;
}

/* Method Footer Pagination */
.method-footer-pagination {
  background: var(--bg-card);
  padding: 14px 18px;
}

.pagination-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-page-btn {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: var(--border-radius-pill);
}

.nav-page-placeholder {
  width: 80px;
}

.methods-anchor-top {
  position: relative;
  top: -90px;
}

.docs-link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
  padding: 14px 18px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.docs-icon {
  font-size: 2rem;
}

.docs-link-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

/* Tips Box */
.tips-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 14px;
}

.tips-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #b45309;
  display: block;
  margin-bottom: 4px;
}

.tips-box p {
  font-size: 0.82rem;
  color: #78350f;
  margin: 0;
  line-height: 1.5;
}

/* --- Responsive Rules --- */
@media (min-width: 1024px) {
  .desktop-toc-sidebar {
    display: block;
  }
}

@media (max-width: 900px) {
  .formula-equation-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .factor-op {
    display: none;
  }
}

@media (max-width: 640px) {
  .mobile-methods-dropdown-bar {
    display: flex;
  }
  .method-card {
    padding: 14px 12px;
  }
  .pagination-inner {
    flex-direction: column;
    align-items: stretch;
  }
  .nav-page-placeholder {
    display: none;
  }
  .flow-steps, .feynman-cycle, .leitner-boxes-flow, .synapse-flow, .cortical-grid {
    flex-wrap: wrap;
    gap: 8px;
  }
  .step-node, .cycle-card, .synapse-step {
    min-width: 100%;
    flex: 1 1 100%;
  }
  .flow-arrow, .cycle-arrow, .synapse-arrow {
    transform: rotate(90deg);
    margin: 2px auto;
  }
  .neural-compare-grid, .retention-curve-mock, .mother-branches {
    grid-template-columns: 1fr;
  }
  .blank-sheet-flow {
    flex-direction: column;
  }
  .phase-arrow {
    transform: rotate(90deg);
    justify-content: center;
  }
  .cornell-split {
    flex-direction: column;
  }
  .cornell-cues {
    border-right: none;
    border-bottom: 2px solid #94a3b8;
    padding-bottom: 8px;
  }
  .m-row {
    grid-template-columns: 100px 1fr 1fr 1fr;
  }
}
</style>
