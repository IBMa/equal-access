import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import App from './App.jsx'

test('renders app and checks accessibility', async () => {
  await render(<App />)
  
  // Check accessibility using custom matcher
  await expect(document.body).toBeAccessible('App');
})

