import _ from 'lodash';

class CursorBuilder {
  constructor(collectionHandler, queryScope) {
    // Vars
    this.collectionHandler = collectionHandler;
    this.queryScope = queryScope;
    this.selectorsStack = {};
    this.fieldsStack = {};
    this.sortsStack = {};
    this.optionsStack = {};
    this.limitValue = false;
    this.skipValue = false;
    // Binds
    this.mergeToStackAndReturnSelf = this.mergeToStackAndReturnSelf.bind(this);
    this.isIdShortcodeFilter = this.isIdShortcodeFilter.bind(this);
    this.isInIdsShortcodeFilter = this.isInIdsShortcodeFilter.bind(this);
    this.getNewSelector = this.getNewSelector.bind(this);
    this.filter = this.filter.bind(this);
    this.fields = this.fields.bind(this);
    this.sorts = this.sorts.bind(this);
    this.options = this.options.bind(this);
    this.cursor = this.cursor.bind(this);
    this.loads = this.loads.bind(this);
  }

  mergeToStackAndReturnSelf(stack, params) {
    _.merge(stack, params);
    return this;
  }

  setVariableAndReturnSelf(name, value) {
    this[name] = value;
    return this;
  }

  isIdShortcodeFilter(name, params) {
    const { filters } = this.collectionHandler;
    return _.isString(name) && !_.has(filters, name) && !_.size(params);
  }

  isInIdsShortcodeFilter(name, params) {
    const { filters } = this.collectionHandler;
    return _.isArray(name) && !_.has(filters, name) && !_.size(params);
  }

  getNewSelector(name, params) {
    const { filters, collection } = this.collectionHandler;
    name = name || 'all';
    if(this.isIdShortcodeFilter(name, params)) {
      params = [name];
      name = 'id';
    } else if(this.isInIdsShortcodeFilter(name, params)) {
      params = [name];
      name = 'in';
    }

    if(!_.has(filters, name)) {
      console.warn(`[QUERY BUILDER] ${name} query was not found for collection ${collection._name}.`);
      return {};
    }
    return filters[name].bind(this.queryScope)(...params);
  }

  filter(name, ...params) {
    const newSelector = this.getNewSelector(name, params);
    return this.mergeToStackAndReturnSelf(this.selectorsStack, newSelector);
  }

  loads(name, ...params) {
    const { dependencies, collection } = this.collectionHandler;
    if(!_.has(dependencies, name)) {
      console.warn(`[QUERY BUILDER] ${name} dependency was not found for collection ${collection._name}.`);
      return false;
    }
    return dependencies[name].bind(this.queryScope)(this.cursor(), ...params);
  }

  fields(...params) {
    const newFields = {};
    _.each(params, (field) => newFields[field] = 1);
    return this.mergeToStackAndReturnSelf(this.fieldsStack, newFields);
  }

  skip(value) { return this.setVariableAndReturnSelf('skipValue', value); }
  limit(value) { return this.setVariableAndReturnSelf('limitValue', value); }
  sorts(params) { return this.mergeToStackAndReturnSelf(this.sortsStack, params); }
  options(params) { return this.mergeToStackAndReturnSelf(this.optionsStack, params); }
  forceTrash() { return this.mergeToStackAndReturnSelf(this.optionsStack, { forceTrash: true }); }

  cursor() {
    const { collection } = this.collectionHandler;
    const options = _.merge(this.optionsStack, { fields: this.fieldsStack, sort: this.sortsStack });
    if(!!this.limitValue) options.limit = this.limitValue;
    if(!!this.skipValue) options.skip = this.skipValue;
    const query = this.selectorsStack;
    return collection.find(query, options);
  }
}

export default CursorBuilder;
