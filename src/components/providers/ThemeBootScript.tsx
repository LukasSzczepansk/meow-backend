export function ThemeBootScript() {
  const script = `(() => {
    try {
      const stored = localStorage.getItem('meow:theme');
      const preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
      const resolved = preference === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : preference;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.dataset.themePreference = preference;
      document.documentElement.style.colorScheme = resolved;
    } catch {
      document.documentElement.dataset.theme = 'light';
      document.documentElement.dataset.themePreference = 'system';
    }
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
