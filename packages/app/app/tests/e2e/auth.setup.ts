import { expect, test } from '@playwright/test'

const STORAGE_STATE = 'playwright/.auth/admin.json'
const credentials = { email: 'admin@example.com', password: 'password' }

test('authenticate via API and persist storage state', async ({ page, baseURL }) => {
  if (!baseURL) throw new Error('Missing baseURL for Playwright tests')

  // Try login first; if not found, register then login
  let res = await page.request.post(`${baseURL}/api/auth/email/login`, {
    data: credentials
  })

  if (res.status() === 401) {
    const reg = await page.request.post(`${baseURL}/api/auth/email/register`, {
      data: credentials
    })
    expect(reg.status(), `Register failed (${reg.status()})`).toBe(201)

    // Normalize by logging in (register currently sets a session cookie, but be future-proof)
    res = await page.request.post(`${baseURL}/api/auth/email/login`, {
      data: credentials
    })
  }

  expect(res.status(), 'Login request should succeed').toBe(201)

  // Sanity check: access a protected route
  await page.goto(`${baseURL}/admin`)
  await expect(page).toHaveURL(/\/admin/)

  await page.context().storageState({ path: STORAGE_STATE })
})
