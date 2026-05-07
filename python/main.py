import sys
import json
import io

# Windows 默认编码不是 UTF-8，强制设置
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8")
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", line_buffering=True)

def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            action = req.get("action")
            if action == "parse_template":
                from xl_parser import parse_template
                result = parse_template(req["file_path"])
            elif action == "generate":
                from generator import generate
                result = generate(req)
            else:
                result = {"error": f"unknown action: {action}"}
        except Exception as e:
            result = {"error": str(e)}
        print(json.dumps(result, ensure_ascii=False), flush=True)

if __name__ == "__main__":
    main()
