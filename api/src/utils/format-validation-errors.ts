export const formatValidationErrors = (
  validation: {
    instancePath: string
    message?: string
  }[],
) => {
  return validation.reduce<Record<string, string>>((errors, issue) => {
    const field = issue.instancePath.replace(/^\//, '')

    if (!errors[field]) {
      errors[field] = ''
    }

    if (issue.message) {
      errors = {
        // biome-ignore lint/performance/noAccumulatingSpread: This accumulator contains only validation fields, so the performance impact is negligible.
        ...errors,
        [field]: issue.message,
      }
    }

    return errors
  }, {})
}
