# chatboot · plugins de Claude Code

Marketplace de plugins de Claude Code. Por ahora contiene uno:

- **[codeandchill-ui](plugins/codeandchill-ui/)**: desarrolla interfaces con el estilo de las
  plantillas que se venden en codeandchill.store. Captura su ADN visual de las demos y lo aplica
  a interfaces nuevas, con verificación automática de fidelidad.

## Instalación

En Claude Code:

```
/plugin marketplace add bepignus/chatboot
/plugin install codeandchill-ui@chatboot
```

Sin marketplace, copia las skills a tu carpeta personal:

```bash
cp -r plugins/codeandchill-ui/skills/* ~/.claude/skills/
```

## Uso

1. **Capturar el estilo** (una vez, y cada vez que quieras añadir productos):

   ```
   /codeandchill-ui:capture https://codeandchill.store
   ```

   O pásale URLs de demos concretas, la carpeta de una plantilla comprada o capturas de pantalla.
   Claude ejecuta el extractor, revisa las capturas, escribe una ficha por producto y sintetiza
   la guía del catálogo y los tokens (`tokens.css`, tema de Tailwind v4 y preset de v3).

   El catálogo ya está capturado (2026-11-05). Repite este paso solo para añadir productos o
   refrescar la guía. Conviene hacerlo **dentro de este repo** para que la guía quede versionada en
   `plugins/codeandchill-ui/skills/codeandchill-ui/references/`, y luego hacer commit. Si capturas
   desde otro proyecto, el resultado se guarda en `.codeandchill/` de ese proyecto.

2. **Construir**:

   ```
   /codeandchill-ui:ui landing para mi app de reservas, con pricing y FAQ
   ```

   También se activa sola si pides algo "estilo codeandchill" o "como las plantillas de Code & Chill".

## Estructura

```
.claude-plugin/marketplace.json
plugins/codeandchill-ui/
├── .claude-plugin/plugin.json
├── commands/                       # /codeandchill-ui:capture, /codeandchill-ui:ui
├── skills/
│   ├── capture-product-style/      # captura → fichas → guía + tokens
│   │   ├── SKILL.md
│   │   ├── references/             # plantillas de ficha y de guía
│   │   └── scripts/                # capture_style.mjs, compare_style.mjs
│   └── codeandchill-ui/            # construir con el estilo
│       ├── SKILL.md
│       └── references/             # style-guide.md, tokens-contract.md, build-checklist.md, products/
└── tests/                          # smoke test con fixtures neutros
```

Las capturas crudas (`.captures/`) no se versionan: contienen material de terceros y solo sirven
para el análisis local.
