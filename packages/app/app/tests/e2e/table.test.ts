import { expect, test, type Page } from '@playwright/test'

// Collections response for the sidebar
const collectionsFixture = {
  items: [
    { name: 'countries', icon: 'i-lucide-globe', color: '#22c55e', description: 'Countries collection' }
  ],
  total_count: 1
}

// Full dataset used by our mock backend
const countriesFixture = {
  items: [
    { id: 1, name: 'France', code: 'FR', emoji: '🇫🇷', region: 'Europe' },
    { id: 2, name: 'Japan', code: 'JP', emoji: '🇯🇵', region: 'Asia' },
    { id: 3, name: 'Canada', code: 'CA', emoji: '🇨🇦', region: 'North America' },
    { id: 4, name: 'Germany', code: 'DE', emoji: '🇩🇪', region: 'Europe' },
    { id: 5, name: 'Brazil', code: 'BR', emoji: '🇧🇷', region: 'South America' },
    { id: 6, name: 'Australia', code: 'AU', emoji: '🇦🇺', region: 'Oceania' },
    { id: 7, name: 'India', code: 'IN', emoji: '🇮🇳', region: 'Asia' },
    { id: 8, name: 'Italy', code: 'IT', emoji: '🇮🇹', region: 'Europe' },
    { id: 9, name: 'Mexico', code: 'MX', emoji: '🇲🇽', region: 'North America' },
    { id: 10, name: 'South Africa', code: 'ZA', emoji: '🇿🇦', region: 'Africa' },
    { id: 11, name: 'China', code: 'CN', emoji: '🇨🇳', region: 'Asia' },
    { id: 12, name: 'Russia', code: 'RU', emoji: '🇷🇺', region: 'Europe' },
    { id: 13, name: 'United Kingdom', code: 'GB', emoji: '🇬🇧', region: 'Europe' },
    { id: 14, name: 'United States', code: 'US', emoji: '🇺🇸', region: 'North America' },
    { id: 15, name: 'Spain', code: 'ES', emoji: '🇪🇸', region: 'Europe' },
    { id: 16, name: 'Argentina', code: 'AR', emoji: '🇦🇷', region: 'South America' },
    { id: 17, name: 'South Korea', code: 'KR', emoji: '🇰🇷', region: 'Asia' },
    { id: 18, name: 'Egypt', code: 'EG', emoji: '🇪🇬', region: 'Africa' },
    { id: 19, name: 'New Zealand', code: 'NZ', emoji: '🇳🇿', region: 'Oceania' },
    { id: 20, name: 'Sweden', code: 'SE', emoji: '🇸🇪', region: 'Europe' },
    { id: 21, name: 'Nigeria', code: 'NG', emoji: '🇳🇬', region: 'Africa' },
    { id: 22, name: 'Saudi Arabia', code: 'SA', emoji: '🇸🇦', region: 'Asia' },
    { id: 23, name: 'Turkey', code: 'TR', emoji: '🇹🇷', region: 'Asia' },
    { id: 24, name: 'Greece', code: 'GR', emoji: '🇬🇷', region: 'Europe' },
    { id: 25, name: 'Thailand', code: 'TH', emoji: '🇹🇭', region: 'Asia' }
  ],
  total_count: 25
}

// Helper to install API mocks that slice by offset/limit
async function mockCountriesApi(page: Page) {
  // Sidebar collections
  await page.route('**/api/items/hubify_collections**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(collectionsFixture) })
  })

  // Countries slice by offset/limit; defaults: limit=10, offset=0
  await page.route('**/api/items/countries**', async (route) => {
    const url = new URL(route.request().url())
    const limit = Number(url.searchParams.get('limit') ?? '10')
    const offset = Number(url.searchParams.get('offset') ?? '0')
    const slice = countriesFixture.items.slice(offset, offset + limit)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: slice, total_count: countriesFixture.total_count })
    })
  })
}

test.describe('/admin/items/countries', () => {
  test('renders table with mocked countries data (slice by offset/limit)', async ({ page, baseURL }) => {
    await mockCountriesApi(page)
    await page.goto(`${baseURL}/admin/items/countries`)

    const panel = page.locator('#dashboard-panel-collection-table, #collection-table')
    await expect(panel).toBeVisible()

    await expect(panel.getByText('France')).toBeVisible()
    await expect(panel.getByText('Japan')).toBeVisible()
  })

  test('filters rows using global filter input', async ({ page, baseURL }) => {
    await mockCountriesApi(page)
    await page.goto(`${baseURL}/admin/items/countries`)

    const panel = page.locator('#dashboard-panel-collection-table, #collection-table')
    await expect(panel).toBeVisible()

    const search = page.getByTestId('global-filter')
    await expect(search).toBeVisible()
    await search.fill('Japan')

    await expect(panel.getByText('Japan')).toBeVisible()
    await expect(panel.getByText('France')).not.toBeVisible()

    await search.fill('')
  })

  test('changes page size and reflects limit in query + pagination count', async ({ page, baseURL }) => {
    await mockCountriesApi(page)
    await page.goto(`${baseURL}/admin/items/countries`)

    const pagination = page.locator('[data-testid="table-pagination"]')
    const pageButtons = pagination.locator('button[aria-label^="Page "]')
    await expect(pageButtons).toHaveCount(3) // 25 items / 10 per page

    const trigger = page.getByTestId('table-page-size').locator('button').first()
    await expect(trigger).toHaveText('10 items')

    await trigger.click()
    const controlsId = await trigger.getAttribute('aria-controls')
    if (!controlsId) throw new Error('aria-controls not found on page size trigger')
    const req20 = page.waitForRequest(r => r.url().includes('/api/items/countries') && new URL(r.url()).searchParams.get('limit') === '20')
    await page.locator(`#${controlsId} [role="group"] >> text=20 items`).click()
    await req20
    await expect(trigger).toHaveText('20 items')
    await expect(pageButtons).toHaveCount(2) // 25 / 20 = 2 pages

    await trigger.click()
    const req50 = page.waitForRequest(r => r.url().includes('/api/items/countries') && new URL(r.url()).searchParams.get('limit') === '50')
    await page.locator(`#${controlsId} [role="group"] >> text=50 items`).click()
    await req50
    await expect(trigger).toHaveText('50 items')
    await expect(pageButtons).toHaveCount(1) // 25 / 50 = 1 page
  })

  test('pagination buttons update offset', async ({ page, baseURL }) => {
    await mockCountriesApi(page)
    await page.goto(`${baseURL}/admin/items/countries`)

    // Set page size to 20 first
    const trigger = page.getByTestId('table-page-size').locator('button').first()
    await trigger.click()
    const controlsId = await trigger.getAttribute('aria-controls')
    if (!controlsId) throw new Error('aria-controls not found on page size trigger')
    const req20 = page.waitForRequest(r => r.url().includes('/api/items/countries') && new URL(r.url()).searchParams.get('limit') === '20')
    await page.locator(`#${controlsId} [role="group"] >> text=20 items`).click()
    await req20

    const pagination = page.locator('[data-testid="table-pagination"]')
    const pageButtons = pagination.locator('button[aria-label^="Page "]')
    await expect(pageButtons).toHaveCount(2)

    // Click page 2 and ensure offset=20 in the next request
    const reqOffset20 = page.waitForRequest((r) => {
      if (!r.url().includes('/api/items/countries')) return false
      const u = new URL(r.url())
      return u.searchParams.get('offset') === '20'
    })
    await pagination.locator('button[aria-label="Page 2"]').click()
    await reqOffset20

    const panel = page.locator('#dashboard-panel-collection-table, #collection-table')
    await expect(panel.getByText('Nigeria')).toBeVisible()
    await expect(panel.getByText('France')).not.toBeVisible()
  })
})
