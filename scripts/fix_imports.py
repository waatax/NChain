import os
import re
import subprocess

VIEWS_DIR = "apps/web/src/views"

# Revert views to start from clean state
print("Reverting Vue views in git to start clean...")
subprocess.run(["git", "checkout", "apps/web/src/views/"], check=True)

# Replacements to apply ONLY within the <template> section (no overlap issues)
template_replacements = {
    "NotFoundView.vue": [
        ("<h2>404 - 找不到頁面</h2>", "<h2>404 - {{ t('找不到頁面') }}</h2>"),
        ("<p class=\"text-muted mt-8\">您訪問的頁面不存在或已被移動。</p>", "<p class=\"text-muted mt-8\">{{ t('您訪問的頁面不存在或已被移動。') }}</p>"),
        ("<router-link to=\"/\" class=\"btn btn-primary mt-16\">返回主頁</router-link>", "<router-link to=\"/\" class=\"btn btn-primary mt-16\">{{ t('返回主頁') }}</router-link>"),
    ],
    
    "AboutView.vue": [
        ("<h2>關於 數字鎖鏈 NChain</h2>", "<h2>{{ t('關於 NChain 數字鎖鏈記憶學習應用程式') }}</h2>"),
        ("<p class=\"text-muted mt-4\">版本 1.0.0 (離線 Web App)</p>", "<p class=\"text-muted mt-4\">{{ t('版本資訊') }} 1.0.0 ({{ t('離線模式') }})</p>"),
        ("<h3>💡 什麼是數字鎖鏈記憶法？</h3>", "<h3>💡 {{ t('什麼是數字鎖鏈記憶法？') }}</h3>"),
        ("數字鎖鏈（Number Chain）是一種經典的記憶宮殿聯想記憶法。藉由將 00 到 100 每個數字轉換成具體的「密碼物件」\n          (例如 00=鎖鏈, 01=葉子, 02=肥鵝)，並將相鄰的兩個物件用「動態、誇張、色彩鮮明、不合常理」的畫面扣連在一起，\n          形成一條視覺鏈結，使你能夠在腦袋裡像看電影一樣，快速地順背、倒背，甚至是抽背整串數字。",
         "{{ t('數字鎖鏈是一種利用「諧音聯想」與「圖像故事」將抽象數字轉化為具體畫面，並透過鏈結方式記憶超長數字的記憶法。') }}\n          {{ t('本應用程式專為提供結構化關卡、Leitner 間隔複習卡片，以及各類輔助訓練工具而設計，幫助您快速精熟 00-100 的數字聯想。') }}"),
        ("<h3>🔒 隱私與資料安全性說明</h3>", "<h3>🔒 {{ t('隱私與資料安全性說明') }}</h3>"),
        ("本應用程式為<strong>純本機應用 (Local-First Web App)</strong>：", "{{ t('本應用程式為') }}<strong>{{ t('純本機應用 (Local-First Web App)') }}</strong>："),
        ("我們的伺服器<strong>不收集、不儲存</strong>您的任何學習數據或作答歷史。", "{{ t('我們的伺服器不收集、不儲存您的任何學習數據或作答歷史。') }}"),
        ("您的所有進度、複習卡片排程、錯題統計等資訊，均安全地儲存在您的瀏覽器內部資料庫 (IndexedDB) 中。", "{{ t('您的所有進度、複習卡片排程、錯題統計等資訊，均安全地儲存在您的瀏覽器內部資料庫 (IndexedDB) 中。') }}"),
        ("您可以在「設定」頁面中，隨時將您的學習數據匯出為 JSON 備份檔，或清除所有本機進度。", "{{ t('您可以在「設定」頁面中，隨時將您的學習數據匯出為 JSON 備份檔，或清除所有本機進度。') }}"),
        ("<router-link to=\"/\" class=\"btn btn-secondary w-full\">返回首頁</router-link>", "<router-link to=\"/\" class=\"btn btn-secondary w-full\">{{ t('返回首頁') }}</router-link>"),
    ],

    "OfflineView.vue": [
        ("<h2>離線包下載管理</h2>", "<h2>{{ t('離線包下載管理') }}</h2>"),
        ("<p class=\"text-muted\">下載個別課程的圖片包，即可在無網路環境 (飛航模式) 瀏覽想像畫面</p>", "<p class=\"text-muted\">{{ t('下載個別課程的圖片包，即可在無網路環境 (飛航模式) 瀏覽想像畫面') }}</p>"),
        ("<span>裝置剩餘空間可用：</span>", "<span>{{ t('裝置剩餘空間可用：') }}</span>"),
        ("<span>已使用空間：</span>", "<span>{{ t('已使用空間：') }}</span>"),
        ("圖片數量: {{ l.sceneIds.length }} 張 | 預估容量: {{ (l.sceneIds.length * 150 / 1024).toFixed(1) }} MB", "{{ t('圖片數量:') }} {{ l.sceneIds.length }} {{ t('張') }} | {{ t('預估容量:') }} {{ (l.sceneIds.length * 150 / 1024).toFixed(1) }} MB"),
        ("<span class=\"badge-success\">✓ 已下載</span>", "<span class=\"badge-success\">✓ {{ t('已下載') }}</span>"),
        ("📥 下載", "📥 {{ t('下載') }}"),
    ],

    "ReviewView.vue": [
        ("<h2>⏳ Spaced Repetition 間隔複習 (選擇題模式)</h2>", "<h2>⏳ {{ t('Spaced Repetition 間隔複習 (選擇題模式)') }}</h2>"),
        ("<p class=\"text-muted\">自動篩選到期的複習卡片，以選擇題方式快速複習</p>", "<p class=\"text-muted\">{{ t('自動篩選到期的複習卡片，以選擇題方式快速複習') }}</p>"),
        ("<h3>太棒了！</h3>", "<h3>{{ t('太棒了！') }}</h3>"),
        ("<p class=\"text-muted mt-8\">目前沒有任何到期的複習字卡，請明天再來！</p>", "<p class=\"text-muted mt-8\">{{ t('目前沒有任何到期的複習字卡，請明天再來！') }}</p>"),
        ("<router-link to=\"/\" class=\"btn btn-primary mt-16\">返回首頁</router-link>", "<router-link to=\"/\" class=\"btn btn-primary mt-16\">{{ t('返回首頁') }}</router-link>"),
        ("剩餘待複習: {{ dueCards.length }} 題 | 當前卡箱: 箱 {{ currentCard.box }}", "{{ t('剩餘待複習:') }} {{ dueCards.length }} {{ t('題') }} | {{ t('當前卡箱:') }} {{ t('箱') }} {{ currentCard.box }}"),
        ("<p class=\"cloze-title text-muted mb-8\" style=\"font-size: 0.85rem; font-weight: 700;\">請回想空缺的記憶詞：</p>", "<p class=\"cloze-title text-muted mb-8\" style=\"font-size: 0.85rem; font-weight: 700;\">{{ t('請回想空缺的記憶詞：') }}</p>"),
        ("<span class=\"fb-title\">{{ isCorrect ? '答對了！' : '答錯了！' }}</span>", "<span class=\"fb-title\">{{ isCorrect ? t('答案正確！') : t('答案錯誤，正確答案是：') }}</span>"),
        ("正確答案是:", "{{ t('正確答案是:') }}"),
        ("<span class=\"hint-label\">💡 聯想畫面提示：</span>", "<span class=\"hint-label\">💡 {{ t('聯想畫面提示：') }}</span>"),
        ("<span class=\"hint-label\">💡 完整故事上下文：</span>", "<span class=\"hint-label\">💡 {{ t('完整故事上下文：') }}</span>"),
        ("下一題 ➡️", "{{ t('下一題 ➡️') }}"),
    ],

    "DashboardView.vue": [
        ("<h2>學習概覽</h2>", "<h2>{{ t('學習概覽') }}</h2>"),
        ("<span class=\"stat-label\">已學習數字</span>", "<span class=\"stat-label\">{{ t('已學習數字') }}</span>"),
        ("<span class=\"stat-label\">待複習卡片</span>", "<span class=\"stat-label\">{{ t('待複習卡片') }}</span>"),
        ("<span class=\"stat-label\">精熟數字</span>", "<span class=\"stat-label\">{{ t('精熟數字') }}</span>"),
        ("⏳ 複習 ({{ appStore.dueCardCount }} 題)", "⏳ {{ t('複習') }} ({{ appStore.dueCardCount }} {{ t('題') }})"),
        ("✍️ 測驗", "✍️ {{ t('測驗') }}"),
        ("🃏 卡牌", "🃏 {{ t('卡牌') }}"),
        ("⚡ 閃卡記憶", "⚡ {{ t('閃卡記憶') }}"),
        ("📊 學習概覽", "📊 {{ t('學習概覽') }}"),
        ("🔗 數字編碼", "🔗 {{ t('數字編碼') }}"),
        ("📐 科學常數", "📐 {{ t('科學常數') }}"),
        ("📈 學習進度", "📈 {{ t('學習進度') }}"),
        ("學習關卡", "{{ t('學習關卡') }}"),
        ("<span class=\"legend-label\">已學習</span>", "<span class=\"legend-label\">{{ t('已學習') }}</span>"),
        ("<span class=\"legend-label\">未學習</span>", "<span class=\"legend-label\">{{ t('未學習') }}</span>"),
        ("<span class=\"legend-label\">複習中</span>", "<span class=\"legend-label\">{{ t('複習中') }}</span>"),
        ("<span class=\"legend-label\">已精熟</span>", "<span class=\"legend-label\">{{ t('已精熟') }}</span>"),
        ("開始學習", "{{ t('開始學習') }}"),
        ("繼續學習", "{{ t('繼續學習') }}"),
        ("進入測驗", "{{ t('進入測驗') }}"),
        ("配對式故事學習", "{{ t('配對式故事學習') }}"),
        ("連續劇本故事學習", "{{ t('連續劇本故事學習') }}"),
        ("自訂聯想", "{{ t('自訂聯想') }}"),
        ("操作", "{{ t('操作') }}"),
        ("編輯", "{{ t('編輯') }}"),
        ("常數名稱", "{{ t('常數名稱') }}"),
        ("數值", "{{ t('數值') }}"),
        ("編碼解析", "{{ t('編碼解析') }}"),
        ("無相符的編碼組合", "{{ t('無相符的編碼組合') }}"),
        ("請輸入 2 位以上的數字進行編碼聯想", "{{ t('請輸入 2 位以上的數字進行編碼聯想') }}"),
        ("自訂別名與備忘", "{{ t('自訂別名與備忘') }}"),
        ("自訂", "{{ t('自訂') }}"),
        ("暫無自訂別名", "{{ t('暫無自訂別名') }}"),
        ("未精熟", "{{ t('未精熟') }}"),
        ("符號", "{{ t('符號') }}"),
        ("記憶故事", "{{ t('記憶故事') }}"),
        ("沒有符合的常數", "{{ t('沒有符合的常數') }}"),
        ("請輸入常數名稱、數值或符號進行搜尋", "{{ t('請輸入常數名稱、數值或符號進行搜尋') }}"),
        ("l.mode === 'pair' ? '配對' : '劇本'", "l.mode === 'pair' ? t('配對') : t('劇本')"),
        ("數字範圍:", "t('數字') + '範圍:'"),
        ("精密數值", "t('精密數值')"),
        ("精密常數值", "t('精密常數值')"),
        ("{{ selectedConstant.tagline }}", "{{ t(selectedConstant.tagline) }}"),
        ("{{ selectedConstant.essence }}", "{{ t(selectedConstant.essence) }}"),
        ("{{ selectedConstant.derivationNote }}", "{{ t(selectedConstant.derivationNote) }}"),
    ],

    "CatalogView.vue": [
        ("<h2>00–100 記憶關鍵字圖鑑</h2>", "<h2>{{ t('00–100 記憶關鍵字圖鑑') }}</h2>"),
        ("<p class=\"text-muted\">點擊卡片查看在故事或場景中的出現位置</p>", "<p class=\"text-muted\">{{ t('點擊卡片查看在故事或場景中的出現位置') }}</p>"),
        ("placeholder=\"搜尋數字、關鍵字或別名...\"", ":placeholder=\"t('搜尋數字、關鍵字或別名...')\""),
        ("排列列數：", "{{ t('排列列數：') }}"),
        ("{{ col }} 列", "{{ col }} {{ t('列') }}"),
        ("<p>找不到符合的數字或關鍵字 😢</p>", "<p>{{ t('找不到符合的數字或關鍵字 😢') }}</p>"),
        ("<h3>數字 【{{ selectedItem.number }}】 記憶詳情</h3>", "<h3>{{ t('數字') }} 【{{ selectedItem.number }}】 {{ t('記憶詳情') }}</h3>"),
        ("<span class=\"control-label\">自訂別名 (選填，多個以逗號分隔)</span>", "<span class=\"control-label\">{{ t('自訂別名 (選填，多個以逗號分隔)') }}</span>"),
        ("<span class=\"control-label\">自訂記憶備忘錄 (選填)</span>", "<span class=\"control-label\">{{ t('自訂記憶備忘錄 (選填)') }}</span>"),
        ("儲存", "{{ t('儲存') }}"),
        ("取消", "{{ t('取消') }}"),
        ("主關鍵字：", "{{ t('主關鍵字：') }}"),
        ("故事別名：", "{{ t('故事別名：') }}"),
        ("課程歸屬：", "{{ t('課程歸屬：') }}"),
        ("出現在以下場景故事中：", "{{ t('出現在以下場景故事中：') }}"),
    ],

    "LearnView.vue": [
        ("關卡學習：", "{{ t('學習關卡：') }}"),
        ("返回概覽", "{{ t('返回概覽') }}"),
        ("配對故事學習", "{{ t('配對故事學習') }}"),
        ("連續劇本學習", "{{ t('連續劇本學習') }}"),
        ("👁️ 啟用盲背模式 (點擊遮罩揭露關鍵字)", "👁️ {{ t('👁️ 啟用盲背模式 (點擊遮罩揭露關鍵字)') }}"),
        ("劇本插圖", "{{ t('劇本插圖') }}"),
        ("下一幕", "{{ t('下一幕') }}"),
        ("查看故事總結", "{{ t('查看故事總結') }}"),
        ("上一步", "{{ t('上一步') }}"),
        ("下一步", "{{ t('下一步') }}"),
        ("恭喜完成本課學習！", "{{ t('恭喜完成本課學習！') }}"),
        ("以下是本課所有數字的聯想關鍵字與配對故事總結，您可以隨時進入測驗來強化記憶。", "{{ t('以下是本課所有數字的聯想關鍵字與配對故事總結，您可以隨時進入測驗來強化記憶。') }}"),
        ("開始進行本課測驗", "{{ t('開始進行本課測驗') }}"),
        ("我已記住，回到概覽", "{{ t('我已記住，回到概覽') }}"),
        ("配對關係", "{{ t('配對關係') }}"),
        ("聯想畫面", "{{ t('聯想畫面') }}"),
        ("故事重點", "{{ t('故事重點') }}"),
        ("故事回顧", "{{ t('故事回顧') }}"),
        ("記憶小撇步", "{{ t('記憶小撇步') }}"),
    ],

    "QuizView.vue": [
        ("關卡測驗：", "{{ t('關卡測驗：') }}"),
        ("離開測驗", "{{ t('離開測驗') }}"),
        ("第 {{ currentQuestionIndex + 1 }} 題 / 共 {{ totalQuestions }} 題", "{{ t('第 {n} 題 / 共 {total} 題').replace('{n}', (currentQuestionIndex + 1).toString()).replace('{total}', totalQuestions.toString()) }}"),
        ("請輸入數字的聯想關鍵字：", "{{ t('請輸入數字的聯想關鍵字：') }}"),
        ("placeholder=\"請輸入數字的聯想關鍵字...\"", ":placeholder=\"t('輸入您的答案...')\""),
        ("提交答案", "{{ t('提交答案') }}"),
        ("送出", "{{ t('送出') }}"),
        ("請根據前一個字聯想下一個字：", "{{ t('請根據前一個字聯想下一個字：') }}"),
        ("當前提示：", "{{ t('當前提示：') }}"),
        ("正確答案是:", "{{ t('正確答案是:') }}"),
        ("或別名：", "{{ t('或別名：') }}"),
        ("顯示詳細故事提示", "{{ t('顯示詳細故事提示') }}"),
        ("離開測驗", "{{ t('離開測驗') }}"),
        ("測驗完成！", "{{ t('測驗完成！') }}"),
        ("答對率：", "{{ t('答對率：') }}"),
        ("答對題數：", "{{ t('答對題數：') }}"),
        ("錯題記錄將會排入您的間隔複習計畫中。", "{{ t('錯題記錄將會排入您的間隔複習計畫中。') }}"),
        ("再測一次", "{{ t('再測一次') }}"),
        ("開始複習錯題", "{{ t('開始複習錯題') }}"),
        ("結束並回到概覽", "{{ t('結束並回到概覽') }}"),
    ],

    "FlashCardView.vue": [
        ("◀ 返回主頁", "◀ {{ t('返回主頁') }}"),
        ("<h2 class=\"page-title mt-12\">🃏 卡牌記憶複習 (Flash Cards)</h2>", "<h2 class=\"page-title mt-12\">🃏 {{ t('卡牌記憶複習 (Flash Cards)') }}</h2>"),
        ("<h3>選擇記憶卡牌範圍</h3>", "<h3>{{ t('選擇記憶卡牌範圍') }}</h3>"),
        ("<p class=\"text-muted mt-8 mb-24\">透過雙面閃卡，快速測試您對每個數字對應聯想詞的直覺反應。</p>", "<p class=\"text-muted mt-8 mb-24\">{{ t('透過雙面閃卡，快速測試您對每個數字對應聯想詞的直覺反應。') }}</p>"),
        ("🍀 開始時自動打亂卡牌順序", "{{ t('🍀 開始時自動打亂卡牌順序') }}"),
        ("卡牌：{{ currentIndex + 1 }} / {{ items.length }}", "{{ t('卡牌：') }}{{ currentIndex + 1 }} / {{ items.length }}"),
        ("已打亂 🔀", "{{ t('已打亂 🔀') }}"),
        ("想一想，聯想詞是？", "{{ t('想一想，聯想詞是？') }}"),
        ("點擊或按下空白鍵翻面", "{{ t('點擊或按下空白鍵翻面') }}"),
        ("點擊翻回正面", "{{ t('點擊翻回正面') }}"),
        ("<span class=\"assoc-label\">💡 聯想故事：</span>", "<span class=\"assoc-label\">💡 {{ t('💡 聯想故事：') }}</span>"),
    ],

    "FlashMemoryView.vue": [
        ("閃卡記憶訓練", "{{ t('閃卡記憶訓練') }}"),
        ("本單元能以極快的速度閃過數字，訓練您的直覺反應與右腦記憶力。", "{{ t('本單元能以極快的速度閃過數字，訓練您的直覺反應與右腦記憶力。') }}"),
        ("播放速度 (秒/張)", "{{ t('播放速度 (秒/張)') }}"),
        ("卡片範圍", "{{ t('卡片範圍') }}"),
        ("開始播放", "{{ t('開始播放') }}"),
        ("重置", "{{ t('重置') }}"),
        ("{{ isPaused ? '▶ 繼續' : '⏸ 暫停' }}", "{{ isPaused ? '▶ ' + t('繼續') : '⏸ ' + t('暫停') }}"),
    ],

    "GlobalTestView.vue": [
        ("全站綜合大測驗", "{{ t('全站綜合大測驗') }}"),
        ("這項測驗會隨機從 00-100 中抽選", "{{ t('這項測驗會隨機從 00-100 中抽選 {n} 題，測試您的全面熟練度。').replace('{n}', '') }}"),
        ("題，測試您的全面熟練度。", ""),
        ("選擇題數：", "{{ t('選擇題數：') }}"),
        ("開始測驗", "{{ t('開始測驗') }}"),
        ("全站綜合大測驗中", "{{ t('全站綜合大測驗中') }}"),
        ("題", "{{ t('題') }}"),
    ]
}

# Replacements to apply within the WHOLE file (primarily target script setup context safely)
safe_global_replacements = {
    "ReviewView.vue": [
        ("case 'number-to-keyword': return '數字 ➔ 聯想詞';", "case 'number-to-keyword': return t('數字 ➔ 聯想詞');"),
        ("case 'keyword-to-number': return '聯想詞 ➔ 數字';", "case 'keyword-to-number': return t('聯想詞 ➔ 數字');"),
        ("case 'pair-next-item': return '配對聯想 ➔ 下個數字';", "case 'pair-next-item': return t('配對聯想 ➔ 下個數字');"),
        ("case 'story-cloze': return '故事填空 ➔ 聯想詞';", "case 'story-cloze': return t('故事填空 ➔ 聯想詞');"),
        ("default: return '字卡回想';", "default: return t('字卡回想');"),
    ],
    
    "QuizView.vue": [
        ("confirm('確定離開測驗嗎？當前的作答進度將不會被儲存。')", "confirm(t('確定離開測驗嗎？當前的作答進度將不會被儲存。'))"),
        ("alert('答案正確！')", "alert(t('答案正確！'))"),
        ("alert('答案錯誤，正確答案是：' + correctAnswers.join(' 或 '))", "alert(t('答案錯誤，正確答案是：') + ' ' + correctAnswers.join(' ' + t('或別名：') + ' '))"),
    ],

    "FlashCardView.vue": [
        ("desc: '從操場到耳玲'", "desc: t('從操場到耳玲')"),
        ("desc: '從鱷魚到司令'", "desc: t('從鱷魚到司令')"),
        ("desc: '從死魚到榴槤'", "desc: t('從死魚到榴槤')"),
        ("desc: '從老人到巴黎'", "desc: t('從老人到巴黎')"),
        ("desc: '從白蟻到百元'", "desc: t('從白蟻到百元')"),
        ("label: '00 - 100 全域', desc: '所有 101 個記憶點'", "label: t('00 - 100 全域'), desc: t('所有 101 個記憶點')"),
    ],

    "FlashMemoryView.vue": [
        ("alert('右腦快速圖像連結已完成一輪活化！規律訓練能顯著提高數字直覺反射速度')", "alert(t('右腦快速圖像連結已完成一輪活化！規律訓練能顯著提高數字直覺反射速度'))"),
        ("label: '00-09 水彩提示版', desc: '0–9 的單個水彩主題'", "label: t('00-09 水彩提示版'), desc: t('0–9 的單個水彩主題')"),
        ("label: '00-99 雙位數編碼', desc: '00–99 的雙位數編碼'", "label: t('00-99 雙位數編碼'), desc: t('00–99 的雙位數編碼')"),
        ("label: '00-100 全套卡牌', desc: '全部 101 張記憶卡牌'", "label: t('00-100 全套卡牌'), desc: t('全部 101 張記憶卡牌')"),
    ]
}

# Apply string replacements and inject i18n
for filename in set(list(template_replacements.keys()) + list(safe_global_replacements.keys())):
    path = os.path.join(VIEWS_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 1. Inject i18n import and setup declaration if script setup block exists and doesn't contain useI18n
        if "<script setup" in content and "useI18n" not in content:
            script_setup_tag = re.search(r'<script setup.*?>', content)
            if script_setup_tag:
                tag_str = script_setup_tag.group(0)
                injection = f"\nimport {{ useI18n }} from '../utils/i18n';\nconst {{ t }} = useI18n();"
                content = content.replace(tag_str, tag_str + injection)
                print(f"Injected i18n hooks into script setup of {filename}")
        elif "<script setup" not in content:
            # For views with no script tag, wrap the whole template and add script setup
            idx = content.find("</template>")
            if idx != -1:
                insertion = "\n\n<script setup lang=\"ts\">\nimport { useI18n } from '../utils/i18n';\nconst { t } = useI18n();\n</script>"
                content = content[:idx+len("</template>")] + insertion + content[idx+len("</template>"):]
                print(f"Created script setup with i18n hooks in {filename}")

        # 2. Perform substitutions inside template block only
        if filename in template_replacements:
            parts = content.split("</template>", 1)
            if len(parts) == 2:
                template_content = parts[0]
                rest = parts[1]
                for old, new in template_replacements[filename]:
                    template_content = template_content.replace(old, new)
                content = template_content + "</template>" + rest

        # 3. Perform global safe replacements
        if filename in safe_global_replacements:
            for old, new in safe_global_replacements[filename]:
                content = content.replace(old, new)
            
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully processed and saved {filename}")
    else:
        print(f"File not found: {path}")
