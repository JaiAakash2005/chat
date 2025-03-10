import { Client, Account, Databases } from "appwrite";

export const API_ENDPOINT = "https://cloud.appwrite.io/v1";
export const PROJECT_ID = "67cd790f00360f9e5618";
export const DATABASE_ID = "67cd7b8c0032676f0e1a";
export const COLLECTION_ID_MESSAGES = "67cd7bbf000adda62398";

const client = new Client().setEndpoint(API_ENDPOINT).setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export default client;

/*const client = new Client();
client.setProject('67cd790f00360f9e5618');*/
