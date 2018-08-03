declare module 'winston-elasticsearch' {
	import * as TransportStream from 'winston-transport';

	import elasticsearch from 'elasticsearch';

	export interface LogData {
			message: any;
			level: string;
			meta: { [key: string]: any };
			timestamp?: string;
	}

	export interface Transformer {
			(logData: LogData): any;
	}

	export interface ElasticsearchTransportOptions extends TransportStream.TransportStreamOptions {
			timestamp?: () => string;
			level?: string;
			index?: string;
			indexPrefix?: string;
			indexSuffixPattern?: string;
			messageType?: string;
			transformer?: Transformer;
			mappingTemplate?: { [key: string]: any };
			ensureMappingTemplate?: boolean;
			flushInterval?: number;
			waitForActiveShards?: number;
			handleExceptions?: boolean;
			pipeline?: string;
			client?: elasticsearch.Client;
			clientOpts?: elasticsearch.ConfigOptions;
	}

	export default class Elasticsearch extends TransportStream {
			constructor(opts?: ElasticsearchTransportOptions);

			query<T>(options: any, callback?: () => void): Promise<elasticsearch.SearchResponse<any>>;
			query<T>(q: string): Promise<elasticsearch.SearchResponse<any>>;
			getIndexName(opts: ElasticsearchTransportOptions): string;
	}
}
