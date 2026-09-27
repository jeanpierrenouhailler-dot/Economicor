import { Country } from './Country';
import { Dataset, DatasetMetadata } from './Dataset';
import { Indicator } from './Indicator';
import { EconomicObservation } from './Observation';
import { DataQuery } from './Query';

export interface DataProvider {
  id: string;
  name: string;
  description: string;

  getDatasets(): Promise<Dataset[]>;
  getIndicators(dataset?: string): Promise<Indicator[]>;
  getCountries(): Promise<Country[]>;
  getMetadata(dataset: string): Promise<DatasetMetadata>;
  query(request: DataQuery): Promise<EconomicObservation[]>;
}
