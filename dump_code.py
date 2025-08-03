import os

# File types to include
extensions = {".html", ".js", ".css"}

# Output file
output_file = "project_dump.txt"

with open(output_file, "w", encoding="utf-8") as out:
    for root, _, files in os.walk("."):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                path = os.path.join(root, file)
                out.write(f"\n{'='*40}\n{path}\n{'='*40}\n")
                with open(path, "r", encoding="utf-8") as f:
                    out.write(f.read())
                    out.write("\n")

print(f"✅ Project code dumped to: {output_file}")
