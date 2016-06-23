Package.describe({
  name: 'cinn:query-builder',
  version: '0.2.1',
  summary: 'Simple query generator for meteor apps',
  git: 'https://github.com/cinn-labs/meteor-query-builder',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  const both = ['client', 'server'];
  api.versionsFrom('1.3.3.1');

  api.export('QueryBuilder');

  api.use('ecmascript');
  api.use('meteor-base');

  api.addFiles('query-builder-wrapper.js', both);
});
