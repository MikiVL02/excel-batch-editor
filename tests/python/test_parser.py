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

def test_multiple_placeholders_in_one_cell():
    result = parse_template(FIXTURE)
    names = [p["name"] for p in result["placeholders"]]
    assert "客户名" in names
    assert "编号" in names  # 已在其他地方存在，但也在 E9 中
    # 验证 E9 中的两个占位符都被检测到
    e9_placeholders = [p for p in result["placeholders"] if p["cell"] == "E9"]
    assert len(e9_placeholders) == 2
