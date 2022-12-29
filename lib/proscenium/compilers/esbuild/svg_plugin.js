import { dirname, basename, join } from 'std/path/mod.ts'
import { camelCase } from 'camelcase'

import {
  readFile,
  resolveWithImportMap,
  httpRegex,
  isBareModule,
  resolveImport
} from '../../utils.js'
import setup from './setup_plugin.js'

/**
 Renders an SVG React component when imported from JSX.
 */
export default setup('svg', (build, { importMap }) => {
  const cwd = build.initialOptions.absWorkingDir
  const publicPath = join(cwd, 'public')

  return [
    {
      type: 'onResolve',
      filter: /\.svg$/,
      async callback(params) {
        // Resolve with import map - if any
        const mappedPath = resolveWithImportMap(importMap, params, cwd)
        if (mappedPath) {
          params.path = mappedPath
        }

        if (httpRegex.test(params.path)) {
          return { path: params.path, namespace: 'url' }
        }

        if (params.kind === 'import-statement' && params.importer.endsWith('.jsx')) {
          if (isBareModule(params.path)) {
            // resolve bare imports
            const result = await resolveImport(params, build)
            return { path: result.path, namespace: 'svg' }
          }

          return { path: join(publicPath, params.path), namespace: 'svg' }
        } else {
          return { path: params.path, external: true }
        }
      }
    },
    {
      type: 'onLoad',
      filter: /.*/,
      namespace: 'svg',
      async callback({ path }) {
        const name = camelCase(basename(path).slice(0, -4), { pascalCase: true })
        const contents = await readFile(path)

        return {
          contents: `
            import { cloneElement, Children } from 'react';
            const svg = ${contents};
            const props = { ...svg.props, className: svg.props.class };
            delete props.class;
            function ${name}() {
              return <svg { ...props }>{Children.only(svg.props.children)}</svg>
            }
            export default ${name}
          `,
          resolveDir: dirname(path),
          loader: 'jsx'
        }
      }
    }
  ]
})