import { MedplumClient } from "@medplum/core";

const medplum = new MedplumClient({
  baseUrl: "https://api.mediplum.e-ai.ca/",
  clientId:'3cde7dc8-aa68-4f35-8baa-359d43b28a6a',
});

export default medplum;