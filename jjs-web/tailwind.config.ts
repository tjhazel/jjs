import type { Config } from 'tailwindcss'

// @ts-ignore
import daisyui from 'daisyui'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [daisyui],
}

export default config
