---
name: mantine-frontend
description: Master rules for building React 19.2+ applications using Mantine v9+, native schema forms, unified scheduling primitives, and custom component factory patterns.
---

# Mantine v9+ Frontend Production Guidelines

## 1. AI Tooling & Sub-Skill Delegation
* **Official AI Architecture**: For complex UI compositions, query documentation via the official [Mantine LLM Documentation](https://mantine.dev/guides/llms/) or use the native `@mantine/mcp-server`.
* **Sub-Skill Integration**: If a task requires highly specific configurations, delegate to the official upstream [Mantine Agent Skills](https://github.com/mantinedev/skills) by installing the required modular skill:
  * `mantine-form`: For advanced object validation or uncontrolled state tracking.
  * `mantine-combobox`: For custom virtualized dropdowns and multi-select filters.
  * `mantine-custom-components`: For building compound primitives using `factory()`.
* **Prompt Activation**: Trigger sub-skills within local AI prompts explicitly using `$mantine-form`, `$mantine-combobox`, or `$mantine-custom-components`.

## 2. React 19.2+ Foundations & Component Engine
* **React 19 Hooks**: Maximize the use of React 19 native primitives like `Activity` and `useEffectEvent` for state synchronization instead of heavy local side effects.
* **Layout Boundaries**: Map responsive workflows and layouts to modern CSS Container Queries. Block outdated absolute layout hooks. 
* **Hook Splitting**: Ensure correct hook usage since several v9 elements have split signatures:
  * Do not use `useFullscreen`. Use `useFullscreenElement` or `useFullscreenDocument`.
  * Do not use `useMouse` for global positioning. Use `useMouse` (for element refs) or `useMousePosition` (for document tracking).
  * Update `useHeadroom` to parse the new structural return format: `{ pinned: boolean; scrollProgress: number }`.

## 3. Native Form Lifecycle (`@mantine/form`)
* **Built-in Schema Resolution**: Ban third-party resolver dependencies (like `@hookform/resolvers`). Use Mantine v9's built-in native schema validation engine directly inside `useForm`.
* **Async & Key Tracking**: Always implement asynchronous verification logic natively within the form schema. Ensure every form input uses `key={form.key('fieldName')}` when managing high-performance uncontrolled forms.
* **Component Contexts**: Wrap deeply nested form nodes in `createFormContext` blocks to pass form state cleanly without prop drilling.

## 4. Layout, Grids & Specialized Packages
* **Grid Layouts**: The `gutter` prop is deprecated. Always use `gap` to define row and column layouts inside `<Grid>`.
* **Scheduling Infrastructure**: Implement calendar views, event scheduling, and drag-and-drop event manipulation exclusively through the native `@mantine/schedule` package.
* **Data Presentation**: Leverage the `<DataList>` and `<DataList.Item>` primitives for structured, responsive horizontal or vertical lists instead of raw list HTML tags.
* **Pills & Combobox Virtualization**: When scaling long drop-downs (>50 elements), implement `useVirtualizedCombobox`. Enable `withPillsReorder` on `MultiSelect` or `TagsInput` elements to natively allow keyboard-driven drag-and-drop sorting.

## 5. Advanced Styling & Toolchains
* **Zero Inline Styles**: Strict ban on the `style={{}}` object for thematic properties. Apply styling strictly via Mantine tokens (`mx`, `pt`, `bg`) or target sub-elements using the explicit v9 Styles API `classNames` dictionary.
* **Linter Toolchain**: If configuring the local build pipeline, completely replace legacy ESLint or Prettier setups with the highly optimized Rust-based `oxlint` and `oxfmt` via the `oxc-config-mantine` template package.
