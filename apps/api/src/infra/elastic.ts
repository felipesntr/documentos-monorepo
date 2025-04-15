import { Client } from '@elastic/elasticsearch';

export const es = new Client({
    node: process.env.ELASTIC_URL || 'http://elasticsearch:9200'
});
