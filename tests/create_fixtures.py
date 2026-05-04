from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws.title = "Sheet1"
ws["B3"] = "{{编号}}"
ws["C5"] = "{{姓名}}"
ws["D7"] = "normal_value"  # not a placeholder, should NOT be detected
wb.save("tests/fixtures/sample_template.xlsx")
print("fixture created")
