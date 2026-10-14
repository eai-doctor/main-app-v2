import { MedplumClient } from "@medplum/core";

const medplum = new MedplumClient({
  baseUrl: "https://api.mediplum.e-ai.ca/",
  clientId:'768556d8-bc38-4649-86cb-062ed562b956',
});

export default medplum;