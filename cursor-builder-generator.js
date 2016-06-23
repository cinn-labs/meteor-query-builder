import _ from 'lodash';
import CursorBuilder from './cursor-builder';

class CursorBuilderGenerator {
  constructor(params) {
    // Vars
    this.collection = params.collection;
    this.filters = params.filters || {};
    this.dependencies = params.dependencies || {};
    // Binds
    this.build = this.build.bind(this);
    this.setBasicFilters = this.setBasicFilters.bind(this);
    this.checkFiltersStack = this.checkFiltersStack.bind(this);
    // Preparations
    this.setBasicFilters();
  }

  addDependencies(newDependencies) {
    this.dependencies = _.merge(this.dependencies, newDependencies);
  }

  addFilters(newFilters) {
    this.filters = _.merge(this.filters, newFilters);
  }

  checkFiltersStack(filters) {
    _.each(filters, function(params, name){
      if(_.includes(['all', 'id', 'in'], name)) {
        console.warn(`
          [QUERY BUILDER] ${name} filter can't be used for collection ${collection._name}.
          'all', 'in' and 'id' are default filters already set by this package
        `);
      }
    })
  }

  setBasicFilters() {
    this.filters['all'] = () => ({});
    this.filters['id'] = (_id) => ({ _id });
    this.filters['in'] = (ids) => ({ _id: { $in: ids } });
  }

  build(queryScope) {
    return new CursorBuilder(this, queryScope);
  }
}

export default CursorBuilderGenerator;
