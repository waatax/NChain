import os
import re

VIEWS_DIR = "apps/web/src/views"

# Mapping of file name to its replacements (exact string search-and-replace)
replacements_map = {
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
        # Script setup injection
        ("import { ref, onMounted, computed, nextTick } from 'vue';", "import { ref, onMounted, computed, nextTick } from 'vue';\nimport { useI18n } from '../utils/i18n';"),
        ("const appStore = useAppStore();", "const appStore = useAppStore();\nconst { t } = useI18n();"),
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
        ("desc: '從操場到耳玲'", "desc: t('從操場到耳玲')"),
        ("desc: '從鱷魚到司令'", "desc: t('從鱷魚到司令')"),
        ("desc: '從死魚到榴槤'", "desc: t('從死魚到榴槤')"),
        ("desc: '從老人到巴黎'", "desc: t('從老人到巴黎')"),
        ("desc: '從白蟻到百元'", "desc: t('從白蟻到百元')"),
        ("label: '00 - 100 全域', desc: '所有 101 個記憶點'", "label: t('00 - 100 全域'), desc: t('所有 101 個記憶點')"),
        # Script setup injection
        ("import { ref, onMounted, onUnmounted, computed } from 'vue';", "import { ref, onMounted, onUnmounted, computed } from 'vue';\nimport { useI18n } from '../utils/i18n';"),
        ("const appStore = useAppStore();", "const appStore = useAppStore();\nconst { t } = useI18n();"),
    ],

    "FlashMemoryView.vue": [
        ("label: '00-09 水彩提示版', desc: '0–9 的單個水彩主題'", "label: t('00-09 水彩提示版'), desc: t('0–9 的單個水彩主題')"),
        ("label: '00-99 雙位數編碼', desc: '00–99 的雙位數編碼'", "label: t('00-99 雙位數編碼'), desc: t('00–99 的雙位數編碼')"),
        ("label: '00-100 全套卡牌', desc: '全部 101 張記憶卡牌'", "label: t('00-100 全套卡牌'), desc: t('全部 101 張記憶卡牌')"),
    ]
}

# Update apps/web/src/utils/i18n.ts with any missing keys
i18n_path = "apps/web/src/utils/i18n.ts"
with open(i18n_path, "r", encoding="utf-8") as f:
    i18n_content = f.read()

additional_translations = {
    "00–100 記憶關鍵字圖鑑": "Bách khoa từ khóa ghi nhớ 00–100",
    "搜尋數字、關鍵字或別名...": "Tìm kiếm số, từ khóa hoặc biệt danh...",
    "排列列數：": "Sắp xếp theo số cột:",
    "列": "cột",
    "找不到符合的數字或關鍵字 😢": "Không tìm thấy số hoặc từ khóa phù hợp 😢",
    "記憶詳情": "Chi tiết ghi nhớ",
    "自訂別名 (選填，多個以逗號分隔)": "Biệt danh tùy chỉnh (Tùy chọn, phân tách bằng dấu phẩy)",
    "自訂記憶備忘錄 (選填)": "Ghi chú ghi nhớ tùy chỉnh (Tùy chọn)",
    "卡牌記憶複習 (Flash Cards)": "Ôn tập thẻ ghi nhớ (Flash Cards)",
    "選擇記憶卡牌範圍": "Chọn phạm vi thẻ ghi nhớ",
    "透過雙面閃卡，快速測試您對每個數字對應聯想詞的直覺反應。": "Thông qua thẻ ghi nhớ hai mặt, kiểm tra nhanh phản xạ trực giác của bạn đối với từ liên tưởng tương ứng của từng con số.",
    "🍀 開始時自動打亂卡牌順序": "🍀 Tự động xáo trộn thứ tự thẻ khi bắt đầu",
    "卡牌：": "Thẻ: ",
    "已打亂 🔀": "Đã xáo trộn 🔀",
    "想一想，聯想詞是？": "Hãy nghĩ xem, từ liên tưởng là gì?",
    "點擊或按下空白鍵翻面": "Lật mặt (Click hoặc nhấn Space)",
    "點擊翻回正面": "Click để lật lại mặt trước",
    "💡 聯想故事：": "💡 Câu chuyện liên tưởng:",
    "從操場到耳玲": "Từ Sân chơi đến Khuyên tai",
    "從鱷魚到司令": "Từ Cá sấu đến Tư lệnh",
    "從死魚到榴槤": "Từ Cá chết đến Sầu riêng",
    "從老人到巴黎": "Từ Ông lão đến Paris",
    "從白蟻到百元": "Từ Mối trắng đến Trăm tệ",
    "所有 101 個記憶點": "Tất cả 101 điểm ghi nhớ",
    "00 - 100 全域": "00 - 100 Toàn bộ",
    "00-09 水彩提示版": "Bản gợi ý màu nước 00-09",
    "0–9 的單個水彩主題": "Chủ đề màu nước đơn lẻ của 0–9",
    "00-99 雙位數編碼": "Mã hóa 2 chữ số 00-99",
    "00–99 的雙位數編碼": "Mã hóa 2 chữ số của 00–99",
    "00-100 全套卡牌": "Trọn bộ thẻ 00-100",
}

# Inject missing translations into i18n.ts translations object
for zh, vi in additional_translations.items():
    entry = f'  "{zh}": "{vi}",\n'
    if f'"{zh}":' not in i18n_content:
        # Insert right after "export const translations: Record<string, string> = {\n"
        insert_marker = "export const translations: Record<string, string> = {\n"
        idx = i18n_content.find(insert_marker)
        if idx != -1:
            split_idx = idx + len(insert_marker)
            i18n_content = i18n_content[:split_idx] + entry + i18n_content[split_idx:]

with open(i18n_path, "w", encoding="utf-8") as f:
    f.write(i18n_content)
print("Updated i18n.ts translations database.")

# Apply string replacements to Vue views
for filename, replacements in replacements_map.items():
    path = os.path.join(VIEWS_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        orig_content = content
        for old, new in replacements:
            content = content.replace(old, new)
            
        if content != orig_content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Successfully localized {filename}")
        else:
            print(f"No changes applied to {filename} (either already localized or target patterns mismatched)")
    else:
        print(f"File not found: {path}")
