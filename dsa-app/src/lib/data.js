import dataJson from '../data/data.json'
import qsJson from '../data/qs.json'

const { dataStructures } = dataJson
const questionsById = qsJson.questionBank


/** Returns the full list of data structures with nested categories/patterns/variations. */
export function getDataStructures() {
  return dataStructures
}

/** Finds a single pattern object by its ds/category/pattern ids. */
export function getPattern(dsId, categoryId, patternId) {
  const ds = dataStructures.find((d) => d.id === dsId)
  if (!ds) return null
  const category = ds.categories.find((c) => c.id === categoryId)
  if (!category) return null
  const pattern = category.patterns.find((p) => p.id === patternId)
  if (!pattern) return null
  return { ds, category, pattern }
}

/** Resolves a single question by its slug from qs.json. */
export function getQuestion(slug) {
  return questionsById[slug] || null
}

/** Resolves every question referenced by a specific variation's questionIds. */
export function getQuestionsForVariation(dsId, categoryId, patternId, variationId) {

  const found = getPattern(dsId, categoryId, patternId)
  if (!found) return []
  const variation = found.pattern.variations.find((v) => v.id === variationId)
  if (!variation) return []
  return variation.questionIds.map((slug) => getQuestion(slug)).filter(Boolean)
}

/** Builds a flat node/edge list for the home graph: DS -> Category -> Pattern. */
export function buildGraphModel() {
  const nodes = []
  const edges = []

  dataStructures.forEach((ds) => {
    nodes.push({ id: `ds:${ds.id}`, kind: 'ds', label: ds.name, dsId: ds.id })

    ds.categories.forEach((category) => {
      const categoryNodeId = `cat:${ds.id}:${category.id}`
      nodes.push({
        id: categoryNodeId,
        kind: 'category',
        label: category.name,
        dsId: ds.id,
        categoryId: category.id,
      })
      edges.push({ id: `e:${ds.id}->${categoryNodeId}`, source: `ds:${ds.id}`, target: categoryNodeId })

      category.patterns.forEach((pattern) => {
        const patternNodeId = `pat:${ds.id}:${category.id}:${pattern.id}`
        nodes.push({
          id: patternNodeId,
          kind: 'pattern',
          label: pattern.name,
          dsId: ds.id,
          categoryId: category.id,
          patternId: pattern.id,
        })
        edges.push({ id: `e:${categoryNodeId}->${patternNodeId}`, source: categoryNodeId, target: patternNodeId })
      })
    })
  })

  return { nodes, edges }
}
