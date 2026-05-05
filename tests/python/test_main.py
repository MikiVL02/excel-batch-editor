import sys, os, json, subprocess

PYTHON = sys.executable
MAIN = os.path.join(os.path.dirname(__file__), "../../python/main.py")
FIXTURE = os.path.join(os.path.dirname(__file__), "../fixtures/sample_template.xlsx")

def _call(payload: dict) -> dict:
    proc = subprocess.run(
        [PYTHON, MAIN],
        input=json.dumps(payload) + "\n",
        capture_output=True,
        text=True,
        timeout=10,
    )
    return json.loads(proc.stdout.strip())

def test_parse_template_via_stdin():
    result = _call({"action": "parse_template", "file_path": FIXTURE})
    assert "sheets" in result
    assert "Sheet1" in result["sheets"]

def test_unknown_action_returns_error():
    result = _call({"action": "nonexistent"})
    assert "error" in result
