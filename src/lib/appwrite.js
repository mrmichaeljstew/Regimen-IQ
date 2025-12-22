import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://sfo.cloud.appwrite.io/v1")
  .setProject("regimen-iq");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
