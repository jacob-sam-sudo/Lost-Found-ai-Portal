import axios from "axios";

const API =
  "http://localhost:5000/api/users";

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "token"
    )}`,
  },
});

export const updateProfile = (data) =>
  axios.put(
    `${API}/update`,
    data,
    getConfig()
  );

export const getCurrentUser = () =>
  axios.get(
    `${API}/me`,
    getConfig()
  );

export const uploadAvatar =
(formData)=>{

return axios.post(

`${API}/avatar`,

formData,

{
headers:{
Authorization:
`Bearer ${localStorage.getItem(
"token"
)}`,
},
}

);

};