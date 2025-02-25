/* eslint-disable security/detect-object-injection */
const _has = require("lodash/has");
const { intersects } = require("../utl/array-util");
const { replaceGroupPlaceholders } = require("../utl/regex-util");

function propertyEquals(pRule, pDependency, pProperty) {
  // The properties can be booleans, so we can't use !pRule.to[pProperty]
  if (_has(pRule.to, pProperty)) {
    return pDependency[pProperty] === pRule.to[pProperty];
  }
  return true;
}

function propertyMatches(pRule, pDependency, pRuleProperty, pProperty) {
  return Boolean(
    !pRule.to[pRuleProperty] ||
      (pDependency[pProperty] &&
        pDependency[pProperty].match(pRule.to[pRuleProperty]))
  );
}

function propertyMatchesNot(pRule, pDependency, pRuleProperty, pProperty) {
  return Boolean(
    !pRule.to[pRuleProperty] ||
      (pDependency[pProperty] &&
        !pDependency[pProperty].match(pRule.to[pRuleProperty]))
  );
}

function fromPath(pRule, pModule) {
  return Boolean(!pRule.from.path || pModule.source.match(pRule.from.path));
}

function fromPathNot(pRule, pModule) {
  return Boolean(
    !pRule.from.pathNot || !pModule.source.match(pRule.from.pathNot)
  );
}

function modulePath(pRule, pModule) {
  return Boolean(!pRule.module.path || pModule.source.match(pRule.module.path));
}

function modulePathNot(pRule, pModule) {
  return Boolean(
    !pRule.module.pathNot || !pModule.source.match(pRule.module.pathNot)
  );
}

function _toPath(pRule, pString, pGroups = []) {
  return Boolean(
    !pRule.to.path ||
      pString.match(replaceGroupPlaceholders(pRule.to.path, pGroups))
  );
}

function toPath(pRule, pDependency, pGroups) {
  return _toPath(pRule, pDependency.resolved, pGroups);
}

function toModulePath(pRule, pModule, pGroups) {
  return _toPath(pRule, pModule.source, pGroups);
}

function _toPathNot(pRule, pString, pGroups = []) {
  return (
    !Boolean(pRule.to.pathNot) ||
    !pString.match(replaceGroupPlaceholders(pRule.to.pathNot, pGroups))
  );
}

function toPathNot(pRule, pDependency, pGroups) {
  return _toPathNot(pRule, pDependency.resolved, pGroups);
}

function toModulePathNot(pRule, pModule, pGroups) {
  return _toPathNot(pRule, pModule.source, pGroups);
}

function toDependencyTypes(pRule, pDependency) {
  return Boolean(
    !pRule.to.dependencyTypes ||
      intersects(pDependency.dependencyTypes, pRule.to.dependencyTypes)
  );
}

function toDependencyTypesNot(pRule, pDependency) {
  return Boolean(
    !pRule.to.dependencyTypesNot ||
      !intersects(pDependency.dependencyTypes, pRule.to.dependencyTypesNot)
  );
}

const removeLast = (_via, pIndex, pArray) => pIndex !== pArray.length - 1;

function toVia(pRule, pDependency, pGroups) {
  return Boolean(
    !pRule.to.via ||
      (pDependency.cycle &&
        pDependency.cycle
          // the last in the cycle is always the module itself, which, for
          // via & viaNot checks isn't very useful
          .filter(removeLast)
          .some((pVia) =>
            pVia.match(replaceGroupPlaceholders(pRule.to.via, pGroups))
          ))
  );
}

function toViaOnly(pRule, pDependency, pGroups) {
  return Boolean(
    !pRule.to.viaOnly ||
      (pDependency.cycle &&
        pDependency.cycle
          // the last in the cycle is always the module itself, which, for
          // via & viaNot checks isn't very useful
          .filter(removeLast)
          .every((pVia) =>
            pVia.match(replaceGroupPlaceholders(pRule.to.viaOnly, pGroups))
          ))
  );
}

function toViaNot(pRule, pDependency, pGroups) {
  return Boolean(
    !pRule.to.viaNot ||
      (pDependency.cycle &&
        !pDependency.cycle
          // the last in the cycle is always the module itself, which, for
          // via & viaNot checks isn't very useful
          .filter(removeLast)
          .some((pVia) =>
            pVia.match(replaceGroupPlaceholders(pRule.to.viaNot, pGroups))
          ))
  );
}

function toviaSomeNot(pRule, pDependency, pGroups) {
  return Boolean(
    !pRule.to.viaSomeNot ||
      (pDependency.cycle &&
        !pDependency.cycle
          // the last in the cycle is always the module itself, which, for
          // via & viaNot checks isn't very useful
          .filter(removeLast)
          .every((pVia) =>
            pVia.match(replaceGroupPlaceholders(pRule.to.viaSomeNot, pGroups))
          ))
  );
}

function toIsMoreUnstable(pRule, pModule, pDependency) {
  if (_has(pRule, "to.moreUnstable")) {
    return (
      (pRule.to.moreUnstable &&
        pModule.instability < pDependency.instability) ||
      (!pRule.to.moreUnstable && pModule.instability >= pDependency.instability)
    );
  }
  return true;
}

function matchesMoreThanOneDependencyType(pRule, pDependency) {
  if (_has(pRule.to, "moreThanOneDependencyType")) {
    return (
      pRule.to.moreThanOneDependencyType ===
      pDependency.dependencyTypes.length > 1
    );
  }
  return true;
}

module.exports = {
  replaceGroupPlaceholders,
  propertyEquals,
  propertyMatches,
  propertyMatchesNot,
  fromPath,
  fromPathNot,
  toPath,
  toModulePath,
  modulePath,
  modulePathNot,
  toPathNot,
  toModulePathNot,
  toDependencyTypes,
  toDependencyTypesNot,
  toVia,
  toViaOnly,
  toViaNot,
  toviaSomeNot,
  toIsMoreUnstable,
  matchesMoreThanOneDependencyType,
};
