import sys
import json

def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            action = req.get("action")
            if action == "parse_template":
                from parser import parse_template
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
