import { parseStringPromise } from "xml2js";

// biome-ignore lint/suspicious/noExplicitAny: xml の型を定義するのが大変なので any にしている
export const xmlToJson = async (xml: string): Promise<any> => {
  try {
    const json = await parseStringPromise(xml, { mergeAttrs: true });
    return json;
  } catch (error) {
    console.error("Error parsing XML:", error);
    throw error;
  }
};
