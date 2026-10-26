# 4. PARAMETERS

## JSON Schema Definition

In `SKILL.md`, define the `parameters.schema` property using JSON Schema Draft 7:

```yaml
parameters:
  schema:
    type: object
    properties:
      url:
        type: string
        description: API endpoint
      timeout:
        type: number
        default: 5000
        description: Request timeout in ms
    required: [url]
```

## Supported Types

- `string` - Text values
- `number` / `integer` - Numeric values
- `boolean` - True/false
- `array` - Lists of values
- `object` - Nested objects

## Advanced Features

### Enum Values

```yaml
properties:
  level:
    type: string
    enum: [low, medium, high]
```

### Nested Objects

```yaml
properties:
  config:
    type: object
    properties:
      host:
        type: string
      port:
        type: number
```

### Array Items

```yaml
properties:
  tags:
    type: array
    items:
      type: string
```

## Validation

Roo validates input before calling your tool. Invalid input shows an error message.

→ Next: [Dependencies](./05-dependencies.md) | [Vault Access](./06-vault.md)