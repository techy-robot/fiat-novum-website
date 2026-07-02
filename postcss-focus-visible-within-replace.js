module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'postcss-focus-visible-within-replace',
    Rule(rule) {
      if (rule.selector && rule.selector.includes('focus-visible-within')) {
        rule.selector = rule.selector.replaceAll('focus-visible-within', 'focus-within');
      }
    }
  }
}
module.exports.postcss = true;
