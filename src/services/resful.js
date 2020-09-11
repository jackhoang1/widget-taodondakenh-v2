import axios from "axios";

export default {
    post: (path, body, params, headers) => {
        let data = {
            params: params || {},
            headers
        }
        if (!headers) delete data.headers
        // console.log('header',data);
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
    get: (path, params, headers) => {
        // params = {
        //     params: params
        // }
        return new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: path,
                params: params,
                headers: headers
            })
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error.response)
                })
        })
    }
}
