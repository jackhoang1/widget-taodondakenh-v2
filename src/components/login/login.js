import EventBus from "@/EventBus.js";
import { APICMS, APIBASE, secretKey } from "@/services/domain.js";
import Restful from "@/services/resful.js";

const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: false,
    onOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
    width: "80vw",
});
const Toast2 = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
    onOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
    width: "80vw",
});


export default {
    props: ['isLogin','showLogin','hideLogin', 'access_token', 'forceRerender'],
    data() {
        return {
            cms_account: "",
            cms_password: "",
            show_list_store: false,
            list_store: [],
            store_token: "",
        }
    },
    methods: {
        showFormLogin() {
            EventBus.$emit('show-modal-setting')
        },
        hideFormLogin() {
            EventBus.$emit('hide-modal-setting')
        },
        handleChooseStore(item) {
            this.store_token = item.access_token;
            this.$emit('store-token', item.access_token)
            localStorage.removeItem("order_3d_platform");
            let order_3d_platform = {};
            if (item.store_email) {
                this.$emit('store-email', item.store_email)
              order_3d_platform["store_email"] = item.store_email;
            }
            localStorage.setItem(
              "order_3d_platform",
              JSON.stringify(order_3d_platform)
            );
            this.runOAuth();
          },
        async runSignIn() {
            try {
                // Call Api Đăng nhập CMS
                let path = "https://api.botup.io/v1/auth/sign-in";
                let body = {
                    email: this.cms_account,
                    password: this.cms_password,
                };

                let sign_in = await Restful.post(path, body);

                let user = {};
                if (sign_in.data && sign_in.data.data && sign_in.data.data.user) {
                    user = sign_in.data.data.user;
                } else {
                    throw "Đăng nhập thất bại";
                }
                let { email, first_name, last_name, id, role } = user;
                path = `${APICMS}/v1/users/users/singinbotup`;
                body = {
                    username: id,
                    email,
                    first_name,
                    last_name,
                    role,
                };

                // Call Api Đăng nhập Botup
                let cms_signin = await Restful.post(path, body);

                // Lấy danh sách Store
                path = `${APICMS}/v1/selling-page/store/store_read`;
                let params = {};
                if (
                    cms_signin.data &&
                    cms_signin.data.data &&
                    cms_signin.data.data.user &&
                    cms_signin.data.data.user.id
                ) {
                    params = {
                        owner_id: cms_signin.data.data.user.id,
                    };
                } else {
                    throw "Đăng nhập thất bại";
                }

                let read_store = await Restful.get(path, params);

                if (read_store && read_store.data && read_store.data.data) {
                    this.list_store = read_store.data.data;
                    this.show_list_store = true;
                } else {
                    throw "Lỗi khi lấy danh sách Store";
                }
            } catch (e) {
                console.log("error", e);
                if (e.data.message) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.message,
                    });
                    return;
                }
                Toast2.fire({
                    icon: "error",
                    title: e,
                });
            }
        },
        async runOAuth() {
            try {
                // Call Api xác thực khi chọn Store và lưu lại Token
                let body = {
                    _type: "oauth-access-token",
                    access_token: this.access_token,
                    token_partner: this.store_token,
                };
                // Xác thực Widget
                let oauth = await Restful.post(
                    `${APIBASE}/v1/app/app-installed/update`,
                    body
                );
                Toast2.fire({
                    icon: "success",
                    title: "Xác thực thành công",
                });
                setTimeout(() => {
                    this.forceRerender()
                    window.close();
                }, 1000);
            } catch (e) {
                console.log(e);
                if (
                    e.data &&
                    e.data.message &&
                    e.data.message.message == "jwt expired"
                ) {
                    return Toast2.fire({
                        icon: "error",
                        title: "Vui lòng tải lại trang và kích hoạt lại!",
                    });
                }
                Toast2.fire({
                    icon: "error",
                    title: "Xác thực không thành công",
                });
            }
        },
    }
}