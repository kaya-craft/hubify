import { createFilter } from '@vue-macros/common'
import type { Code, Sfc, VueLanguagePlugin } from '@vue/language-core'
import { replace, replaceSourceRange } from 'muggle-string'
import type { NodeArray, Expression, CallExpression, Node } from 'typescript'
import type * as TS from 'typescript'

const DEFINE_NAME = 'defineFieldDataTypes'
const DEFINE_EXPOSE = 'defineExpose'

function transformDefineOptions({
  codes,
  sfc,
  call,
  existing
}: {
  codes: Code[]
  sfc: Sfc
  call: CallExpression
  existing?: Expression
}) {
  const arg = call.arguments as NodeArray<Expression>
  const text = `dataTypes: [${arg.map(d => d.getText(sfc.scriptSetup?.ast)).join(', ')}] as const`

  if (existing) {
    replaceSourceRange(
      codes,
      'scriptSetup',
      existing.pos,
      existing.end,
      `${existing.getText(sfc.scriptSetup?.ast).replace(/^\{/, `{\n\t${text},`)}`
    )
  }
  else {
    replaceSourceRange(
      codes,
      'scriptSetup',
      call.end,
      call.end,
      `\nconst __VLS_exposed = { ${text} };\ndefineExpose(__VLS_exposed);`
    )

    replace(
      codes,
      /(?<=^(?:export\sdefault|const\s__VLS_component\s=)\s\(await\simport\([\S\s]+\)\).defineComponent\(\{)/m,
      '\nsetup: () => (__VLS_exposed),'
    )
  }
}

function getDefineDataTypes(ts: typeof TS, sfc: Sfc) {
  function getCall(node: Node) {
    if (
      !ts.isCallExpression(node)
      || !ts.isIdentifier(node.expression)
      || node.expression.escapedText !== DEFINE_NAME
    )
      return undefined
    return node
  }

  const sourceFile = sfc.scriptSetup!.ast
  return ts.forEachChild(sourceFile, (node) => {
    if (ts.isExpressionStatement(node)) {
      return getCall(node.expression)
    }
    else if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        return getCall(decl.initializer)
      })
    }
  })
}

function getExposed(ts: typeof TS, sfc: Sfc) {
  const sourceFile = sfc.scriptSetup!.ast
  return ts.forEachChild(sourceFile, (node) => {
    if (ts.isExpressionStatement(node)) {
      if (
        ts.isCallExpression(node.expression)
        && ts.isIdentifier(node.expression.expression)
        && node.expression.expression.escapedText === DEFINE_EXPOSE
      ) {
        return node.expression.arguments[0]
      }
    }
    else if (ts.isVariableStatement(node)) {
      return ts.forEachChild(node.declarationList, (decl) => {
        if (!ts.isVariableDeclaration(decl) || !decl.initializer) return
        if (
          ts.isCallExpression(decl.initializer)
          && ts.isIdentifier(decl.initializer.expression)
          && decl.initializer.expression.escapedText === DEFINE_EXPOSE
        ) {
          return decl.initializer.arguments[0]
        }
      })
    }
  })
}

const plugin: VueLanguagePlugin = (ctx, options = {}) => {
  if (!options) return []

  const filter = createFilter(options)

  return {
    version: 2.1,
    order: Infinity,
    resolveEmbeddedCode(fileName, sfc, embeddedFile) {
      if (!filter(fileName) || !sfc.scriptSetup?.ast) return

      const call = getDefineDataTypes(ctx.modules.typescript, sfc)
      if (!call) return

      const existing = getExposed(ctx.modules.typescript, sfc)

      transformDefineOptions({
        codes: embeddedFile.content,
        sfc,
        call,
        existing
      })
    }
  }
}
export default plugin
export { plugin as 'module.exports' }
