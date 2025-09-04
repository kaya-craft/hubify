/// <reference types="@vitest/browser/providers/playwright" />
import { describe, expect, it } from 'vitest'
import 'vitest-browser-vue'
import { InputsTemplateVariable } from '#components'
import { page, userEvent } from '@vitest/browser/context'

describe('TemplateVariableInput', () => {
  it('renders correctly', async () => {
    let modelValue: string | undefined

    const result = page.render(InputsTemplateVariable, {
      props: {
        modelValue,
        'variables': ['var1', 'var2'],
        'onUpdate:modelValue': (val) => {
          if (val === modelValue) return
          result.rerender({ modelValue: val })
          modelValue = val?.trim()
        }
      }
    })

    const input = page.getByTestId('template-variable-input')
    await expect.element(input).not.toBeVisible()

    const tagify = page.getByTag('tags')
    const inputTag = tagify.getByRole('textbox')

    await expect.element(tagify).toBeVisible()
    await expect.element(inputTag).toBeVisible()

    await userEvent.fill(inputTag, 'Hello')

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(modelValue).toBe('Hello')

    await userEvent.type(inputTag, ' {{{{')

    const select = page.getByTestId('template-variable-select')
    await expect.element(select).not.toBeVisible()

    const option1 = page.getByText('var1')
    const option2 = page.getByText('var2')

    await expect.element(option1).toBeVisible()
    await expect.element(option2).toBeVisible()

    await userEvent.click(option1)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(modelValue).toBe('Hello {{var1}}')

    const tagRemove = page.getByTestId('template-variable-tag-remove')
    await expect.element(tagRemove).toBeVisible()

    await userEvent.click(tagRemove)

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(modelValue).toBe('Hello')
  })
})
