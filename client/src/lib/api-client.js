import axios from "axios";
import { HOST } from "@/utils/constants.js";


// console.log("api mein hoon");
export const apiClient=axios.create({
     baseURL:HOST,
});
