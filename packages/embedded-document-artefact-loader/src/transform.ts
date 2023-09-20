import { SourceMapGenerator } from "source-map-js";
import { parse } from "graphql";

export function transform(
  source: string,
  sourcePath: string,
  sourceMap: SourceMapGenerator | undefined,
): string | undefined {
  let anyChanges = false;

  if (sourceMap) {
    sourceMap.addMapping({
      original: { line: 1, column: 0 },
      generated: { line: 1, column: 0 },
      source: sourcePath,
    });
  }

  // This represents a chunk of the source either before a graphql tag, inside
  // a graphql tag, or after a graphql tag.
  let lastChunkOffset = 0;
  // This represents the number of lines that have been removed from the
  // generated source due to the removal of graphql tags.
  let lineDelta = 0;

  const result = source.replace(
    /graphql\s*`((?:[^`])*)`/g,
    (taggedTemplateExpression: string, sdl: string, offset: number) => {
      // In the absence of parsing the full JS/TS file, we may run into false
      // positives. We detect this by attempting to parse the tagged template
      // expression. If it fails, we assume it is not a [valid] graphql tag.
      try {
        parse(sdl, { noLocation: true });
      } catch {
        return taggedTemplateExpression;
      }

      anyChanges = true;

      if (sourceMap) {
        addNewLineMappings(
          lastChunkOffset,
          offset,
          source,
          sourceMap,
          lineDelta,
          sourcePath,
        );
      }

      lastChunkOffset = offset + taggedTemplateExpression.length;

      const match = sdl.match(
        /(query|mutation|subscription|fragment)\s+\b(.+?)\b/,
      );
      if (match && match[2]) {
        const generated = `require("./__generated__/${match[2]}.graphql").default`;

        if (sourceMap) {
          const originalStart = offsetToLineColumn(source, offset);
          sourceMap.addMapping({
            original: originalStart,
            generated: {
              line: originalStart.line - lineDelta,
              column: originalStart.column,
            },
            source: sourcePath,
          });

          const originalEndOffset = offset + taggedTemplateExpression.length;
          forEachNewLine(offset, originalEndOffset, source, (offset) => {
            const lineStart = offsetToLineColumn(source, offset);
            sourceMap.addMapping({
              original: lineStart,
              generated: {
                line: originalStart.line - lineDelta,
                column: originalStart.column,
              },
              source: sourcePath,
            });
          });

          sourceMap.addMapping({
            original: offsetToLineColumn(source, originalEndOffset),
            generated: {
              line: originalStart.line - lineDelta,
              column: originalStart.column + generated.length,
            },
            source: sourcePath,
          });

          lineDelta += taggedTemplateExpression.split("\n").length - 1;
        }

        return generated;
      }

      return taggedTemplateExpression;
    },
  );

  if (sourceMap) {
    addNewLineMappings(
      lastChunkOffset,
      source.length,
      source,
      sourceMap,
      lineDelta,
      sourcePath,
    );
  }

  return anyChanges ? result : undefined;
}

function offsetToLineColumn(
  str: string,
  offset: number,
): { line: number; column: number } {
  let line = 1;
  let column = 0;
  for (let i = 0; i < offset; i++) {
    if (str[i] === "\n") {
      line++;
      column = 0;
    } else {
      column++;
    }
  }
  return { line, column };
}

function forEachNewLine(
  start: number,
  end: number,
  source: string,
  callback: (offset: number) => void,
) {
  for (let i = start; i < end; i++) {
    if (source[i] === "\n") {
      callback(i + 1);
    }
  }
}

function addNewLineMappings(
  start: number,
  end: number,
  source: string,
  sourceMap: SourceMapGenerator,
  lineDelta: number,
  sourcePath: string,
) {
  forEachNewLine(start, end, source, (offset) => {
    const lineStart = offsetToLineColumn(source, offset);
    sourceMap.addMapping({
      original: lineStart,
      generated: {
        line: lineStart.line - lineDelta,
        column: lineStart.column,
      },
      source: sourcePath,
    });
  });
}
