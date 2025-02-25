/* eslint-disable security/detect-object-injection */
const get = require("lodash/get");
const clone = require("lodash/clone");
const has = require("lodash/has");
const normalizeREProperties = require("../utl/normalize-re-properties");
const defaults = require("./defaults.js");

function uniq(pArray) {
  return [...new Set(pArray)];
}

function normalizeFilterOption(pFilterOption) {
  let lReturnValue = pFilterOption || {};

  if (typeof lReturnValue === "string" || Array.isArray(lReturnValue)) {
    lReturnValue = {
      path: lReturnValue,
    };
  }
  return normalizeREProperties(lReturnValue, ["path"]);
}

function normalizeReporterOptions(pReporterOptions) {
  const lNormalizeableOptions = [
    "archi.collapsePattern",
    "archi.filters.includeOnly.path",
    "archi.filters.focus.path",
    "archi.filters.exclude.path",
    "dot.collapsePattern",
    "dot.filters.includeOnly.path",
    "dot.filters.focus.path",
    "dot.filters.exclude.path",
    "ddot.collapsePattern",
    "ddot.filters.includeOnly.path",
    "ddot.filters.focus.path",
    "ddot.filters.exclude.path",
  ];

  return normalizeREProperties(pReporterOptions, lNormalizeableOptions);
}

function normalizeFilterOptions(pOptions, pFilterOptionKeys) {
  let lReturnValue = { ...pOptions };

  for (let lFilterOptionKey of pFilterOptionKeys) {
    if (pOptions[lFilterOptionKey]) {
      lReturnValue[lFilterOptionKey] = normalizeFilterOption(
        lReturnValue[lFilterOptionKey]
      );
    }
  }
  return lReturnValue;
}

function normalizeCollapse(pCollapse) {
  let lReturnValue = pCollapse;
  const lOneOrMoreNonSlashes = "[^/]+";
  const lFolderPattern = `${lOneOrMoreNonSlashes}/`;
  const lFolderBelowNodeModules = `node_modules/${lOneOrMoreNonSlashes}`;
  const lSingleDigitRe = /^\d$/;

  if (typeof pCollapse === "number" || pCollapse.match(lSingleDigitRe)) {
    lReturnValue = `${lFolderBelowNodeModules}|^${lFolderPattern.repeat(
      Number.parseInt(pCollapse, 10)
    )}`;
  }
  return lReturnValue;
}

function hasMetricsRule(pRule) {
  // TODO: philosophy: is a rule with 'folder' in it a metrics rule?
  //       Or is it a misuse to ensure folder derivations (like cycles) get
  //       kicked off?
  return (
    has(pRule, "to.moreUnstable") || get(pRule, "scope", "module") === "folder"
  );
}

function ruleSetHasMetricsRule(pRuleSet) {
  const lRuleSet = pRuleSet || {};
  return (
    (lRuleSet.forbidden || []).some(hasMetricsRule) ||
    (lRuleSet.allowed || []).some(hasMetricsRule)
  );
}

/**
 * Determines whether (instability) metrics should be calculated
 *
 * @param {import('../../../types/options').ICruiseOptions pOptions
 * @returns Boolean
 */
function shouldCalculateMetrics(pOptions) {
  return (
    pOptions.metrics ||
    pOptions.outputType === "metrics" ||
    ruleSetHasMetricsRule(pOptions.ruleSet)
  );
}

/**
 *
 * @param {Partial <import('../../../types/options').ICruiseOptions>} pOptions
 * @returns {import('../../../types/options').ICruiseOptions}
 */
function normalizeCruiseOptions(pOptions) {
  /** @type {import('../../../types/options').ICruiseOptions} */
  let lReturnValue = {
    baseDir: process.cwd(),
    ...defaults,
    ...pOptions,
  };

  lReturnValue.maxDepth = Number.parseInt(lReturnValue.maxDepth, 10);
  lReturnValue.moduleSystems = uniq(lReturnValue.moduleSystems);
  if (has(lReturnValue, "collapse")) {
    lReturnValue.collapse = normalizeCollapse(lReturnValue.collapse);
  }
  // TODO: further down the execution path code still relies on .doNotFollow
  //       and .exclude existing. We should treat them the same as the
  //       other two filters (so either make all exist always or only
  //       when they're actually defined)
  lReturnValue.doNotFollow = normalizeFilterOption(lReturnValue.doNotFollow);
  lReturnValue.exclude = normalizeFilterOption(lReturnValue.exclude);
  lReturnValue.extraExtensionsToScan = lReturnValue.extraExtensionsToScan || [];
  lReturnValue = normalizeFilterOptions(lReturnValue, ["focus", "includeOnly"]);

  lReturnValue.exoticRequireStrings = uniq(lReturnValue.exoticRequireStrings);
  if (lReturnValue.reporterOptions) {
    lReturnValue.reporterOptions = normalizeReporterOptions(
      lReturnValue.reporterOptions
    );
  }
  lReturnValue.metrics = shouldCalculateMetrics(pOptions);

  return lReturnValue;
}

function normalizeFormatOptions(pFormatOptions) {
  const lFormatOptions = clone(pFormatOptions);

  if (has(lFormatOptions, "collapse")) {
    lFormatOptions.collapse = normalizeCollapse(lFormatOptions.collapse);
  }
  return normalizeFilterOptions(lFormatOptions, [
    "exclude",
    "focus",
    "includeOnly",
  ]);
}

module.exports = {
  normalizeCruiseOptions,
  normalizeFormatOptions,
};
