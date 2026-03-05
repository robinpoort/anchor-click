const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src', 'anchorClick.js');
const DIST = path.join(__dirname, 'dist');

async function build() {
  // Ensure dist/ exists
  if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST);
  }

  const source = fs.readFileSync(SRC, 'utf8');

  // Copy source to dist/
  fs.writeFileSync(path.join(DIST, 'anchorClick.js'), source);
  console.log(`dist/anchorClick.js: ${source.length} bytes`);

  // Minified build
  const minified = await minify(source, {
    compress: { passes: 2 },
    mangle: true,
    output: { comments: false },
    sourceMap: {
      filename: 'anchorClick.min.js',
      url: 'anchorClick.min.js.map'
    }
  });
  fs.writeFileSync(path.join(DIST, 'anchorClick.min.js'), minified.code);
  fs.writeFileSync(path.join(DIST, 'anchorClick.min.js.map'), minified.map);
  console.log(`dist/anchorClick.min.js: ${minified.code.length} bytes`);
  console.log(`dist/anchorClick.min.js.map: ${minified.map.length} bytes`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
