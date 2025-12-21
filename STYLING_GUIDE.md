# UI Component Styling Guide

This document maps out all major UI components and buttons, showing where they're located and how to customize their colors, sizes, and styling.

## Project Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Component Locations

### 1. Navigation Bar

**File**: `src/components/NavBar.tsx`

#### Student/Professor NavBar

- **Header Section**: Profile avatar, name, ID, role display
- **Navigation Tabs**: Subjects, Timetable, Attendance, Inbox, Logout buttons
- **Colors**:
  - Active tab: `bg-slate-200` (light gray)
  - Inactive tab: `bg-white` with `hover:bg-slate-50`
  - Active shadow: `shadow-inner`

#### Admin (SysAdmin) NavBar

- **Background**: `bg-gray-900` (dark gray)
- **Text**: `text-white`, admin-specific: `text-green-400`
- **Status Badge**: `bg-green-900 text-green-300`
- **Buttons**: `hover:text-green-400` (hacker theme)

### 2. Login Page

**File**: `src/pages/Login.tsx`

- **Container**: Centered flex layout
- **Input Fields**: Standard text inputs with borders
- **Login Button**: Color changes based on role (student/professor/admin)
- **Register Link**: Blue underlined text, clickable

### 3. Dashboard / Subjects Page

**File**: `src/pages/Dashboard.tsx`

- **Subject Cards**:
  - Background: `bg-white` with `border-4 border-black`
  - Hover effect: `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
  - Title: Bold, large font
  - Card padding: `p-6`

### 4. Attendance Page

**File**: `src/pages/Attendance.tsx`

- **Professor View**:
  - Header: Dark background with white text
  - Table headers: Bold underlined text
  - Cells: Click to mark attendance (0 = absent/red, 1 = present/green)
  - Absent cell with cert: Yellow pulse animation
- **Student View**:
  - Displays own attendance records
  - Medical cert upload button on absent cells

### 5. Student List Admin Page

**File**: `src/pages/StudentListAdmin.tsx`

- **Header Title**: `text-4xl font-bold` with section dropdown
- **Section Dropdown Button**:

  - Background: `bg-white`
  - Border: `border-2 border-black`
  - Hover: Text becomes `text-blue-700`
  - Open state: ChevronDown rotates `rotate-180`

- **Student Table**:
  - Header: Bold, `underline decoration-4 underline-offset-8`
  - Rows: `hover:bg-slate-50` for interactivity
  - Column widths: `w-1/3`, `w-1/4`, `w-1/6`

### 6. Professor List Page

**File**: `src/pages/ProfessorList.tsx`

- **Department Selection Buttons**:

  - Background: `bg-[#2d2d2d]` (dark gray)
  - Text: `text-white`
  - Hover: `hover:bg-black hover:scale-105`
  - Padding: `py-12` (tall buttons)
  - Shadow: `shadow-xl`

- **Professor Table**: Same styling as Student List

### 7. Timetable Page

**File**: `src/pages/Timetable.tsx`

- **Grid Layout**: Days x Time slots
- **Active Session**: `bg-yellow-100` or highlight color
- **Inactive Session**: `bg-gray-50`
- **Border**: `border border-gray-200`

### 8. Inbox Page

**File**: `src/pages/Inbox.tsx`

- **Tab Navigation**: "Emails" and "Certifications" tabs
- **Active Tab**: `bg-slate-200` border underline
- **Inactive Tab**: `bg-white`
- **Email/Cert List**: Bordered containers
- **Action Buttons**: Approve (green), Reject (red), Reply (blue)

### 9. Medical Certification Modal

**File**: `src/components/MedicalCertificationModal.tsx`

- **Modal Background**: Dark overlay `bg-black/50`
- **Modal Box**: White background, `rounded-lg` corners
- **File Input**: Standard file input with accept PDF
- **Upload Button**: Blue background `bg-blue-600` with `hover:bg-blue-700`
- **Cancel Button**: Gray background `bg-gray-300` with `hover:bg-gray-400`

### 10. Admin Database View (SysAdmin)

**File**: `src/pages/SysAdmin.tsx`

- **Sidebar**:

  - Background: `bg-gray-950`
  - Border: `border-r border-green-700`
  - Button selected: `bg-green-700 text-black font-bold`
  - Button unselected: `text-green-400` with `hover:bg-gray-800`

- **Main Content**:

  - Background: `bg-gray-900`
  - Text: `text-gray-300` with `font-mono`
  - Table header: `bg-gray-800 border-b border-green-700`
  - Rows alternate: `bg-gray-950` and `bg-gray-900`
  - Hover row: `hover:bg-gray-800`

- **Hacker Theme Colors**:
  - Primary: `text-green-400`
  - Borders: `border-green-700`
  - Dark bg: `bg-gray-900`, `bg-gray-950`

## Color Scheme Reference

### Standard Colors

- **Primary Dark**: `bg-[#2d2d2d]`, `#2d2d2d` (charcoal)
- **Primary Black**: `bg-black`, `#000000`
- **White**: `bg-white`, `#FFFFFF`
- **Light Gray**: `bg-slate-50`, `bg-slate-200`
- **Gray**: `bg-gray-100`, `bg-gray-300`, `bg-gray-400`, `bg-gray-900`, `bg-gray-950`

### Accent Colors

- **Blue**: `bg-blue-600`, `text-blue-700`, `text-blue-800`
- **Green**: `text-green-400`, `border-green-700`, `bg-green-700`, `bg-green-900`
- **Red**: For rejection/error states
- **Yellow**: For highlights (e.g., certification pending)

## Common Tailwind Patterns Used

### Buttons

```tsx
// Dark button
className =
  "bg-[#2d2d2d] text-white px-6 py-2 rounded font-bold hover:bg-black";

// Blue button
className = "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700";

// White button with border
className = "bg-white border-2 border-black font-bold hover:text-blue-700";
```

### Cards/Containers

```tsx
// Standard card with shadow
className = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";

// Header bar
className = "border-b-4 border-black px-8 py-6";
```

### Text Styling

```tsx
// Large title
className = "text-4xl font-bold";

// Column header
className =
  "text-center text-2xl font-bold underline decoration-4 underline-offset-8";

// Monospace (code/admin)
className = "font-mono";
```

### Interactive Effects

```tsx
// Hover scale
className = "hover:scale-105 transition-all";

// Smooth transitions
className = "transition-colors";
className = "transition-transform";

// Shadow effects
className = "shadow-xl";
className = "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
```

## How to Modify Styles

### Change Button Colors

1. Locate the component file (e.g., `StudentListAdmin.tsx`)
2. Find the button element with `className="..."`
3. Modify the color classes:
   - Background: Change `bg-[#2d2d2d]` to another color
   - Text: Change `text-white` to `text-{color}-{shade}`
   - Hover: Change `hover:bg-black` to another hover color

**Example**: To change a dark button to blue:

```tsx
// Before
className = "bg-[#2d2d2d] text-white hover:bg-black";

// After
className = "bg-blue-600 text-white hover:bg-blue-700";
```

### Change Sizes

- **Padding**: `px-4` (horizontal), `py-2` (vertical), `p-6` (all)
- **Font Size**: `text-sm`, `text-lg`, `text-2xl`, `text-4xl`
- **Border Width**: `border-2`, `border-4`, `border-b-2`, `border-r-4`
- **Spacing**: `gap-4`, `gap-8`, `mb-6`, `mt-4`

**Example**: To make a button larger:

```tsx
// Before
className = "py-2 px-6 text-xl";

// After
className = "py-4 px-8 text-2xl";
```

### Change Colors Globally

Most pages use consistent color schemes. Search for color values in specific page files and update them. Common patterns:

- Dark cards: `border-4 border-black`
- Active states: `bg-slate-200`
- Hover states: `hover:bg-slate-50`

## File Structure Summary

```
src/
├── components/
│   ├── NavBar.tsx              (Navigation colors, sizes)
│   ├── MedicalCertificationModal.tsx  (Modal styling)
│   └── FingerprintUploadModal.tsx
├── pages/
│   ├── Login.tsx               (Login form colors)
│   ├── Dashboard.tsx           (Subject cards styling)
│   ├── Attendance.tsx          (Table styling)
│   ├── StudentListAdmin.tsx    (Student table, dropdowns)
│   ├── ProfessorList.tsx       (Department buttons, professor table)
│   ├── Timetable.tsx           (Grid styling)
│   ├── Inbox.tsx               (Tabs, email/cert styling)
│   ├── SysAdmin.tsx            (Admin database viewer)
│   └── ...
└── App.tsx                     (Global routing)
```

## Tips for Customization

1. **Consistent Colors**: Use the same color scheme across pages for a cohesive look
2. **Tailwind Documentation**: Reference [Tailwind CSS docs](https://tailwindcss.com) for all available utilities
3. **Test Responsiveness**: Use different screen sizes to ensure styles work on mobile/tablet
4. **Hover States**: Always include hover states for interactive elements
5. **Accessibility**: Ensure sufficient color contrast for text readability

## Known Styling Patterns

- **Neumorphism**: Not used; project uses flat design with bold borders
- **Shadow Style**: Custom hard shadow `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- **Border Approach**: Heavy black borders (`border-4 border-black`) rather than subtle shadows
- **Spacing**: Generous padding and gaps for clean layouts
- **Typography**: Bold fonts for headings, standard for body text
