import { MnemonicItem } from '../domain/types';

export interface ExplanationDetail {
  number: string;
  keyword: string;
  logicType: '象形法 (Shape)' | '諧音法 (Phonetic)' | '結構意義法 (Structure/Semantic)';
  mnemonicCore: string;
  confusionAnalysis: string;
  sensoryVisualization: string;
  practicalUse: string;
  scientificTip: string;
}

// Canonical mnemonic vault aligned with staticItems database
const MNEMONIC_VAULT: Record<string, Omit<ExplanationDetail, 'number' | 'keyword'>> = {
  '0': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '0 的外輪廓就像一顆圓滾滾的「雞蛋」，象徵無中生有、孕育生命。',
    confusionAnalysis: '若選成「鎖鏈(00)」，注意單位的 0 是單顆雞蛋，雙位的 00 才是雙環相扣的鐵鎖鏈。',
    sensoryVisualization: '想像用手指輕敲一顆巨大的白殼雞蛋，「咔嚓」一聲，裡面流出金黃耀眼的蛋黃！',
    practicalUse: '記憶 0 樓地下室、0 度冰點、密碼第 1 位。',
    scientificTip: '象形編碼是大腦右腦最直覺的感知模式，只需 0.1 秒即可被枕葉視覺皮層辨識。'
  },
  '1': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '1 筆直挺立，如同削尖的「鉛筆」或長條蠟燭，是書寫記錄的起點。',
    confusionAnalysis: '1 為單數形碼「鉛筆」；雙位數 11 則是雙筷；14 則是鑰匙身。',
    sensoryVisualization: '想像一隻 2 公尺高的金色鉛筆，在白紙上發出沙沙的清脆書寫聲，筆尖冒著閃爍金光！',
    practicalUse: '記會議室 1 樓、第 1 名、待辦事項第 1 項。',
    scientificTip: '單純垂直線條具有大腦神經元最具方向選擇性的激活效果。'
  },
  '2': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '2 的弧形脖子與扁平底座，宛如一隻在水面上優雅划水的「鴨子」或天鵝。',
    confusionAnalysis: '2 代表鴨子；若為雙位數 22 則是鴛鴦嬉水；21 則是鱷魚咬鴨子。',
    sensoryVisualization: '閉上眼，看見一隻亮黃色的胖小鴨「嘎嘎」叫著，尾巴拍打水面濺起清涼水花！',
    practicalUse: '記 2 樓、雙向道、2 人約會、雙胞胎。',
    scientificTip: '動物圖像能刺激大腦鏡像神經元，產生擬人化情緒與親切感。'
  },
  '3': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '3 橫放如一把三齒「叉子」，豎立如耳朵或山峰，三點支撐最穩固。',
    confusionAnalysis: '單碼 3 為叉子；雙位數 33 為閃閃金光；30 為三菱標誌。',
    sensoryVisualization: '想像一把亮銀色的三齒大叉子，叉著一塊冒煙、香氣四溢的烤牛排！',
    practicalUse: '記每日 3 餐定時、三岔路口、第 3 月台。',
    scientificTip: '三角形結構是人類視覺認知中最穩固的幾何錨點。'
  },
  '4': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '4 頂部三角形與下方立柱，像極了乘風破浪的單桅「帆船」。',
    confusionAnalysis: '4 是帆船；雙位數 14 是鑰匙；24 是盒子；44 是石獅。',
    sensoryVisualization: '想像碧藍大海上，一艘白帆大帆船在金色陽光下破浪疾馳，海風吹起陣陣鹽香！',
    practicalUse: '記 4 季養生、車牌尾數 4、4 點下午茶。',
    scientificTip: '動態航行圖像能活化大腦頂葉空間運動分析區域。'
  },
  '5': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '5 上方橫木與下方彎弧，形似金屬「鉤子」或秤鉤，可懸掛萬物。',
    confusionAnalysis: '單碼 5 為鉤子；雙位數 05 為手套；15 為鸚鵡；50 為五十元硬幣。',
    sensoryVisualization: '想像一個堅固發光的鋼製鉤子，穩穩吊起了一個沉甸甸的金寶箱！',
    practicalUse: '記 5 芒星密碼、掛衣鉤位置、5 分鐘倒數計時。',
    scientificTip: '懸掛動作能在大腦中建立強烈的空間力學因果鏈。'
  },
  '6': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '6 下方圓圓的殼與上方伸出的觸角，像背著重殼慢爬的可愛「蝸牛」。',
    confusionAnalysis: '6 是蝸牛；雙碼 16 是石榴；66 是溜溜球；60 是榴槤。',
    sensoryVisualization: '想像一隻背著彩色漩渦螺旋殼的小蝸牛，在綠葉上慢吞吞滑過，留下晶瑩剔透的光痕！',
    practicalUse: '記清晨 6 點鬧鈴、慢活節奏、6 號候車亭。',
    scientificTip: '慢動作與平靜圖像有助於平緩大腦 Beta 波，進入利於記憶的 Alpha 波狀態。'
  },
  '7': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '7 上平下斜拐彎，形似聖誕紅條紋「拐杖糖」或登山手杖。',
    confusionAnalysis: '單碼 7 為拐杖糖；雙位數 07 為汽水；17 為儀器；77 為七夕。',
    sensoryVisualization: '想像你咬下一口紅白相間的薄荷拐杖糖，「喀哧」一聲，清涼甜香瞬間在舌尖爆發！',
    practicalUse: '記一週 7 天計畫、Lucky 7 幸運代碼、7 號電梯。',
    scientificTip: '味覺與嗅覺的生動想像能繞過理性防禦，直達邊緣系統長久保存。'
  },
  '8': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '8 雙圈重疊如圓潤的「葫蘆」，又象徵莫比烏斯無限符號 ∞ 與「發財」。',
    confusionAnalysis: '單碼 8 為葫蘆；雙位數 08 為泥巴；18 為腰包；88 為爸爸。',
    sensoryVisualization: '想像一個金黃色的大葫蘆，拔開木塞後，裡面噴出絢麗奪目的七彩魔法煙霧！',
    practicalUse: '記幸運數字 8、8 樓會議室、8 點上班打卡。',
    scientificTip: '對稱幾何形狀在大腦兩半球之間產生和諧的電位共振。'
  },
  '9': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '9 諧音「酒」，如同一壺香氣醇厚的陳年美酒。',
    confusionAnalysis: '單碼 9 為酒；雙位數 09 為酒瓶；19 為藥酒；99 為舅舅。',
    sensoryVisualization: '倒出一碗金黃澄澈的桂花美酒，濃郁的酒香瞬間撲鼻而來！',
    practicalUse: '記 9 月秋收、酒席宴會、品鑑排程。',
    scientificTip: '氣味記憶透過嗅球直達海馬迴，具有最強的瞬時喚醒力。'
  },
  '00': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '00 像兩個緊密相扣的鐵環，形成一條堅不可摧的「鎖鏈」，是整套記憶體系的起點。',
    confusionAnalysis: '容易與單數 0(雞蛋) 混淆。兩個 0 串在一起才是扣住萬物的鐵鎖鏈！',
    sensoryVisualization: '雙手握住冰涼沉重的鋼鐵鎖鏈，「嘩啦啦」作響，緊緊鎖住寶箱！',
    practicalUse: '記 00 點整、飯店 000 總機房、密碼前雙零。',
    scientificTip: '觸覺冷感與金屬碰撞聲雙重編碼，讓大腦形成深刻實體印象。'
  },
  '01': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '01 像一片長在枝頭上的碧綠「葉子」，葉脈如 1，輪廓如 0。',
    confusionAnalysis: '01 是葉子；10 是石頭。01 輕盈翠綠，10 沉重灰硬。',
    sensoryVisualization: '春天一片晶瑩剔透的綠葉上凝結著一顆露珠，晨光照射下折射出彩虹七彩！',
    practicalUse: '記 1 月 1 日元旦、01 號櫃檯、新生開始。',
    scientificTip: '清新生態色彩對大腦前額葉帶來放鬆專注能量。'
  },
  '02': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '02 諧音「肥鵝 (零二)」，一隻毛色白胖、搖搖擺擺的可愛大白鵝。',
    confusionAnalysis: '02 是肥鵝；20 是耳玲；22 是鴛鴦。02 是胖嘟嘟的單隻白鵝。',
    sensoryVisualization: '一隻毛茸茸的大肥鵝伸長脖子「昂昂」大叫，大搖大擺地在草地上覓食！',
    practicalUse: '記房號 02、2 月 1 日、家禽定位。',
    scientificTip: '具有豐滿體態的動物視覺容易在大腦頂葉形成鮮明立體輪廓。'
  },
  '03': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '03 展開如一把典雅的摺疊「扇子」，輕搖生風。',
    confusionAnalysis: '03 是扇子；30 是三菱。',
    sensoryVisualization: '「唰」的一聲展開一把絲絹彩繪扇子，扇面上畫著秀麗山水，徐徐微風送來清涼！',
    practicalUse: '記夏季消暑、禮品清單、03 號排隊。',
    scientificTip: '風感與扇動聲音強化大腦聽覺觸覺協同。'
  },
  '04': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '04 諧音「柿子 (零四)」，秋季枝頭飽滿甘甜的紅柿子。',
    confusionAnalysis: '04 是紅柿子；14 是鑰匙；40 是司令。',
    sensoryVisualization: '摘下一顆成熟發紅的蜜柿子，輕輕掰開，軟糯甘甜的蜜汁溢滿嘴角！',
    practicalUse: '記秋季豐收日程、4 號水果箱。',
    scientificTip: '甜美多汁的味覺刺激能激發大腦深層愉悅感。'
  },
  '05': {
    logicType: '象形法 (Shape)',
    mnemonicCore: '05 象徵五根手指張開戴著厚厚的白色「手套」。',
    confusionAnalysis: '05 是手套；50 是金屬五十元硬幣。',
    sensoryVisualization: '戴上一副雪白的棒球手套，「啪」的一聲精準接住飛馳而來的棒球！',
    practicalUse: '記 5 月份活動、五指操作指南。',
    scientificTip: '手部動作神經投射在大腦運動皮層佔有極大比例。'
  },
  '14': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '14 諧音「鑰匙 (要事 / 么四)」，長長一根帶齒的金屬開鎖工具。',
    confusionAnalysis: '與 24(盒子) 區分：14 是開鎖的金屬鑰匙；24 是用來盛裝寶物的方正盒子！',
    sensoryVisualization: '拿起一把金光燦爛的古典大鑰匙，插進古老寶庫的鎖孔中，「咔嗒」一聲大門開啟！',
    practicalUse: '記圓周率前兩位 (3.14)、防盜門密碼、重要事件備忘錄。',
    scientificTip: '「開啟未知」的期待感是刺激大腦探究驅力的核心誘因。'
  },
  '20': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '20 諧音「耳玲 (二零)」，掛在耳垂上搖曳生輝的精緻玲瓏飾品。',
    confusionAnalysis: '20 是耳玲；02 是肥鵝。20 佩戴在耳朵上。',
    sensoryVisualization: '一對紫水晶耳玲掛在耳垂上，隨著走動輕輕搖晃，在陽光下折射出耀眼紫芒！',
    practicalUse: '記 20 週年紀念、珠寶首飾整理。',
    scientificTip: '飾品微光的折射細節能強化視覺精細辨析迴路。'
  },
  '24': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '24 諧音「盒子 (兒時盒子)」，一個裝滿童年珍貴回憶與寶物的四方魔法盒子。',
    confusionAnalysis: '與 14(鑰匙) 區分：14 個位數是 4，是插進鎖孔的「鑰匙」；24 是十位數為 2 的四方「盒子」！',
    sensoryVisualization: '雙手捧起一個雕刻精美的紅木盒子，打開盒蓋，裡面竟然冒出七彩光芒與動聽音樂！',
    practicalUse: '記貴重物品收納、24 號收件盒、生日 4 月 24 日。',
    scientificTip: '收納容器具有極佳的認知「組塊」(Chunking) 功能，利於大腦打包資訊。'
  },
  '25': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '25 諧音「二胡 (二五)」，兩根弦拉出悠揚東方樂章的傳統胡琴。',
    confusionAnalysis: '25 是二胡；24 是盒子。二胡有琴弓與琴筒。',
    sensoryVisualization: '一位白袍樂師閉著雙目，手握馬尾琴弓在二胡上拉出蕩氣迴腸的優美旋律！',
    practicalUse: '記 25 歲銀禧、音樂會排程。',
    scientificTip: '音樂旋律聯想能同步活化左右大腦顳葉聽覺區。'
  },
  '30': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '30 代表「三菱 (三零)」，經典的三片菱形金鑽標誌。',
    confusionAnalysis: '30 是三菱金鑽；03 是扇子。30 具備三片菱形的金屬光澤。',
    sensoryVisualization: '三片艷紅色的菱形金剛石在空中高速旋轉，拼接在一起發出震撼的金屬嗡鳴！',
    practicalUse: '記 30 號、企業代碼、三十而立。',
    scientificTip: '對稱幾何幾何圖形極易被視覺聯合皮質快速識別。'
  },
  '40': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '40 諧音「司令 (四零)」，威風凜凜統帥三軍的大將軍。',
    confusionAnalysis: '40 是司令官；14 是鑰匙；04 是柿子。',
    sensoryVisualization: '威嚴的司令身披金色勳章軍裝，站在點將台上揮動令旗，千軍萬馬齊聲高呼！',
    practicalUse: '記軍務日程、領導決策、四十不惑。',
    scientificTip: '權威人物形象能激活大腦敬畏與高度專注感。'
  },
  '50': {
    logicType: '結構意義法 (Structure/Semantic)',
    mnemonicCore: '50 代表金光閃閃、沉甸甸的「五十元」金屬硬幣。',
    confusionAnalysis: '50 是五十元硬幣；05 是手套。50 圓形沉重帶齒邊。',
    sensoryVisualization: '一枚直徑像車輪那麼大的五十元金色硬幣從天而降，「咚」一聲砸進地面，金光四射！',
    practicalUse: '記 50% 折扣、半百壽辰、五十音記憶。',
    scientificTip: '金錢刺激是大腦中腦邊緣多巴胺系統的主要增強劑。'
  },
  '66': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '66 諧音「溜溜球 (六六)」，繩子甩出順暢旋轉的炫彩悠悠球。',
    confusionAnalysis: '66 是溜溜球；99 是舅舅。66 口訣「六六大順、順暢溜溜」。',
    sensoryVisualization: '手中甩出一個發光的雷射溜溜球，在空中做出高難度花式，在黑夜裡拉出霓虹光軌！',
    practicalUse: '記聖經 66 卷書、高速公路 Route 66、順暢無阻的通關密碼。',
    scientificTip: '高速旋轉軌跡對大腦視神經運動敏感柱細胞形成深刻追蹤路徑。'
  },
  '77': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '77 諧音「七夕 (七七)」，牛郎織女鵲橋相會、滿天星斗的浪漫節日。',
    confusionAnalysis: '77 是七夕；11 是雙筷。77 充滿星空與銀河的浪漫色調。',
    sensoryVisualization: '璀璨的銀河星空下，萬千喜鵲搭成一座拱橋，一對有情人相擁，漫天灑落璀璨金粉！',
    practicalUse: '記 7 月 7 日、結婚紀念日、浪漫約會。',
    scientificTip: '愛情與星空意象激發腦內內啡肽與多巴胺分泌。'
  },
  '80': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '80 諧音「巴黎 (八零)」，聳立著艾菲爾鐵塔的藝術與浪漫之都。',
    confusionAnalysis: '80 是巴黎鐵塔；08 是泥巴。80 宏偉高聳入雲！',
    sensoryVisualization: '站在巴黎艾菲爾鐵塔最高觀景台，俯瞰整座塞納河畔燈火輝煌的浪漫夜景！',
    practicalUse: '記 80/20 帕累托法則、法國旅行代碼、80 歲大壽。',
    scientificTip: '地標建築與高空俯瞰視角能擴展空間心智硬碟的容量界限。'
  },
  '88': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '88 諧音「爸爸 (八八)」，威嚴又溫暖的山峰般守護者。',
    confusionAnalysis: '88 是爸爸；99 是舅舅。88 是最穩固的守護定樁。',
    sensoryVisualization: '父親張開寬厚的臂膀，一把將你高高舉過頭頂，開懷大笑，陽光灑滿整個草坪！',
    practicalUse: '記 8 月 8 日父親節、大發利市代碼 888。',
    scientificTip: '親情情感連結是人類最古老且最堅韌的神經記憶基底。'
  },
  '99': {
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: '99 諧音「舅舅 (九九)」，慈祥和藹、經常帶禮物拜訪的長輩親人。',
    confusionAnalysis: '99 是舅舅；88 是爸爸；66 是溜溜球。',
    sensoryVisualization: '高大帥氣的舅舅騎著重型機車趕來，從皮外套裡掏出一個珍貴的生日禮物塞到你手裡！',
    practicalUse: '記親戚聯絡簿、長久平安、99 歲白壽。',
    scientificTip: '親屬關係的特定社會認知腦區 (mPFC) 具有高度情感記憶深度。'
  },
  '100': {
    logicType: '結構意義法 (Structure/Semantic)',
    mnemonicCore: '100 代表閃閃發光、完美無瑕的「百元大鈔」，象徵大圓滿與百分百成功。',
    confusionAnalysis: '100 是整套記憶密碼的終極巔峰，一張嶄新的百元鈔票！',
    sensoryVisualization: '手中拿著一張全新的百元大鈔，在陽光下透光看浮水印，聞到剛印出的獨特油墨芳香！',
    practicalUse: '記 100 分滿分、世紀里程碑、00-100 大圓滿閉環。',
    scientificTip: '圓滿感與成就巔峰使大腦全皮質區產生同步高頻 Gamma 腦波。'
  }
};

/**
 * Generate a comprehensive pedagogical breakdown for any question and user response
 */
export function getDetailedMnemonicExplanation(
  targetItem: MnemonicItem,
  selectedOptionValue?: string,
  allItems?: MnemonicItem[]
): ExplanationDetail {
  const num = targetItem.number;
  const canonical = targetItem.canonicalKeyword;

  // Check custom vault
  const inVault = MNEMONIC_VAULT[num];
  if (inVault) {
    let confusionAnalysis = inVault.confusionAnalysis;

    // If user selected a specific wrong option, dynamically analyze the comparison!
    if (selectedOptionValue && selectedOptionValue !== num && allItems) {
      const selectedItem = allItems.find(i => i.number === selectedOptionValue);
      if (selectedItem) {
        const selNum = selectedItem.number;
        const selKw = selectedItem.canonicalKeyword;

        const targetTens = Math.floor(targetItem.numericValue / 10);
        const selTens = Math.floor(selectedItem.numericValue / 10);
        const targetUnits = targetItem.numericValue % 10;
        const selUnits = selectedItem.numericValue % 10;

        if (targetTens === selTens) {
          confusionAnalysis = `⚠️ 混淆解析：您選擇了【${selNum} ${selKw}】。您正確鎖定了十位數「${targetTens}」，但尾數混淆了！請特別強化正解【${num} ${canonical}】的獨特外觀或動作特徵。`;
        } else if (targetUnits === selUnits) {
          confusionAnalysis = `⚠️ 混淆解析：您選擇了【${selNum} ${selKw}】。兩者尾數都是「${targetUnits}」，但開頭十位碼完全不同！請牢記正解【${num} ${canonical}】的十位數定位。`;
        } else {
          confusionAnalysis = `⚠️ 混淆解析：您選擇了【${selNum} ${selKw}】。請對比兩者畫面：正解是【${num} ${canonical}】，將這兩幅圖景在大腦中並排對比 2 秒鐘，讓突觸界線涇渭分明！`;
        }
      }
    }

    return {
      number: num,
      keyword: canonical,
      ...inVault,
      confusionAnalysis
    };
  }

  // Fallback programmatic rich breakdown for numbers not explicitly in the highlight vault
  const tens = Math.floor(targetItem.numericValue / 10);
  const units = targetItem.numericValue % 10;

  return {
    number: num,
    keyword: canonical,
    logicType: '諧音法 (Phonetic)',
    mnemonicCore: `數字【${num}】的標準記憶定樁詞為「${canonical}」。其發音與字形在中文記憶體系中具備高度辨識度。`,
    confusionAnalysis: selectedOptionValue && selectedOptionValue !== num
      ? `您選擇了干擾項，請留意【${num} ${canonical}】的十位數(${tens})與個位數(${units})組合，切勿被相近數字干擾。`
      : `注意十位數(${tens})與個位數(${units})的專屬特徵，避免與同十位或同個位的鄰近密碼混淆。`,
    sensoryVisualization: `閉上眼睛 3 秒：在腦海中想像一個巨大、色彩鮮豔、正在動態旋轉的「${canonical}」，感受它的聲音與質感！`,
    practicalUse: `生活中遇到數字【${num}】（如門牌、密碼、生日），第一時間在腦中投射出「${canonical}」的具體形象。`,
    scientificTip: `艾賓浩斯遺忘曲線原理：立即在腦中主動提取 (Active Recall) 一次，可將記憶固化率提高 300%！`
  };
}

/**
 * Format explanation for TTS natural speech
 */
export function formatExplanationForSpeech(detail: ExplanationDetail): string {
  return `正確答案是：${detail.keyword}。記憶法則：${detail.mnemonicCore}。防錯提醒：${detail.confusionAnalysis}。大腦想像：${detail.sensoryVisualization}`;
}
