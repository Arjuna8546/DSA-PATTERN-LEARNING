import { snippetCompletion } from '@codemirror/autocomplete'

const KEYWORD_SNIPPETS = [
  snippetCompletion('for ${i} in range(${n}):\n\t${}', {
    label: 'for i in range()',
    type: 'keyword',
    detail: 'counted loop',
  }),
  snippetCompletion('for ${num} in ${nums}:\n\t${}', {
    label: 'for num in nums',
    type: 'keyword',
    detail: 'iterate collection',
  }),
  snippetCompletion('while ${condition}:\n\t${}', { label: 'while', type: 'keyword' }),
  snippetCompletion('while True:\n\t${}', { label: 'while True', type: 'keyword' }),
  snippetCompletion('if ${condition}:\n\t${}', { label: 'if', type: 'keyword' }),
  snippetCompletion('elif ${condition}:\n\t${}', { label: 'elif', type: 'keyword' }),
  snippetCompletion('else:\n\t${}', { label: 'else', type: 'keyword' }),
  snippetCompletion('def ${name}(${args}):\n\t${}', { label: 'def', type: 'keyword', detail: 'function' }),
  snippetCompletion('return ${value}', { label: 'return', type: 'keyword' }),
  snippetCompletion('class ${Name}:\n\tdef __init__(self${args}):\n\t\t${}', {
    label: 'class',
    type: 'keyword',
  }),
  snippetCompletion('lambda ${args}: ${expr}', { label: 'lambda', type: 'keyword' }),
  snippetCompletion('import ${module}', { label: 'import', type: 'keyword' }),
  snippetCompletion('from ${module} import ${name}', { label: 'from import', type: 'keyword' }),
  snippetCompletion('try:\n\t${}\nexcept ${Exception} as ${e}:\n\t${}', {
    label: 'try/except',
    type: 'keyword',
  }),
  snippetCompletion('with ${expr} as ${name}:\n\t${}', { label: 'with', type: 'keyword' }),
  snippetCompletion('break', { label: 'break', type: 'keyword' }),
  snippetCompletion('continue', { label: 'continue', type: 'keyword' }),
  snippetCompletion('pass', { label: 'pass', type: 'keyword' }),
  snippetCompletion('defaultdict(${list})', { label: 'defaultdict', type: 'function', detail: 'collections' }),
  snippetCompletion('deque(${})', { label: 'deque', type: 'function', detail: 'collections' }),
]

const BUILTIN_FUNCTIONS = [
  'len',
  'range',
  'enumerate',
  'zip',
  'map',
  'filter',
  'sorted',
  'max',
  'min',
  'sum',
  'abs',
  'input',
  'print',
]

const BUILTIN_SNIPPETS = BUILTIN_FUNCTIONS.map((name) =>
  snippetCompletion(`${name}(\${})`, { label: `${name}()`, type: 'function' })
)

const ALL_SNIPPETS = [...KEYWORD_SNIPPETS, ...BUILTIN_SNIPPETS]

/** Custom completion source (not generic word-completion): matches the
 * identifier-like token before the cursor and offers snippets whose label
 * starts with it, e.g. typing "fo" surfaces "for i in range()". */
export function pythonCompletionSource(context) {
  const word = context.matchBefore(/[A-Za-z_]\w*/)
  if (!word || (word.from === word.to && !context.explicit)) return null
  const typed = word.text.toLowerCase()
  const options = ALL_SNIPPETS.filter((s) => s.label.toLowerCase().startsWith(typed))
  if (options.length === 0) return null
  return {
    from: word.from,
    options,
    validFor: /^[A-Za-z_]\w*$/,
  }
}

export { BUILTIN_FUNCTIONS }
