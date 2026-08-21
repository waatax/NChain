<template>
  <div class="container palace-container">
    <!-- Header -->
    <div class="palace-header mb-16">
      <div class="header-badge-row mb-6">
        <span class="hanko-seal">宮殿</span>
        <span class="catalog-subtitle text-muted">空間定位法 (Method of Loci)</span>
      </div>
      <h2>{{ t('記憶宮殿大師體系') }}</h2>
      <p class="text-muted text-sm mt-4">
        古希臘羅馬演說家與世界記憶冠軍的核心技術：將「數字鎖鏈樁」植入「立體空間路徑」，打造無限容量的心智硬碟。
      </p>
    </div>

    <!-- Palace Selector Tabs -->
    <div class="palace-tabs mb-20">
      <button 
        v-for="p in palaceList" 
        :key="p.id" 
        class="palace-tab-btn" 
        :class="{ active: currentPalaceId === p.id }"
        @click="selectPalace(p.id)"
      >
        <span class="tab-icon">{{ p.icon }}</span>
        <span class="tab-name">{{ p.name }}</span>
      </button>
    </div>

    <!-- Active Palace Content -->
    <div class="card palace-main-card mb-20">
      <div class="palace-meta-bar mb-16">
        <div class="meta-title-group">
          <span class="meta-icon">{{ currentPalace.icon }}</span>
          <div>
            <h3>{{ currentPalace.name }}</h3>
            <span class="meta-sub">{{ currentPalace.subtitle }}</span>
          </div>
        </div>

        <div class="meta-actions">
          <button 
            class="btn btn-sm" 
            :class="isQuizMode ? 'btn-primary' : 'btn-secondary'"
            @click="toggleQuizMode"
          >
            {{ isQuizMode ? '📖 結束測驗' : '✍️ 宮殿隨堂測驗' }}
          </button>
        </div>
      </div>

      <!-- QUIZ MODE -->
      <div v-if="isQuizMode" class="palace-quiz-box p-16 mb-20">
        <div class="quiz-status-row mb-12">
          <span class="quiz-badge">🎯 宮殿位置抽測</span>
          <span class="quiz-score text-muted text-sm">得分：{{ quizScore }} / {{ quizTotal }}</span>
        </div>

        <div v-if="currentQuestion" class="quiz-question-card text-center p-20">
          <span class="q-label text-muted text-xs">請問此空間樁位對應的記憶內容：</span>
          <h4 class="q-title mt-8 mb-16">{{ currentQuestion.prompt }}</h4>

          <div class="quiz-options-grid mt-16">
            <button 
              v-for="(opt, idx) in currentQuestion.options" 
              :key="idx"
              class="btn quiz-opt-btn"
              :class="getOptionClass(opt)"
              :disabled="quizAnswered"
              @click="handleQuizAnswer(opt)"
            >
              {{ opt }}
            </button>
          </div>

          <div v-if="quizAnswered" class="quiz-feedback-box mt-16">
            <p :class="isCurrentCorrect ? 'text-success font-bold' : 'text-danger font-bold'">
              {{ isCurrentCorrect ? '🎉 答對了！空間神經連接增強！' : '❌ 答錯了！正確答案是：' + currentQuestion.correctAnswer }}
            </p>
            <p class="text-muted text-xs mt-4">💡 聯想秘訣：{{ currentQuestion.tip }}</p>
            <button class="btn btn-primary btn-sm mt-12" @click="nextQuizQuestion">
              下一題 👉
            </button>
          </div>
        </div>
      </div>

      <!-- READ/STUDY MODE -->
      <div v-else class="palace-study-content">
        <!-- Palace Overview Intro -->
        <div class="palace-intro-banner mb-20">
          <p class="intro-p">{{ currentPalace.description }}</p>
          <div class="principle-tags mt-8">
            <span class="principle-tag">📍 固定空間路徑</span>
            <span class="principle-tag">🔗 數字鎖鏈定樁</span>
            <span class="principle-tag">🎬 誇張動態交互</span>
          </div>
        </div>

        <!-- Section Filters -->
        <div class="section-pills mb-16" v-if="currentPalace.sections.length > 1">
          <button 
            class="section-pill-btn" 
            :class="{ active: activeSectionId === 'all' }"
            @click="activeSectionId = 'all'"
          >
            全部區域 ({{ totalLociCount }})
          </button>
          <button 
            v-for="s in currentPalace.sections" 
            :key="s.id"
            class="section-pill-btn"
            :class="{ active: activeSectionId === s.id }"
            @click="activeSectionId = s.id"
          >
            {{ s.title }} ({{ s.loci.length }})
          </button>
        </div>

        <!-- Palace Sections List -->
        <div class="palace-sections-flow">
          <div 
            v-for="section in visibleSections" 
            :key="section.id" 
            class="section-block mb-24"
          >
            <div class="section-block-header mb-12">
              <h4 class="section-title-h4">{{ section.title }}</h4>
              <span class="section-subtitle-span">{{ section.subtitle }}</span>
            </div>

            <!-- Optional Section Image -->
            <div v-if="section.image" class="section-img-wrapper mb-16">
              <img :src="getImageUrl(section.image)" :alt="section.title" class="section-img" loading="lazy" />
              <span class="img-caption">{{ section.imageCaption || section.title }}</span>
            </div>

            <!-- Loci Items Grid -->
            <div class="loci-grid">
              <div 
                v-for="locus in section.loci" 
                :key="locus.index" 
                class="locus-card"
                :class="{ 'locus-highlight': expandedLocusId === locus.index }"
                @click="toggleLocus(locus.index)"
              >
                <div class="locus-badge-col">
                  <span class="locus-index">{{ locus.index }}</span>
                  <span class="locus-peg">{{ locus.peg }}</span>
                </div>
                <div class="locus-content-col">
                  <div class="locus-top-row">
                    <span class="locus-location">📍 {{ locus.location }}</span>
                    <span class="locus-target font-bold">{{ locus.target }}</span>
                  </div>
                  <p class="locus-story mt-6">{{ locus.story }}</p>
                  <div v-if="locus.secretTip && expandedLocusId === locus.index" class="locus-secret mt-8">
                    ✨ <strong>記憶秘訣：</strong>{{ locus.secretTip }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../utils/i18n';
import { soundFx } from '../utils/sound';

const { t } = useI18n();
const baseUrl = import.meta.env.BASE_URL;
const getImageUrl = (name: string) => `${baseUrl}images/${name}`;

interface LocusItem {
  index: number | string;
  peg: string;       // e.g. "1 鉛筆"
  location: string;  // e.g. "台階"
  target: string;    // e.g. "創世記"
  story: string;     // e.g. "用鉛筆畫出上帝徒手創造的世界。"
  secretTip?: string;
}

interface PalaceSection {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  imageCaption?: string;
  loci: LocusItem[];
}

interface PalaceData {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  sections: PalaceSection[];
}

const palaceList = ref<PalaceData[]>([
  {
    id: 'bible',
    name: '聖經大教堂宮殿',
    subtitle: '舊約 39 卷 + 新約 27 卷全景記憶',
    icon: '🏰',
    description: '以莊嚴的哥德式大教堂與古羅馬街道為空間路徑，結合 1-66 號數字鎖鏈樁，將聖經 66 卷書名與分類牢牢鎖進空間坐標。',
    sections: [
      {
        id: 'ot_pentateuch',
        title: '第一區：教堂大門與入口 (摩西五經 1-5)',
        subtitle: '入口台階、青銅大門、受洗池、佈告欄、內門',
        image: 'palace_ot_sec1.jpg',
        imageCaption: '教堂入口空間樁位與摩西五經意象',
        loci: [
          { index: 1, peg: '鉛筆', location: '入口石階', target: '創世記', story: '用鉛筆在石階上畫出上帝徒手創造的世界。' },
          { index: 2, peg: '鴨子', location: '青銅大門', target: '出埃及記', story: '巨鴨頭頂金字塔，用力推開青銅大門逃出埃及。' },
          { index: 3, peg: '叉子', location: '受洗聖池', target: '利未記', story: '用叉子夾著銳利的祭壇利刃，祭司尚未做記號。' },
          { index: 4, peg: '帆船', location: '中庭佈告欄', target: '民數記', story: '一艘帆船擠滿人民，天使在欄前大聲數點人數。' },
          { index: 5, peg: '鉤子', location: '沉重內門', target: '申命記', story: '用鐵鉤鉤住軍官長袍，聽他大聲重申軍令。' }
        ]
      },
      {
        id: 'ot_history',
        title: '第二區：中殿巨柱廊 (歷史書 6-17)',
        subtitle: '第6柱至第17柱連鎖歷史迴廊',
        image: 'palace_ot_sec2.jpg',
        imageCaption: '中殿十二根巨柱與歷史書記憶樁',
        loci: [
          { index: 6, peg: '蝸牛', location: '第6根巨柱', target: '約書亞記', story: '巨大的蝸牛背著發光合約與亞洲地圖書爬上柱頂。' },
          { index: 7, peg: '拐杖糖', location: '第7根巨柱', target: '士師記', story: '用拐杖糖敲醒沉睡的勇士，聽從軍師指揮佈陣。' },
          { index: 8, peg: '葫蘆', location: '第8根巨柱', target: '路得記', story: '把金色葫蘆丟在金色大道上，幸運拾得金幣。' },
          { index: 9, peg: '酒', location: '第9根巨柱', target: '撒母耳記上', story: '醉酒的母親撒下種子，長出巨大耳朵向上升起。' },
          { index: 10, peg: '石頭', location: '第10根巨柱', target: '撒母耳記下', story: '將石頭砸向耳朵，沉重墜落到下方。' },
          { index: 11, peg: '筷子', location: '第11根巨柱', target: '列王紀上', story: '國王手拿黃金筷子排成一列走上王位。' },
          { index: 12, peg: '嬰兒', location: '第12根巨柱', target: '列王紀下', story: '嬰兒調皮將排成一列的國王推滾下台階。' },
          { index: 13, peg: '醫生', location: '第13根巨柱', target: '歷代志上', story: '醫生看著歷代偉人的傳記日誌掛在上方。' },
          { index: 14, peg: '鑰匙', location: '第14根巨柱', target: '歷代志下', story: '用金鑰匙挖出埋在下方泥土裡的歷代日誌。' },
          { index: 15, peg: '鸚鵡', location: '第15根巨柱', target: '以斯拉記', story: '鸚鵡用嘴巴以極快速度撕紙並用力拉開。' },
          { index: 16, peg: '石榴', location: '第16根巨柱', target: '尼希米記', story: '工人們吃著石榴，用泥巴懷抱希望砌牆吃白米。' },
          { index: 17, peg: '儀器', location: '第17根巨柱', target: '以斯帖記', story: '用精密儀器將以膠水撕破的喜帖重新黏合。' }
        ]
      },
      {
        id: 'ot_poetry',
        title: '第三區：彩繪玻璃與唱詩班 (詩歌智慧書 18-22)',
        subtitle: '天光透射的五扇彩繪玻璃窗與中央樂隊席',
        image: 'palace_ot_sec3.jpg',
        imageCaption: '彩繪玻璃與詩歌智慧書意象',
        loci: [
          { index: 18, peg: '腰包', location: '第1扇彩繪窗', target: '約伯記', story: '戴腰包的伯伯在窗前簽署神聖約定。' },
          { index: 19, peg: '藥酒', location: '第2扇彩繪窗', target: '詩篇', story: '大衛喝下藥酒，彈奏豎琴朗誦詩篇。' },
          { index: 20, peg: '耳玲', location: '第3扇彩繪窗', target: '箴言', story: '掛滿耳玲的玻璃插著刻滿智慧真言的鋼針。' },
          { index: 21, peg: '鱷魚', location: '唱詩班指揮台', target: '傳道書', story: '優雅的鱷魚指揮拿著大書傳授正宗道理。' },
          { index: 22, peg: '鴛鴦', location: '管風琴唱詩席', target: '雅歌', story: '一對鴛鴦穿著典雅長袍合唱動聽的雅歌。' }
        ]
      },
      {
        id: 'nt_gospels',
        title: '第四區：羅馬城門與市集 (新約福音書與書信 40-50)',
        subtitle: '古羅馬城門、大幹道與繁華商鋪',
        image: 'palace_nt_sec1.jpg',
        imageCaption: '古羅馬城門與福音書記憶樁',
        loci: [
          { index: 40, peg: '司令', location: '城門左大柱', target: '馬太福音', story: '司令騎在駿馬上戴著墨鏡，嫌太陽太大。' },
          { index: 41, peg: '死魚', location: '城門右大柱', target: '馬可福音', story: '司令拿死魚餵給喝可樂的駿馬。' },
          { index: 42, peg: '死鵝', location: '青石大道', target: '路加福音', story: '死鵝躺在路面，工人不斷加水泥掩埋。' },
          { index: 43, peg: '石山', location: '城門檢查哨', target: '約翰福音', story: '守衛站在石山上用羽翰筆簽訂盟約。' },
          { index: 44, peg: '石獅', location: '中央大馬路', target: '使徒行傳', story: '巨大的石獅載著使徒急行傳播好消息。' },
          { index: 45, peg: '師傅', location: '第1店(馬具行)', target: '羅馬書', story: '皮匠師傅用大羅網捕獲一匹羅馬烈馬。' }
        ]
      }
    ]
  },
  {
    id: 'elements',
    name: '量子實驗室宮殿',
    subtitle: '化學元素週期表 1-30+ 與物理常數',
    icon: '⚛️',
    description: '以現代化的高能物理實驗室為藍圖，從防護閘門、加速器到超導控制室，將元素序號與重要物理常數化為空間樁位。',
    sections: [
      {
        id: 'elem_1_10',
        title: '前沿主控區：元素週期表 1-10 號',
        subtitle: '防護閘門、主控台、粒子探測器',
        loci: [
          { index: 1, peg: '鉛筆', location: '防護閘門門把', target: '氫 (H, 1)', story: '用鉛筆戳破飄浮的發光氫氣球，發出清脆爆鳴。' },
          { index: 2, peg: '鴨子', location: '主控電腦螢幕', target: '氦 (He, 2)', story: '一隻鴨子吸了氦氣，用尖銳娃娃音下達發射指令。' },
          { index: 3, peg: '叉子', location: '緊急斷電箱', target: '鋰 (Li, 3)', story: '用金屬叉子戳向鋰電池，冒出炫目藍紫色電弧。' },
          { index: 4, peg: '帆船', location: '冷卻液水箱', target: '鈹 (Be, 4)', story: '一艘帆船載著珍貴的綠寶石鈹礦石破浪前進。' },
          { index: 5, peg: '鉤子', location: '通風管道頂部', target: '硼 (B, 5)', story: '用大鐵鉤吊起高強度硼纖維大棚遮蔽輻射。' },
          { index: 6, peg: '蝸牛', location: '鑽石展示玻璃櫃', target: '碳 (C, 6)', story: '慢吞吞的蝸牛爬在黑石墨與璀璨碳鑽石之間。' },
          { index: 7, peg: '拐杖糖', location: '超低溫液氮罐', target: '氮 (N, 7)', story: '用拐杖糖沾取零下196度液氮，瞬間凍成冰脆糖棍。' },
          { index: 8, peg: '葫蘆', location: '急救氧氣呼吸面罩', target: '氧 (O, 8)', story: '打開金色葫蘆，噴出純淨濃縮氧氣點亮火苗。' },
          { index: 9, peg: '酒', location: '牙科氟化物消毒櫃', target: '氟 (F, 9)', story: '用高級藥酒調配含氟牙膏塗抹防蛀。' },
          { index: 10, peg: '石頭', location: '霓虹實驗室招牌', target: '氖 (Ne, 10)', story: '將發光石頭塞入霓虹燈管，散發迷人橙紅色輝光。' }
        ]
      },
      {
        id: 'constants_sec',
        title: '核心反應爐：世界頂級物理常數',
        subtitle: '真空腔體、量子天平、光纖矩陣',
        loci: [
          { index: 'c', peg: '光速', location: '環形光纖迴路', target: '299,792,458 m/s', story: '光子在環形光纖以宇宙極限速度奔馳，每秒繞地球七圈半。' },
          { index: 'h', peg: '普朗克', location: '奇寶超導天平', target: '6.626 × 10⁻³⁴ J·s', story: '量子天平微調最後一份能量量子台階，精確錨定一公斤。' },
          { index: 'e', peg: '基本電荷', location: '密立根油滴儀', target: '1.602 × 10⁻¹⁹ C', story: '帶電油滴懸浮在電場中，精準展現電荷量子化。' }
        ]
      }
    ]
  },
  {
    id: 'history',
    name: '時空歷史迴廊宮殿',
    subtitle: '中國朝代紀年、世界七大奇蹟與圓周率 100 位',
    icon: '🏛️',
    description: '穿越千年時空長廊，從古代文明遺跡到數學超越常數，透過宏大的歷史廊柱將漫長的時間序列轉化為清晰的地點順序。',
    sections: [
      {
        id: 'dynasty_sec',
        title: '朝代之門：歷史朝代演進樁',
        subtitle: '青銅巨鼎、烽火台、未央宮',
        loci: [
          { index: 1, peg: '夏商周', location: '青銅大鼎前', target: '夏、商、西周、東周 (春秋戰國)', story: '大鼎上刻著夏日商船駛過周王朝的烽火台。' },
          { index: 2, peg: '秦漢', location: '萬里長城烽火台', target: '秦朝、西漢、東漢', story: '秦始皇站在烽火台，手握漢朝玉璽統一天下。' },
          { index: 3, peg: '三國晉南北', location: '三國戰船連環塢', target: '三國、西晉、東晉、南北朝', story: '三國戰船並排挺進，晉升為南北雙向艦隊。' },
          { index: 4, peg: '隋唐五代宋', location: '大雁塔鐘樓', target: '隋、唐、五代十國、宋朝', story: '在大雁塔隨手唐詩一首，換來五代宋瓷一壺。' },
          { index: 5, peg: '元明清', location: '紫禁城太和殿', target: '元朝、明朝、清朝', story: '蒙古鐵騎穿過明代城牆，迎向清朝琉璃瓦。' }
        ]
      },
      {
        id: 'pi_sec',
        title: '幾何聖殿：圓周率前 30 位宮殿樁',
        subtitle: '3. 14 15 92 65 35 89 79 32 38 46',
        loci: [
          { index: 'π-1', peg: '14 15', location: '圓拱大門', target: '鑰匙 (14) + 鸚鵡 (15)', story: '用金鑰匙打開鳥籠，飛出一隻聰明的鸚鵡。' },
          { index: 'π-2', peg: '92 65', location: '幾何中庭', target: '球兒 (92) + 老虎 (65)', story: '彩色球兒滾過地面，引來一隻兇猛的老虎撲咬。' },
          { index: 'π-3', peg: '35 89', location: '噴泉水池', target: '珊瑚 (35) + 芭比 (89)', story: '粉紅珊瑚叢中坐著一位優雅的芭比娃娃。' },
          { index: 'π-4', peg: '79 32', location: '迴廊雕像', target: '吃酒 (79) + 傘兒 (32)', story: '一邊吃著美酒，一邊撐起精緻的小花傘兒避雨。' }
        ]
      }
    ]
  },
  {
    id: 'daily',
    name: '居家隨身宮殿',
    subtitle: '客廳、廚房、臥室 5 步速成定位法',
    icon: '🏠',
    description: '每個人最熟悉的私人空間！隨時隨地用自家客廳與臥室定位 10-20 個臨時記憶點，瞬間搞定演講提綱、購物清單、考試考點。',
    sections: [
      {
        id: 'living_room',
        title: '客廳 5 步標準路線',
        subtitle: '玄關門把 ➔ 鞋櫃 ➔ 沙發 ➔ 茶几 ➔ 電視機',
        loci: [
          { index: 1, location: '玄關門把', peg: '第1樁', target: '開場核心觀點 / 必買第1項', story: '想像門把上掛著巨大的標誌物，一開門就被撞擊提醒。' },
          { index: 2, location: '實木鞋櫃', peg: '第2樁', target: '背景論據 / 必買第2項', story: '鞋櫃頂部擺滿了與論據強烈相關的模型或物品。' },
          { index: 3, location: '真皮沙發', peg: '第3樁', target: '關鍵數據 / 必買第3項', story: '沙發上坐著象徵數據的人形玩偶正在大聲朗讀。' },
          { index: 4, location: '玻璃茶几', peg: '第4樁', target: '轉折案例 / 必買第4項', story: '茶几中央放著正在播放案例畫面的立體投影燈。' },
          { index: 5, location: '大螢幕電視', peg: '第5樁', target: '結論與行動號召', story: '電視螢幕亮起金色大字，給出強而有力的結尾號召！' }
        ]
      }
    ]
  }
]);

const currentPalaceId = ref<string>('bible');
const activeSectionId = ref<string>('all');
const expandedLocusId = ref<number | string | null>(null);

const currentPalace = computed(() => {
  return palaceList.value.find(p => p.id === currentPalaceId.value) || palaceList.value[0];
});

const selectPalace = (id: string) => {
  soundFx.playTap();
  currentPalaceId.value = id;
  activeSectionId.value = 'all';
  expandedLocusId.value = null;
  if (isQuizMode.value) {
    generateQuizQuestion();
  }
};

const totalLociCount = computed(() => {
  return currentPalace.value.sections.reduce((acc, s) => acc + s.loci.length, 0);
});

const visibleSections = computed(() => {
  if (activeSectionId.value === 'all') {
    return currentPalace.value.sections;
  }
  return currentPalace.value.sections.filter(s => s.id === activeSectionId.value);
});

const toggleLocus = (id: number | string) => {
  soundFx.playTap();
  expandedLocusId.value = expandedLocusId.value === id ? null : id;
};

// ================= QUIZ MODE LOGIC =================
const isQuizMode = ref(false);
const quizScore = ref(0);
const quizTotal = ref(0);
const quizAnswered = ref(false);
const isCurrentCorrect = ref(false);
const selectedAnswer = ref<string | null>(null);

interface QuizQuestion {
  prompt: string;
  correctAnswer: string;
  options: string[];
  tip: string;
}

const currentQuestion = ref<QuizQuestion | null>(null);

const toggleQuizMode = () => {
  soundFx.playTap();
  isQuizMode.value = !isQuizMode.value;
  if (isQuizMode.value) {
    quizScore.value = 0;
    quizTotal.value = 0;
    generateQuizQuestion();
  }
};

const generateQuizQuestion = () => {
  quizAnswered.value = false;
  selectedAnswer.value = null;
  
  // Collect all loci in current palace
  const allLoci = currentPalace.value.sections.flatMap(s => s.loci);
  if (allLoci.length < 2) return;

  const targetLocus = allLoci[Math.floor(Math.random() * allLoci.length)];
  
  // Pick 3 random wrong options
  const otherTargets = allLoci.filter(l => l.target !== targetLocus.target).map(l => l.target);
  const shuffledOthers = [...new Set(otherTargets)].sort(() => Math.random() - 0.5).slice(0, 3);
  
  const options = [targetLocus.target, ...shuffledOthers].sort(() => Math.random() - 0.5);

  currentQuestion.value = {
    prompt: `【${currentPalace.value.name}】第 ${targetLocus.index} 樁 (${targetLocus.location} / 樁名: ${targetLocus.peg})`,
    correctAnswer: targetLocus.target,
    options,
    tip: targetLocus.story
  };
};

const handleQuizAnswer = (option: string) => {
  if (quizAnswered.value || !currentQuestion.value) return;
  quizAnswered.value = true;
  selectedAnswer.value = option;
  quizTotal.value++;
  
  if (option === currentQuestion.value.correctAnswer) {
    isCurrentCorrect.value = true;
    quizScore.value++;
    soundFx.playSuccess();
  } else {
    isCurrentCorrect.value = false;
    soundFx.playError();
  }
};

const nextQuizQuestion = () => {
  soundFx.playTap();
  generateQuizQuestion();
};

const getOptionClass = (opt: string) => {
  if (!quizAnswered.value) {
    return 'btn-secondary';
  }
  if (opt === currentQuestion.value?.correctAnswer) {
    return 'btn-success-opt';
  }
  if (opt === selectedAnswer.value) {
    return 'btn-danger-opt';
  }
  return 'btn-secondary opacity-50';
};
</script>

<style scoped>
.palace-container {
  padding-bottom: 80px;
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

.palace-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.palace-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 8px);
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.palace-tab-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.palace-tab-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.palace-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 12px;
}

.meta-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-icon {
  font-size: 1.8rem;
}

.meta-title-group h3 {
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
}

.meta-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
}

.palace-intro-banner {
  background: var(--bg-secondary);
  padding: 14px;
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
}

.intro-p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.principle-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.principle-tag {
  font-size: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  color: var(--primary);
}

.section-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.section-pill-btn {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
}

.section-pill-btn.active {
  background: var(--accent-gold, #f59e0b);
  color: #ffffff;
  border-color: var(--accent-gold, #f59e0b);
}

.section-title-h4 {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--primary);
  margin: 0;
}

.section-subtitle-span {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
  margin-top: 2px;
}

.section-img-wrapper {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: var(--border-radius-md, 8px);
  text-align: center;
  border: 1px solid var(--border-color);
}

.section-img {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 6px;
}

.img-caption {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 6px;
}

.loci-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 640px) {
  .loci-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.locus-card {
  display: flex;
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 8px);
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.locus-card:hover {
  border-color: var(--primary-light, #93c5fd);
  background: var(--bg-secondary);
}

.locus-highlight {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.locus-badge-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 4px;
}

.locus-index {
  font-size: 1rem;
  font-weight: 900;
  color: var(--primary);
  font-family: var(--font-family-serif);
}

.locus-peg {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.1;
}

.locus-content-col {
  flex: 1;
}

.locus-top-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.locus-location {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.locus-target {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.locus-story {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-secondary);
  margin: 0;
}

.locus-secret {
  font-size: 0.8rem;
  background: var(--bg-secondary);
  padding: 6px 10px;
  border-radius: 4px;
  border-left: 3px solid var(--accent-gold);
}

/* Quiz mode styles */
.palace-quiz-box {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
}

.quiz-badge {
  background: var(--primary);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
}

.quiz-question-card {
  background: var(--bg-card);
  border-radius: var(--border-radius-md, 8px);
  border: 1px solid var(--border-color);
}

.q-title {
  font-size: 1.15rem;
  color: var(--primary);
}

.quiz-options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 500px) {
  .quiz-options-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.quiz-opt-btn {
  padding: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
}

.btn-success-opt {
  background: #10b981 !important;
  color: white !important;
  border-color: #10b981 !important;
}

.btn-danger-opt {
  background: #ef4444 !important;
  color: white !important;
  border-color: #ef4444 !important;
}

.opacity-50 {
  opacity: 0.5;
}
</style>
