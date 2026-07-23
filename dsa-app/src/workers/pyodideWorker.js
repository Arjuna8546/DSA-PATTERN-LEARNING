/* eslint-disable no-restricted-globals */
// Classic (non-module) worker so importScripts works for the Pyodide CDN bundle.

const PYODIDE_VERSION = 'v0.26.4'
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`

async function loadPyodideOnce() {
  if (!self.pyodide) {
    importScripts(`${PYODIDE_INDEX_URL}pyodide.js`)
    // eslint-disable-next-line no-undef
    self.pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL })
  }
  return self.pyodide
}

async function runTests({ code, functionName, testCases }) {
  const pyodide = await loadPyodideOnce()
  pyodide.globals.set('__user_code__', code)
  pyodide.globals.set('__function_name__', functionName)
  pyodide.globals.set('__test_cases_json__', JSON.stringify(testCases))

  const driver = `
import json, io, traceback, contextlib

def __to_jsonable(obj):
    if isinstance(obj, (tuple, list)):
        return [__to_jsonable(x) for x in obj]
    if isinstance(obj, dict):
        return {k: __to_jsonable(v) for k, v in obj.items()}
    return obj

__test_cases__ = json.loads(__test_cases_json__)
__user_ns__ = {}
__setup_error__ = None
__fn__ = None

try:
    exec(__user_code__, __user_ns__)
    __fn__ = __user_ns__.get(__function_name__)
    if __fn__ is None:
        raise NameError("Could not find a function named '" + __function_name__ + "' in your code")
except Exception as e:
    __setup_error__ = {
        "type": type(e).__name__,
        "message": str(e),
        "traceback": traceback.format_exc(),
    }

__results__ = []
if __fn__ is not None:
    for __case__ in __test_cases__:
        __stdout__ = io.StringIO()
        __entry__ = {"input": __case__["input"], "expected": __case__["expected"]}
        try:
            with contextlib.redirect_stdout(__stdout__):
                __actual__ = __fn__(*__case__["input"])
            __actual_jsonable__ = __to_jsonable(__actual__)
            __entry__["actual"] = __actual_jsonable__
            __entry__["passed"] = __actual_jsonable__ == __case__["expected"]
            __entry__["error"] = None
        except Exception as e:
            __entry__["actual"] = None
            __entry__["passed"] = False
            __entry__["error"] = {
                "type": type(e).__name__,
                "message": str(e),
                "traceback": traceback.format_exc(),
            }
        __entry__["stdout"] = __stdout__.getvalue()
        __results__.append(__entry__)

json.dumps({"setupError": __setup_error__, "results": __results__})
`
  const resultJson = await pyodide.runPythonAsync(driver)
  return JSON.parse(resultJson)
}

async function lintCode(code) {
  const pyodide = await loadPyodideOnce()
  pyodide.globals.set('__lint_code__', code)

  const driver = `
import json

__lint_result__ = None
try:
    compile(__lint_code__, '<string>', 'exec')
except SyntaxError as e:
    __lint_result__ = {
        "message": e.msg,
        "line": e.lineno or 1,
        "col": e.offset or 1,
    }

json.dumps(__lint_result__)
`
  const resultJson = await pyodide.runPythonAsync(driver)
  return JSON.parse(resultJson)
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data
  try {
    if (type === 'init') {
      await loadPyodideOnce()
      self.postMessage({ id, type: 'result', payload: { ready: true } })
    } else if (type === 'run') {
      const result = await runTests(payload)
      self.postMessage({ id, type: 'result', payload: result })
    } else if (type === 'lint') {
      const result = await lintCode(payload.code)
      self.postMessage({ id, type: 'result', payload: result })
    }
  } catch (err) {
    self.postMessage({ id, type: 'error', payload: err && err.message ? err.message : String(err) })
  }
}
