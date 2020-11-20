import fetchMock from "jest-fetch-mock";

localStorage.apiBase = "jest-mock-api";
localStorage.dataGridAuth = "jest-mock-auth";

fetchMock.enableMocks();

const MakeItAModule = "";
export default MakeItAModule;
