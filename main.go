package main

/*
struct Result {
	int success;
	char* response;
};
*/
import "C"

import (
	"encoding/json"
	"joelmoss/proscenium/internal/builder"
	"joelmoss/proscenium/internal/resolver"
	"joelmoss/proscenium/internal/types"
	"joelmoss/proscenium/internal/utils"
	"path"
	"strings"
)

// Build the given `path` in the `root`.
//
//   - path - The path to build relative to `root`.
//   - root - The working directory.
//   - baseUrl - base URL of the Rails app. eg. https://example.com
//   - env - The environment (1 = development, 2 = test, 3 = production)
//   - importMap - Path to the import map relative to `root`.
//   - bundle
//   - debug
//
//export build
func build(
	filepath *C.char,
	root *C.char,
	baseUrl *C.char,
	env C.uint,
	importMap *C.char,
	bundle bool,
	debug bool,
) C.struct_Result {
	types.Env = types.Environment(env)

	pathStr := C.GoString(filepath)

	result := builder.Build(builder.BuildOptions{
		Path:          pathStr,
		Root:          C.GoString(root),
		BaseUrl:       C.GoString(baseUrl),
		ImportMapPath: C.GoString(importMap),
		Debug:         debug,
	})

	if len(result.Errors) != 0 {
		j, err := json.Marshal(result.Errors[0])
		if err != nil {
			return C.struct_Result{C.int(0), C.CString(string(err.Error()))}
		}

		return C.struct_Result{C.int(0), C.CString(string(j))}
	}

	contents := string(result.OutputFiles[0].Contents)

	isSourceMap := strings.HasSuffix(pathStr, ".map")
	if isSourceMap {
		return C.struct_Result{C.int(1), C.CString(contents)}
	}

	if utils.IsEncodedUrl(pathStr) {
		contents += "//# sourceMappingURL=" + pathStr + ".map"
	} else {
		sourcemapUrl := path.Base(pathStr)
		if utils.PathIsCss(result.OutputFiles[0].Path) {
			contents += "/*# sourceMappingURL=" + sourcemapUrl + ".map */"
		} else {
			contents += "//# sourceMappingURL=" + sourcemapUrl + ".map"
		}
	}

	return C.struct_Result{C.int(1), C.CString(contents)}
}

// Resolve the given `path` relative to the `root`.
//
//   - path - The path to build relative to `root`.
//   - root - The working directory.
//   - env - The environment (1 = development, 2 = test, 3 = production)
//   - importMap - Path to the import map relative to `root`.
//
//export resolve
func resolve(path *C.char, root *C.char, env C.uint, importMap *C.char) C.struct_Result {
	types.Env = types.Environment(env)

	resolvedPath, err := resolver.Resolve(resolver.Options{
		Path:          C.GoString(path),
		Root:          C.GoString(root),
		ImportMapPath: C.GoString(importMap),
	})
	if err != nil {
		return C.struct_Result{C.int(0), C.CString(string(err.Error()))}
	}

	return C.struct_Result{C.int(1), C.CString(resolvedPath)}
}

func main() {}