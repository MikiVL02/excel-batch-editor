import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../python"))

from parser import parse_template

FIXTURE = os.path.join(os.path.dirname(__file__), "../fixtures/sample_template.xlsx")

def test_returns_sheets():
    result = parse_template(FIXTURE)
    assert "sheets" in result
    assert "Sheet1" in result["sheets"]

def test_detects_placeholders():
    result = parse_template(FIXTURE)
    names = [p["name"] for p in result["placeholders"]]
    assert "编号" in names
    assert "姓名" in names

def test_ignores_non_placeholders():
    result = parse_template(FIXTURE)
    names = [p["name"] for p in result["placeholders"]]
    assert "normal_value" not in names

def test_placeholder_has_cell_info():
    result = parse_template(FIXTURE)
    biaohao = next(p for p in result["placeholders"] if p["name"] == "编号")
    assert biaohao["sheet"] == "Sheet1"
    assert biaohao["cell"] == "B3"
