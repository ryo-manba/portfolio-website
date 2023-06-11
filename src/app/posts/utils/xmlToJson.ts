import { parseStringPromise } from 'xml2js';

export const xmlToJson = async (xml: string): Promise<any> => {
  try {
    const json = await parseStringPromise(xml, { mergeAttrs: true });
    return json;
  } catch (error) {
    console.error('Error parsing XML:', error);
    throw error;
  }
};
