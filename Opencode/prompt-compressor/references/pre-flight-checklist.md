# Pre-Flight Checklist — Resource Conservation (Jarvis ASI)

Before ANY operation that consumes disk, network, or compute, run this checklist.
Skip steps only when the task explicitly requires a fresh install/download.

## 1. Python package

```
pip list | grep -i <pkg>
python3 -c "import <pkg>"
apt list --installed 2>/dev/null | grep python3-<pkg>
check sibling venvs (ls ~/.venvs/ ~/.local/share/venvs/)
→ ALL absent → pip install into active venv only
```

## 2. CLI tool

```
which <tool> | command -v <tool>
type <tool>
check builtins: bash, python3 stdlib, jq, sed, awk, perl
apt list --installed 2>/dev/null | grep <tool>
→ ALL absent → install via package manager
```

## 3. Docker image

```
docker images | grep <image>
docker image ls | grep <image>
→ cache exists → reuse
→ absent → docker pull / build
```

## 4. Git repository

```
ls ~/PROGRAMMS/<repo>/
ls ~/<repo>/
→ exists → cd and pull latest
→ absent → git clone --depth 1 (shallow, full only if history needed)
```

## 5. Virtual environment

```
ls ~/.venvs/<project>/
ls <project>/.venv <project>/venv <project>/.venv2
→ exists → activate and use
→ absent → create one per project root, not one per task
```

## 6. Build / dependency cache

```
ls node_modules/ target/ build/ .cargo/
→ exists → reuse, skip install
→ absent → install with --prefer-offline where possible
```

## 7. LLM model / ML artifact

```
ls ~/.cache/huggingface/hub/<model>/
ollama list | grep <model>
ls ~/.local/share/ollama/models/
→ exists → use cached
→ absent → download (prefer GGUF quantized for dev)
```

## 8. Dataset

```
ls ~/.cache/huggingface/datasets/
ls /tmp/<dataset>/
→ exists → use cached
→ absent → download (sample/subset for dev, full for final)
```

## 9. File hygiene

- Created temp files? → delete after use
- Working in home dir (~/)? → move to project dir
- Multiple copies of same file? → keep one, remove duplicates
- Test artifacts (output-*.json, temp.sqlite)? → clean up
