export interface JsonStatDimensionCategory {
  index: Record<string, number> | string[];
  label?: Record<string, string>;
}

export interface JsonStatDimension {
  label?: string;
  category: JsonStatDimensionCategory;
}

export interface JsonStatResponse {
  version?: string;
  class?: string;
  label?: string;
  source?: string;
  updated?: string;
  id: string[];
  size: number[];
  dimension: Record<string, JsonStatDimension>;
  value: Record<string, number | null> | (number | null)[];
  status?: Record<string, string> | string[];
}

export interface JsonStatObservationItem {
  indices: Record<string, string>;
  labels: Record<string, string>;
  value: number | null;
  status?: string;
}

export class EurostatJsonStatParser {
  /**
   * Parse a JSON-stat v2 dataset response into flat observation records with dimension keys and labels.
   */
  public static parse(json: JsonStatResponse): JsonStatObservationItem[] {
    if (!json || !json.id || !json.size || !json.dimension) {
      return [];
    }

    const { id: dimNames, size: dimSizes, dimension: dimObjects, value: values, status: statuses } = json;
    const numDims = dimNames.length;

    // Calculate strides for each dimension in row-major order
    // stride[i] = product of dimSizes[i+1 ... numDims-1]
    const strides: number[] = new Array(numDims);
    let currentStride = 1;
    for (let i = numDims - 1; i >= 0; i--) {
      strides[i] = currentStride;
      currentStride *= dimSizes[i];
    }

    const totalObservations = currentStride;

    // Build inverted index-to-key and index-to-label lookups for each dimension
    const dimKeysByIndex: string[][] = [];
    const dimLabelsByKey: Record<string, string>[] = [];

    for (let i = 0; i < numDims; i++) {
      const dimName = dimNames[i];
      const dim = dimObjects[dimName];
      const keys: string[] = new Array(dimSizes[i]);
      const labels: Record<string, string> = {};

      if (dim && dim.category) {
        const catIndex = dim.category.index;
        if (Array.isArray(catIndex)) {
          for (let k = 0; k < catIndex.length; k++) {
            keys[k] = catIndex[k];
          }
        } else if (catIndex && typeof catIndex === 'object') {
          for (const [code, idx] of Object.entries(catIndex)) {
            keys[idx as number] = code;
          }
        }

        if (dim.category.label) {
          Object.assign(labels, dim.category.label);
        }
      }

      dimKeysByIndex.push(keys);
      dimLabelsByKey.push(labels);
    }

    const results: JsonStatObservationItem[] = [];

    // Helper to get observation value at flat index
    const getValueAt = (flatIdx: number): number | null => {
      if (Array.isArray(values)) {
        return values[flatIdx] ?? null;
      }
      if (values && typeof values === 'object') {
        const val = values[String(flatIdx)];
        return val !== undefined ? val : null;
      }
      return null;
    };

    // Helper to get status flag at flat index
    const getStatusAt = (flatIdx: number): string | undefined => {
      if (!statuses) return undefined;
      if (Array.isArray(statuses)) {
        return statuses[flatIdx] || undefined;
      }
      return statuses[String(flatIdx)] || undefined;
    };

    // Walk through all possible index combinations
    for (let flatIdx = 0; flatIdx < totalObservations; flatIdx++) {
      let remainder = flatIdx;
      const indices: Record<string, string> = {};
      const labels: Record<string, string> = {};

      for (let d = 0; d < numDims; d++) {
        const dimCoord = Math.floor(remainder / strides[d]);
        remainder %= strides[d];

        const dimName = dimNames[d];
        const code = dimKeysByIndex[d][dimCoord] || String(dimCoord);
        const label = dimLabelsByKey[d][code] || code;

        indices[dimName] = code;
        labels[dimName] = label;
      }

      const val = getValueAt(flatIdx);
      const stat = getStatusAt(flatIdx);

      // Only push non-empty or recorded points
      if (val !== null || stat !== undefined) {
        results.push({
          indices,
          labels,
          value: val,
          status: stat
        });
      }
    }

    return results;
  }
}
