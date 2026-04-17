import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import HelloWorld from './HelloWorld.jsx'

test('renders name', async () => {
  const { getByText } = await render(<HelloWorld name="Vitest" />)
  await expect.element(getByText('Hello Vitest!')).toBeInTheDocument()
  
  // Check accessibility using custom matcher
  await expect(document.body).toBeAccessible('HelloWorld');
})


