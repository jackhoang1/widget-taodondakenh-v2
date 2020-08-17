import axios from "axios";

export default {
    post: ( path, body, params) => {
        let data = {
            params: params || {},
            headers: {
                "Content-Type": "application/json",
            }
        }
        return new Promise((resolve, reject) => {
            axios.post(
                    path,
                    body,
                    // {
                    //     headers: {
                    //         "Content-Type": "application/json",
                    //     }
                    // }
                    data
                )
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error.response)
                });
        })
    },
    get: ( path, params) => {
        params = {
            params: params
        }
        return new Promise((resolve, reject) => {
            axios.get(path, params)
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error.response)
                })
        })
    }
}
