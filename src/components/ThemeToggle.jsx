import { useTheme } from '../lib/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isDark}
      title="Stored in this browser only, no cookies"
    >
      {isDark ? 'Dark' : 'Light'}
    </button>
  )
}
