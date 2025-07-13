# C42 OS Unified Design System v1.6

This document outlines the core design principles, color palette, typography, and component styles for the C42 Operating System. **NEW in v1.6**: Real-world examples from the Irish Riverbank Rewilding Coordinator and enhanced dark mode guidelines.

---

## 🎨 Color Palette

Our palette is divided into functional categories: Core Brand, UI Colors (with Light & Dark modes), and Gradient Accents.

### Core Brand & Semantic Colors

These colors are defined in `tailwind.config` and should be used for consistency.

| Color Name   | Hex/RGBA                            | Tailwind Class                | Light Mode Usage                   | Dark Mode Usage                      |
| :----------- | :---------------------------------- | :---------------------------- | :--------------------------------- | :----------------------------------- |
| **UI**       |                                     |                               |                                    |                                      |
| BG           | `#F9FAFB`                           | `bg-gray-50`                  | Main background                    | N/A                                  |
| Card BG      | `#FFFFFF`                           | `bg-white`                    | Card surfaces                      | N/A                                  |
| Text Primary | `#111827`                           | `text-gray-900`               | Headings                           | N/A                                  |
| Text Secondary| `#374151`                          | `text-gray-700`               | Body copy, descriptions            | N/A                                  |
| **Dark UI**  |                                     |                               |                                    |                                      |
| Dark BG      | `#030712`                           | `dark:bg-c42-dark-bg`         | N/A                                | Main background                      |
| Dark Card BG | `#111827`                           | `dark:bg-c42-dark-card`       | N/A                                | Card surfaces                        |
| Dark Text Primary | `rgba(255, 255, 255, 0.95)`    | `dark:text-c42-text-dark-primary`| N/A                              | Headings & bright text               |
| Dark Text Secondary | `rgba(255, 255, 255, 0.75)`  | `dark:text-c42-text-dark-secondary` | N/A                            | Body copy, descriptions              |
| **Brand**    |                                     |                               |                                    |                                      |
| Primary      | `#764ba2`                           | `c42-primary`                 | Links, focus rings, accents        | Links, focus rings, accents          |
| Secondary    | `#06B6D4`                           | `c42-secondary`               | Informational icons                | Informational icons                  |
| Accent       | `#10B981`                           | `c42-accent`                  | Success states, positive feedback  | Success states, positive feedback    |
| Danger       | `#EF4444`                           | `c42-danger`                  | Errors, critical alerts            | Errors, critical alerts              |

### Gradient Accents

Gradients are used for high-impact visual elements and should be chosen semantically.

#### Standard Gradients
- **Primary Action Button:** `from-[#667eea] to-[#764ba2]` (New Unified Gradient)
- **Anti-Rivalry:** `from-pink-500 to-rose-500`
- **Consciousness Collaboration:** `from-blue-500 to-cyan-500`
- **Privacy by Design:** `from-green-500 to-emerald-500`
- **Pattern Recognition:** `from-purple-500 to-violet-500`
- **Collective Empowerment:** `from-teal-500 to-cyan-500`

#### 🆕 Environmental/Policy Agent Gradients
Based on successful implementation in Irish Riverbank Rewilding Coordinator:

- **Water Systems:** `from-blue-500 to-cyan-500` (perfect for river/water-related metrics)
- **Nature Restoration:** `from-green-500 to-emerald-500` (biodiversity, ecosystem services)
- **Project Approval:** `from-purple-500 to-violet-500` (approved initiatives, progress tracking)
- **Urgency/Deadlines:** `from-orange-500 to-red-500` (legal compliance, time-sensitive alerts)
- **Funding/Investment:** `from-blue-600 to-green-600` (financial flows, resource allocation)

**Usage Example:**
```tsx
// ✅ Good - Semantic use
<div className="bg-gradient-to-r from-blue-500 to-cyan-500"> // Water quality metrics
<div className="bg-gradient-to-r from-orange-500 to-red-500"> // Urgent deadline warning

// ❌ Avoid - Random gradient selection
<div className="bg-gradient-to-r from-pink-500 to-yellow-500"> // No clear meaning
```

---

## ✒️ Typography

- **Primary Font:** `Inter` (used for all UI text, headings, and body copy).
  - *Tailwind Class:* `font-sans`
- **Monospace Font:** `JetBrains Mono` (used for code, system stats, and audit results).
  - *Tailwind Class:* `font-mono`

---

## 🌐 Internationalization (i18n)

C42 OS supports multiple languages to be inclusive for a global audience.

- **Strategy:** All user-facing strings are stored in a central `translations` object.
- **Structure:** `translations[languageCode][stringKey]`
- **Implementation:** A `t(key)` helper function retrieves the correct string.
- **Detection:** Language is auto-detected from browser, manually overrideable.

---

## 🧱 Components

### 🆕 Dark Mode Component Pattern

**CRITICAL**: All components must support both light and dark modes. Use this pattern:

```tsx
// ✅ CORRECT - Full dark mode support
<div className="bg-white dark:bg-c42-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
  <h2 className="text-gray-900 dark:text-c42-text-dark-primary">
  <p className="text-gray-600 dark:text-c42-text-dark-secondary">
</div>

// ❌ INCORRECT - Light mode only
<div className="bg-white rounded-xl border border-gray-200">
  <h2 className="text-gray-900">
  <p className="text-gray-600">
</div>
```

### Buttons

**1. Primary Action Button**
- **Description:** Large, gradient button for main call-to-action.
- **Styling:**
  - Gradient: `from-[#667eea] to-[#764ba2]`
  - Hover: `scale-105` transform
  - Text: White, `font-semibold`, `text-lg`

**Example Implementation:**
```tsx
<button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2">
  <Zap className="w-5 h-5" />
  <span>Submit to Agent Network</span>
</button>
```

**2. Secondary Button**
- **Description:** Used for secondary actions.
- **Styling:**
  - Light Mode: `bg-gray-200 hover:bg-gray-300 text-gray-800`
  - Dark Mode: `dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200`

### Cards

**1. 🆕 Agent Dashboard Cards**
- **Description:** Hero metrics cards with semantic gradients.
- **Pattern:** Each card should use semantically appropriate gradients based on content.

**Real-world Example (Irish Riverbank Coordinator):**
```tsx
{/* Funding Card - Financial focus */}
<div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-blue-100">Total Funding</p>
      <p className="text-3xl font-bold">€{amount}M</p>
      <p className="text-sm text-blue-100">Climate & Nature Fund</p>
    </div>
    <Euro className="w-12 h-12 text-blue-200" />
  </div>
</div>

{/* Progress Card - Urgency focus */}
<div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-orange-100">Progress</p>
      <p className="text-3xl font-bold">{percentage}%</p>
      <p className="text-sm text-orange-100">Of 2027 target</p>
    </div>
    <TrendingUp className="w-12 h-12 text-orange-200" />
  </div>
</div>
```

**2. Standard Content Cards**
- **Description:** Used throughout the OS for containing content.
- **Styling:**
  - Background: `bg-white dark:bg-c42-dark-card`
  - Border: `border border-gray-200 dark:border-gray-700`
  - Corners: `rounded-xl`
  - Shadow: `shadow-lg`

**3. 🆕 Status/Entity Cards (Rivers, Projects, etc.)**
- **Description:** Cards representing entities with status indicators.
- **Pattern:** Include status badges with semantic colors.

**Real-world Example:**
```tsx
<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
  <div className="flex justify-between items-start mb-3">
    <h3 className="font-semibold text-gray-900 dark:text-c42-text-dark-primary">{entityName}</h3>
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'Poor' ? 'bg-red-100 text-red-800' :
      status === 'At Risk' ? 'bg-orange-100 text-orange-800' :
      'bg-yellow-100 text-yellow-800'
    }`}>
      {status}
    </span>
  </div>
  {/* Content */}
</div>
```

### Navigation

**Navigation Bar**
- **Description:** Main OS header with glassmorphism effect.
- **Styling:**
  - Background: `bg-white/80 dark:bg-c42-dark-card/80`
  - Blur: `backdrop-blur-md`

### 🆕 Agent Activity Components

**Agent Status Indicator**
```tsx
<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
  <div className="flex items-center space-x-2">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    <span className="text-sm font-medium text-gray-900 dark:text-c42-text-dark-primary">Agent-Name</span>
  </div>
  <span className="text-xs text-gray-500 dark:text-c42-text-dark-secondary">Active</span>
</div>
```

**Message Feed**
```tsx
<div className="text-xs text-gray-600 dark:text-c42-text-dark-secondary p-2 bg-gray-50 dark:bg-gray-800 rounded">
  <div className="font-medium">{msg.from} → {msg.topic}</div>
  <div className="text-gray-500 dark:text-gray-400">{msg.timestamp}</div>
</div>
```

---

## 🎯 Real-World Implementation Examples

### Irish Riverbank Rewilding Coordinator

This component successfully demonstrates:

1. **✅ Perfect Dark Mode Implementation**
   - Background: `style={{ backgroundColor: '#030712' }}`
   - Cards: `bg-white dark:bg-c42-dark-card`
   - Text: `text-gray-900 dark:text-c42-text-dark-primary`

2. **✅ Semantic Gradient Usage**
   - Water systems: Blue→cyan gradients
   - Environmental restoration: Green→emerald
   - Project tracking: Purple→violet
   - Urgency indicators: Orange→red

3. **✅ Consistent Component Patterns**
   - All cards follow standard structure
   - Proper spacing and typography hierarchy
   - Accessible color contrast

### Key Lessons Learned

1. **Always include dark mode classes** - Never use just `bg-white`, always `bg-white dark:bg-c42-dark-card`
2. **Choose gradients semantically** - Match colors to content meaning
3. **Test contrast in both modes** - Ensure readability in light and dark themes
4. **Use status indicators consistently** - Same pattern for entity status across apps

---

## 🚀 Quick Implementation Checklist

When building new C42 OS components:

- [ ] Main background uses `#030712` or `dark:bg-c42-dark-bg`
- [ ] All cards use `bg-white dark:bg-c42-dark-card`
- [ ] All text uses `text-gray-900 dark:text-c42-text-dark-primary/secondary`
- [ ] Gradients chosen semantically based on content
- [ ] Status indicators use consistent color coding
- [ ] Agent activity components follow established patterns
- [ ] Typography uses Inter (font-sans) throughout
- [ ] All interactive elements have proper hover states

---

*Design System through consciousness collaboration, not rigid rules.*
