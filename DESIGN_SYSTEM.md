# 🎨 StitchArena Design System

Полная документация дизайн-системы проекта StitchArena.

## 📋 Содержание

1. [Design Tokens](#design-tokens)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Components](#components)
5. [Animations](#animations)
6. [Usage Examples](#usage-examples)

---

## Design Tokens

Все design tokens настроены в `src/app/globals.css` с использованием **Tailwind CSS v4**.

### Цвета

#### Основная палитра
```css
--primary: oklch(0.62 0.19 45);           /* Pink/Rose - needle & thread theme */
--secondary: oklch(0.97 0 0);             /* Light gray */
--accent: oklch(0.97 0.03 45);            /* Accent color */
--muted: oklch(0.97 0 0);                 /* Muted background */
```

#### Семантические цвета (NEW!)
```css
--success: oklch(0.65 0.15 145);          /* Green */
--warning: oklch(0.70 0.18 65);           /* Orange */
--info: oklch(0.60 0.15 245);             /* Blue */
--destructive: oklch(0.577 0.245 27.325); /* Red */
```

#### Градиенты (NEW!)
```css
--gradient-from: oklch(0.62 0.19 45);     /* Pink */
--gradient-to: oklch(0.68 0.20 320);      /* Purple */
```

### Тени (NEW!)

```css
--shadow-sm: subtle shadow
--shadow-md: medium shadow
--shadow-lg: large shadow
--shadow-xl: extra large shadow
--shadow-glow: glowing effect
--shadow-card: card shadow
```

### Анимации (NEW!)

```css
--duration-fast: 150ms
--duration-normal: 250ms
--duration-slow: 350ms
```

### Spacing

```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
--spacing-2xl: 3rem     /* 48px */
```

---

## Colors

### Using Colors

```tsx
// Tailwind classes
<div className="bg-primary text-primary-foreground">Primary</div>
<div className="bg-success text-success-foreground">Success</div>
<div className="bg-warning text-warning-foreground">Warning</div>
<div className="bg-info text-info-foreground">Info</div>

// Gradients
<div className="bg-gradient-primary">Gradient</div>
```

### Color Variants

| Variant | Light Mode | Dark Mode | Use Case |
|---------|------------|-----------|----------|
| `primary` | Pink/Rose | Brighter Pink | Main actions, links |
| `secondary` | Light Gray | Dark Gray | Secondary actions |
| `success` | Green | Brighter Green | Success states, positive trends |
| `warning` | Orange | Brighter Orange | Warnings, caution |
| `info` | Blue | Brighter Blue | Information, tips |
| `destructive` | Red | Brighter Red | Errors, delete actions |

---

## Typography

### Font Families

- **Sans**: Geist Sans (default)
- **Mono**: Geist Mono (code, numbers)

### Font Sizes

```tsx
<h1 className="text-5xl">Heading 1</h1>
<h2 className="text-4xl">Heading 2</h2>
<h3 className="text-3xl">Heading 3</h3>
<p className="text-base">Body text</p>
<small className="text-sm">Small text</small>
```

---

## Components

### EmptyState

Используется для отображения пустых состояний.

```tsx
import { EmptyState } from "@/components/design";
import { BookOpen } from "lucide-react";

<EmptyState
  icon={BookOpen}
  title="No projects yet"
  description="Create your first cross-stitch project to get started!"
  action={<Button>Create Project</Button>}
/>

// Compact variant
<EmptyState
  icon={BookOpen}
  title="No logs"
  variant="compact"
/>
```

**Props:**
- `icon`: Lucide icon component
- `title`: Main heading
- `description`: Optional description
- `action`: Optional action button/element
- `variant`: `"default"` | `"compact"`

---

### StatsCard

Карточка для отображения статистики с иконкой и трендом.

```tsx
import { StatsCard } from "@/components/design";
import { Activity } from "lucide-react";

<StatsCard
  title="Total Stitches"
  value={12450}
  description="All time"
  icon={Activity}
  trend={{ value: 12, label: "vs last week" }}
  variant="gradient"
  color="primary"
/>
```

**Props:**
- `title`: Card title
- `value`: Main value (number or string)
- `description`: Optional description
- `icon`: Lucide icon component
- `trend`: Optional trend object `{ value: number, label?: string }`
- `variant`: `"default"` | `"gradient"` | `"outline"`
- `color`: `"primary"` | `"success"` | `"warning"` | `"info"` | `"destructive"`

**Variants:**

```tsx
// Default
<StatsCard variant="default" color="primary" />

// Gradient (recommended for highlights)
<StatsCard variant="gradient" color="success" />

// Outline
<StatsCard variant="outline" color="info" />
```

---

### Badge

Улучшенная система бейджей с иконками и вариантами.

```tsx
import { Badge } from "@/components/design";
import { Star } from "lucide-react";

<Badge variant="success">Completed</Badge>
<Badge variant="warning" size="sm">In Progress</Badge>
<Badge variant="outline" icon={<Star />}>Premium</Badge>
<Badge variant="info" dot>Live</Badge>
```

**Props:**
- `variant`: `"default"` | `"secondary"` | `"success"` | `"warning"` | `"destructive"` | `"info"` | `"outline"` | `"ghost"`
- `size`: `"sm"` | `"md"` | `"lg"`
- `icon`: Optional icon element
- `dot`: Show animated dot

---

## Animations

### Animation Components

Все компоненты используют **Framer Motion**.

#### FadeIn

```tsx
import { FadeIn } from "@/components/animations";

<FadeIn delay={0.1} duration={0.3}>
  <Card>Content fades in</Card>
</FadeIn>
```

#### SlideIn

```tsx
import { SlideIn } from "@/components/animations";

<SlideIn direction="up" delay={0.2}>
  <Card>Slides up while fading in</Card>
</SlideIn>

// Directions: "up" | "down" | "left" | "right"
```

#### ScaleIn

```tsx
import { ScaleIn } from "@/components/animations";

<ScaleIn>
  <Card>Scales in with fade</Card>
</ScaleIn>
```

#### StaggerContainer

Для анимации списков с задержкой между элементами.

```tsx
import { StaggerContainer, StaggerItem } from "@/components/animations";

<StaggerContainer staggerDelay={0.1}>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <ProjectCard {...item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### CSS Animation Utilities

```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Slide up
<div className="animate-slide-up">Content</div>

// Scale in
<div className="animate-scale-in">Content</div>

// Hover lift effect
<Card className="hover-lift">Lifts on hover</Card>

// Smooth transitions
<div className="transition-smooth">Smooth transition</div>
```

---

## Usage Examples

### Dashboard Stats Grid

```tsx
import { StatsCard } from "@/components/design";
import { Activity, Target, Zap, TrendingUp } from "lucide-react";

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatsCard
    title="Total Stitches"
    value={12450}
    icon={Activity}
    trend={{ value: 12 }}
    variant="gradient"
    color="primary"
  />
  <StatsCard
    title="Projects"
    value={8}
    icon={Target}
    description="4 in progress"
    color="success"
  />
  <StatsCard
    title="Avg Speed"
    value="234/day"
    icon={Zap}
    trend={{ value: 8, label: "this week" }}
    color="info"
  />
  <StatsCard
    title="Streak"
    value="12 days"
    icon={TrendingUp}
    variant="outline"
    color="warning"
  />
</div>
```

### Empty State with Action

```tsx
import { EmptyState } from "@/components/design";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

<EmptyState
  icon={BookOpen}
  title="No projects yet"
  description="Create your first cross-stitch project and start tracking your progress!"
  action={
    <Link href="/projects/new">
      <Button size="lg">
        Create Your First Project
      </Button>
    </Link>
  }
/>
```

### Animated Card Grid

```tsx
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { ProjectCard } from "@/components/projects/project-card";

<StaggerContainer staggerDelay={0.05} className="grid gap-4 md:grid-cols-3">
  {projects.map((project) => (
    <StaggerItem key={project.id}>
      <ProjectCard {...project} className="hover-lift" />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### Status Badges

```tsx
import { Badge } from "@/components/design";

const statusBadges = {
  completed: <Badge variant="success">Completed</Badge>,
  in_progress: <Badge variant="info" dot>In Progress</Badge>,
  paused: <Badge variant="warning">Paused</Badge>,
  archived: <Badge variant="outline">Archived</Badge>,
};
```

### Glassmorphism Card

```tsx
<Card className="glass hover-lift">
  <CardContent>
    <h3>Glassmorphism effect</h3>
    <p>Blurred background with transparency</p>
  </CardContent>
</Card>
```

### Gradient Button

```tsx
<Button className="bg-gradient-primary shadow-glow">
  Premium Feature
</Button>
```

---

## Best Practices

### 1. Consistency

Используйте компоненты дизайн-системы везде, где возможно:

```tsx
// ✅ Good
<EmptyState icon={BookOpen} title="No items" />

// ❌ Avoid
<div className="flex flex-col items-center">
  <BookOpen />
  <p>No items</p>
</div>
```

### 2. Color Usage

- `primary`: Main actions, important elements
- `success`: Positive feedback, completed states
- `warning`: Caution, attention needed
- `info`: Informational elements
- `destructive`: Errors, delete actions

### 3. Animations

- Используйте `FadeIn` для модальных окон
- Используйте `SlideIn` для боковых панелей
- Используйте `StaggerContainer` для списков
- Не переусердствуйте с анимациями!

### 4. Spacing

Используйте design tokens для spacing:

```tsx
// ✅ Good
<div className="p-[--spacing-md]">

// Or use Tailwind directly
<div className="p-4">
```

---

## Development

### Добавление нового компонента

1. Создайте файл в `src/components/design/`
2. Используйте существующие design tokens
3. Добавьте в `src/components/design/index.ts`
4. Документируйте в этом файле

### Изменение цветов

Редактируйте `src/app/globals.css`:

```css
:root {
  --primary: oklch(0.62 0.19 45);  /* Ваш новый цвет */
}
```

---

## Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [OKLCH Color Picker](https://oklch.com)

---

**Последнее обновление:** 01.03.2026
**Версия дизайн-системы:** 1.0.0
