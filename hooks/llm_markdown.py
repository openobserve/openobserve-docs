import shutil
from pathlib import Path


def on_post_build(config):
    docs_dir = Path(config["docs_dir"])
    site_dir = Path(config["site_dir"])

    for src in docs_dir.rglob("*.md"):
        rel = src.relative_to(docs_dir)
        dest = site_dir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)

        if rel.name == "index.md" and rel.parent != Path("."):
            flat = site_dir / rel.parent.with_suffix(".md")
            shutil.copy2(src, flat)
