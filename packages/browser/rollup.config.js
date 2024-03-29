import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import license from "rollup-plugin-license";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import postcss from "rollup-plugin-postcss";

const commitHash = require("child_process")
  .execSync("git rev-parse --short HEAD", { encoding: "utf-8" })
  .trim();

const terserInstance = terser({
  mangle: {
    // captureExceptions and captureMessage are public API methods and they don't need to be listed here
    // as mangler doesn't touch user-facing thing, however sentryWrapped is not, and it would be mangled into a minified version.
    // We need those full names to correctly detect our internal frames for stripping.
    // I listed all of them here just for the clarity sake, as they are all used in the frames manipulation process.
    reserved: ["captureException", "captureMessage", "sentryWrapped"],
    properties: {
      regex: /^_[^_]/
    }
  }
});

const paths = {
  "@partial/rrweb": ["../rrweb/src"],
  "@partial/rrweb-snapshot": ["../rrweb-snapshot/src"]
};

const plugins = [
  typescript({
    tsconfig: "tsconfig.build.json",
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        declarationMap: false,
        module: "ES2015",
        paths
      }
    },
    include: ["*.ts+(|x)", "**/*.ts+(|x)", "../**/*.ts+(|x)"]
  }),
  postcss({
    extract: true,
    minimize: true,
    sourceMap: "inline"
  }),
  resolve({
    mainFields: ["module"]
  }),
  commonjs()
];

const bundleConfig = {
  input: "src/index.ts",
  output: {
    format: "iife",
    name: "Partial",
    sourcemap: true,
    strict: false
  },
  context: "window",
  plugins: [
    ...plugins,
    license({
      sourcemap: true,
      banner: `/*! @partial/browser <%= pkg.version %> (${commitHash}) | https://github.com/unnKoel/partial-javascript */`
    })
  ]
};

export default [
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: "build/bundle.js"
    }
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: "build/bundle.min.js"
    },
    // Uglify has to be at the end of compilation, BUT before the license banner
    plugins: bundleConfig.plugins
      .slice(0, -1)
      .concat(terserInstance)
      .concat(bundleConfig.plugins.slice(-1))
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: "build/bundle.es6.js"
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.build.json",
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
            module: "ES2015",
            paths,
            target: "es6"
          }
        },
        include: ["*.ts+(|x)", "**/*.ts+(|x)", "../**/*.ts+(|x)"]
      }),
      ...plugins.slice(1)
    ]
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: "build/bundle.es6.min.js"
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.build.json",
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
            module: "ES2015",
            paths,
            target: "es6"
          }
        },
        include: ["*.ts+(|x)", "**/*.ts+(|x)", "../**/*.ts+(|x)"]
      }),
      ...plugins
        .slice(1)
        .slice(0, -1)
        .concat(terserInstance)
        .concat(bundleConfig.plugins.slice(-1))
    ]
  }
];
