# 7. PERMISSIONS

## Permission System

Tools require explicit permissions to access sensitive resources.

## Permission Types

| Permission | Description |
|------------|-------------|
| `Network` | Outbound HTTP/HTTPS requests |
| `FileSystem` | Read/write files (with allowed paths) |
| `Shell` | Execute system commands |
| `VaultRead` | Read secrets from vault |
| `VaultWrite` | Write secrets (rare) |

## Declaring Permissions

In `SKILL.md`:

```yaml
permissions:
  - Network
  - FileSystemRead
```

Or use wildcards:

```yaml
permissions:
  - FileSystemRead: "**/data/*"
```

## Security Notes

- Users must approve permissions on first use
- Over-permissioning discourages adoption
- Principle of least privilege applies

## Common Combinations

```
API tool: Network + VaultRead
File converter: FileSystemRead + FileSystemWrite
Data pipeline: All permissions
```

→ Next: [HTTP Requests](./08-http.md) | [File System](./09-filesystem.md)