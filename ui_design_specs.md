# NutriAI UI Design Specifications

## 1. Visual Identity
*   **Palette**:
    *   **Primary Green**: `#16A34A` (Tailwind `green-600`) - Actions, Highlights, Success.
    *   **Soft Green**: `#DCFCE7` (Tailwind `green-100`) - Backgrounds, Accents.
    *   **Neutrals**: White `#FFFFFF`, Gray-50 `#F9FAFB` (App BG), Gray-800 `#1F2937` (Text).
    *   **Alert**: Blue `#2563EB` (User Bubble), Orange `#F97316` (Warning).
*   **Typography**:
    *   **Font**: `Inter` or `Plus Jakarta Sans`. Clean, highly readable.
    *   **Hierarchy**: 
        *   H1: 24px/Bold (Headers)
        *   H2: 18px/SemiBold (Section Titles)
        *   Body: 14px/Regular (Chat text)
        *   Small: 12px/Medium (Metadata, timestamps)
*   **Spacing & Radius**:
    *   **Rounded-XL**: 12px-16px radius for cards and inputs.
    *   **Comfortable Spacing**: Use `p-4`, `p-6` (1rem, 1.5rem). Avoid dense clusters.

## 2. Components

### Chat Bubble
*   **User**: Right aligned. Blue background (`bg-blue-600`). White text. Rounded corners except Top-Right (`rounded-tr-sm`). Shadow-sm.
*   **AI**: Left aligned. White background (`bg-white`). Dark text. Border (`border-gray-100`). Rounded corners except Top-Left (`rounded-tl-sm`). 
*   **Markdown**: AI bubbles must support lists, bolding, and headers clearly.

### Sidebar
*   **Desktop**: Fixed 360px. Clean white background. Border right.
*   **Mobile**: Drawer style. Slide-over from left. Z-index 50.
*   **Active Item**: Light green bg (`bg-green-50`) using a vertical green indicator bar on the left edge.

## 3. Key Screens

### A. Login
*   **Layout**: Centered card on a soft gradient background (White to Green-50).
*   **Elements**: Clean form fields with inner icons. Large "Sign In" button. Social login divider.

### B. Dashboard (Chat)
*   **Header**: Clean. "Online" indicator. Context menu (3 dots).
*   **Input Area**: Floating interaction bar. Not stuck to bottom edge (give margin `m-4`). Input looks like a pill or rounded rectangle.
*   **Empty State**: Friendly illustration (e.g., Avocado character or simple bowl icon). Encouraging microcopy.

### C. Profile & Meal Plan
*   **Layout**: Cards grid.
*   **Plan View**: 7-day horizontal scroll or vertical accordion.
*   **Card**: "Monday". List of 3 meals + 2 snacks. Icons for Breakfast/Lunch/Dinner.

## 4. Micro-interactions
*   **Send Animation**: Button scales down slightly on click (`active:scale-95`).
*   **Typing Indicator**: 3 bouncing dots. Smooth animation wave.
*   **Loading**: Skeleton loaders for sidebar items while fetching. Use "Shimmer" effect.
