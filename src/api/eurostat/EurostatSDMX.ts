import { Dataset, DatasetDimension } from '../../models/Dataset';

export interface SdmxDataflowItem {
  id: string;
  agencyID: string;
  version: string;
  names?: Record<string, string>;
  descriptions?: Record<string, string>;
  structure?: string;
}

export class EurostatSDMXParser {
  /**
   * Parse SDMX 3.0 structure/dataflow response
   */
  public static parseDataflows(sdmxJson: unknown): Dataset[] {
    if (!sdmxJson || typeof sdmxJson !== 'object') {
      return [];
    }

    const root = sdmxJson as Record<string, unknown>;
    const data = root.data as Record<string, unknown> | undefined;
    const dataflows = (data?.dataflows || root.dataflows) as Record<string, unknown>[] | undefined;

    if (!Array.isArray(dataflows)) {
      return [];
    }

    return dataflows.map((df) => {
      const id = String(df.id || df.resourceID || '');
      const names = (df.names || df.name) as Record<string, string> | string | undefined;
      const name = typeof names === 'object' && names ? (names.en || Object.values(names)[0]) : String(names || id);
      const descs = (df.descriptions || df.description) as Record<string, string> | string | undefined;
      const description = typeof descs === 'object' && descs ? (descs.en || Object.values(descs)[0]) : String(descs || '');

      return {
        id: `eurostat_${id.toLowerCase()}`,
        source: 'eurostat',
        code: id,
        name: name || id,
        description: description || `Eurostat statistical dataflow ${id}`,
        frequency: ['Q', 'M', 'A'],
        docUrl: `https://ec.europa.eu/eurostat/api/dissemination/sdmx/3.0/structure/dataflow/ESTAT/${id}/~`
      };
    });
  }

  /**
   * Parse Data Structure Definition (DSD) dimensions and codelists
   */
  public static parseDsdDimensions(dsdJson: unknown): DatasetDimension[] {
    if (!dsdJson || typeof dsdJson !== 'object') {
      return [];
    }

    const dimensions: DatasetDimension[] = [];
    const root = dsdJson as Record<string, unknown>;
    const data = (root.data || root) as Record<string, unknown>;
    const dsdList = data.dataStructures as Record<string, unknown>[] | undefined;

    if (Array.isArray(dsdList) && dsdList.length > 0) {
      const dsd = dsdList[0];
      const dataStructureComponents = dsd.dataStructureComponents as Record<string, unknown> | undefined;
      const dimensionList = dataStructureComponents?.dimensionList as Record<string, unknown> | undefined;
      const dims = dimensionList?.dimensions as Record<string, unknown>[] | undefined;

      if (Array.isArray(dims)) {
        for (const dim of dims) {
          const dimId = String(dim.id || '');
          if (!['TIME_PERIOD', 'OBS_VALUE'].includes(dimId)) {
            dimensions.push({
              id: dimId.toLowerCase(),
              label: String(dim.id || ''),
              values: []
            });
          }
        }
      }
    }

    return dimensions;
  }
}
