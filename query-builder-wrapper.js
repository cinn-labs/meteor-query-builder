import CursorBuilderGenerator from './cursor-builder-generator';

QueryBuilder = {
  set: (params) => new CursorBuilderGenerator(params)
};

export default QueryBuilder;
