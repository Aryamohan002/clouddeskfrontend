import axios from "axios";

const api = axios.create({
 baseURL: "https://clouddesk-brcybrctf6grejfq.eastasia-01.azurewebsites.net/",
});

export default api;