const { minify } = require('terser');
const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const SRC = join(__dirname, 'src', 'clickDelegation.js');
const SRC_TYPES = join(__dirname, 'src', 'clickDelegation.d.ts');
const DIST = join(__dirname, 'dist');

async function build() {
  mkdirSync(DIST, { recursive: true });

  const source = readFileSync(SRC, 'utf8');

  // Copy source to dist/
  writeFileSync(join(DIST, 'clickDelegation.js'), source);
  console.log(`dist/clickDelegation.js: ${source.length} bytes`);

  // Copy types to dist/
  const types = readFileSync(SRC_TYPES, 'utf8');
  writeFileSync(join(DIST, 'clickDelegation.d.ts'), types);
  console.log(`dist/clickDelegation.d.ts: ${types.length} bytes`);

  // ESM build — extract the factory function from the UMD wrapper
  const factoryStart = source.indexOf(', function (window) {') + 2;
  const factoryEnd = source.lastIndexOf('\n});');
  const factory = source.slice(factoryStart, factoryEnd).trimEnd();
  const esmSource = `const clickDelegation = (${factory})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);\n\nexport default clickDelegation;\n`;
  writeFileSync(join(DIST, 'clickDelegation.esm.js'), esmSource);
  console.log(`dist/clickDelegation.esm.js: ${esmSource.length} bytes`);

  // Minified build
  const minified = await minify(source, {
    compress: { passes: 2 },
    mangle: true,
    output: { comments: false },
    sourceMap: {
      filename: 'clickDelegation.min.js',
      url: 'clickDelegation.min.js.map'
    }
  });
  writeFileSync(join(DIST, 'clickDelegation.min.js'), minified.code);
  writeFileSync(join(DIST, 'clickDelegation.min.js.map'), minified.map);
  console.log(`dist/clickDelegation.min.js: ${minified.code.length} bytes`);
  console.log(`dist/clickDelegation.min.js.map: ${minified.map.length} bytes`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
