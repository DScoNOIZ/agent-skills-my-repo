# 5. DEPENDENCIES

## Using npm Packages

Create `package.json` in skill directory:

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0"
  }
}
```

Roo runs `npm install` automatically on skill load.

## TypeScript Support

1. Add `tsconfig.json`
2. Roo compiles on-the-fly (no build step needed)
3. Use `import` statements normally

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

## Native Modules

Native Node.js addons are supported but require build tools:
- Python 3
- C++ compiler (build-essential on Linux, Xcode on macOS)

## Version Management

- Use semantic versioning in `package.json`
- Lock versions with exact numbers for production skills
- Update manually via `npm update` in skill directory

→ Next: [Vault Access](./06-vault.md) | [Permissions](./07-permissions.md)