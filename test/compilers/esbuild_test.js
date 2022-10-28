import { assertRejects, assertStringIncludes } from 'std/testing/asserts.ts'
import { assertSnapshot } from 'std/testing/snapshot.ts'
import { join } from 'std/path/mod.ts'
import { beforeEach, describe, it } from 'std/testing/bdd.ts'

import main from '../../lib/proscenium/compilers/esbuild.js'
import ArgumentError from '../../lib/proscenium/compilers/esbuild/argument_error.js'

const root = join(Deno.cwd(), 'test', 'internal')
const lightningcssBin = join(Deno.cwd(), 'bin', 'lightningcss')

describe('compilers/esbuild', () => {
  beforeEach(() => {
    Deno.env.set('RAILS_ENV', 'test')
    Deno.env.set('PROSCENIUM_TEST', 'test')
  })

  it('throws without any arguments', async () => {
    await assertRejects(async () => await main(), ArgumentError, 'pathsRequired')
  })

  it('throws without array of paths', async () => {
    await assertRejects(async () => await main('foo/bar'), ArgumentError, 'pathsRequired')
  })

  it('throws without root option', async () => {
    await assertRejects(async () => await main(['**/*.js']), ArgumentError, 'rootRequired')
  })

  it('throws without lightningcssBin option', async () => {
    await assertRejects(
      async () => await main(['**/*.js'], { root: 'foo/bar' }),
      ArgumentError,
      'lightningcssBinRequired:'
    )
  })

  it('throws with unknown root', async () => {
    await assertRejects(
      async () => await main(['**/*.js'], { root: 'foo/bar', lightningcssBin }),
      ArgumentError,
      'rootUnknown'
    )
  })

  it('unknown path', { ignore: true }, async t => {
    await assertRejects(
      async () => await main(['lib/unknown.jsx'], { root, lightningcssBin }),
      Error,
      'Could not resolve'
    )
  })

  it('Successful JSX build', async t => {
    const result = await main(['lib/component.jsx'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('Import bare module', async t => {
    const result = await main(['lib/import_node_module.js'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('allows returns error on unknown bare module', async t => {
    const result = await main(['lib/import_unknown_node_module.js'], { root, lightningcssBin })

    await assertSnapshot(t, result)
  })

  it('resolves nested node modules', async t => {
    const result = await main(['node_modules/@react-aria/button'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('Import relative module', async t => {
    const result = await main(['lib/import_relative_module.js'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('Import absolute module', async t => {
    const result = await main(['lib/import_absolute_module.js'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('Import remote module', async t => {
    const result = await main(['lib/import_remote_module.js'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  describe('import map', () => {
    it('from json', async t => {
      const result = await main(['lib/import_map.js'], {
        root,
        lightningcssBin,
        importMap: 'config/import_maps/as.json'
      })

      await assertSnapshot(t, new TextDecoder().decode(result))
    })

    it('from js', async t => {
      const result = await main(['lib/import_map_as_js.js'], {
        root,
        lightningcssBin,
        importMap: 'config/import_maps/as.js'
      })

      assertStringIncludes(new TextDecoder().decode(result), 'import pkg from "/lib/foo2.js";')
    })

    it('maps imports via trailing slash', async t => {
      const result = await main(['lib/component.jsx'], {
        root,
        lightningcssBin,
        importMap: 'config/import_maps/trailing_slash_import.json'
      })

      assertStringIncludes(
        new TextDecoder().decode(result),
        'import { jsx } from "https://esm.sh/react@18.2.0/jsx-runtime"'
      )
    })

    it('resolves imports from a node_module', async t => {
      const result = await main(['node_modules/is-ip/index.js'], {
        root,
        lightningcssBin,
        importMap: 'config/import_maps/npm.json'
      })

      await assertSnapshot(t, new TextDecoder().decode(result))
    })

    it('supports scopes', async t => {
      const result = await main(['lib/import_map/scopes.js'], {
        root,
        lightningcssBin,
        importMap: 'config/import_maps/scopes.json'
      })

      await assertSnapshot(t, new TextDecoder().decode(result))
    })
  })

  it('Import relative module without extension', async t => {
    const result = await main(['lib/import_relative_module_without_extension.js'], {
      root,
      lightningcssBin
    })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('Import absolute module without extension', async t => {
    const result = await main(['lib/import_absolute_module_without_extension.js'], {
      root,
      lightningcssBin
    })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('Import css module from JS', async t => {
    const result = await main(['lib/import_css_module.js'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('de-dupes side loaded ViewComponent default stylesheet - regular', async t => {
    const result = await main(['app/components/basic_react_component.jsx'], {
      root,
      lightningcssBin
    })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('de-dupes side loaded ViewComponent default stylesheet - sidecar', async t => {
    const result = await main(['app/components/basic_react/component.jsx'], {
      root,
      lightningcssBin
    })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('Import css from JS', async t => {
    const result = await main(['lib/import_css.js'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  it('Import css from jsx', async t => {
    const result = await main(['lib/import_css.jsx'], { root, lightningcssBin })

    await assertSnapshot(t, new TextDecoder().decode(result))
  })

  describe('?bundle-all query string', () => {
    it('js import', async t => {
      const result = await main(['lib/bundle_all_import/index.js'], {
        root,
        lightningcssBin,
        importMap: 'config/import_maps/bundled.json'
      })

      await assertSnapshot(t, new TextDecoder().decode(result))
    })
  })

  describe('?bundle query string', () => {
    it('js import', async t => {
      const result = await main(['lib/bundle_import/index.js'], {
        root,
        lightningcssBin,
        importMap: 'config/import_maps/bundled.json'
      })

      await assertSnapshot(t, new TextDecoder().decode(result))
    })

    it('css import', async t => {
      const result = await main(['lib/bundle_import.css'], {
        root,
        lightningcssBin,
        importMap: 'config/import_maps/bundled.json'
      })

      await assertSnapshot(t, new TextDecoder().decode(result))
    })
  })
})
