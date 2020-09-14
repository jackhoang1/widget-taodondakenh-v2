import EventBus from "@/EventBus.js";
import Restful from "@/services/resful.js";

// const APICMS = "https://ext.botup.io"; //productc
// const APICMS = "http://localhost:1337"; //dev local
const APICMS = "https://devbbh.tk"; //dev

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
    props: ["store_token", "phoneProp"],
    data() {
        return {
            //   basePath: "https://ext.botup.io/v1/selling-page/",
            list_order: [],
            list_payment: [],
            skip: 0,
            order_filter: "",
            handle_api: false,
        };
    },
    async created() {
        try {
            if (!this.store_token) {
                throw "Error";
            }
            await this.readOrder();
            this.checkPhone();
            EventBus.$on("call-order", () => {
                this.readOrder();
            });
        } catch (e) {
            console.log(e);
        }
    },
    mounted() { },
    methods: {
        ableEdit(item) {
            if (
                item.platform_type === "CUSTOM" &&
                (item.status === "unconfirmed" || item.status === "")
            )
                return true;
        },
        computeTime(timeStamp) {
            let date = new Date(timeStamp);
            let time = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
                }:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
                }`;
            let day = `${date.getDate()}/${date.getMonth() + 1}`;
            return time + " " + day;
        },
        handleClickOrder(ind, expand) {
            // Thay đổi class của order-title
            let el = this.$el.getElementsByClassName("order-title");
            let classList = this.$el.getElementsByClassName("order-title")[ind]
                .classList;
            if (expand) {
                classList.add("expand");
                return;
            }
            for (let i = 0; i < el.length; ++i) {
                if (i !== ind) {
                    el[i].classList.remove("expand");
                }
            }
            for (let i = 0; i < classList.length; ++i) {
                if (classList[i] === "expand") {
                    classList.remove("expand");
                    return;
                }
            }
            classList.add("expand");
        },
        handleClickEdit(item) {
            this.$emit("click-edit");
            // Emit event để CreateOrder.vue call order detail
            EventBus.$emit("get-order", item.id);
        },
        async readOrder() {
            try {
                let path = `${APICMS}/v1/selling-page/order/order_read`;
                let params = { sort: "createdAt DESC" };
                let headers = { Authorization: this.store_token };
                console.log("111111111111111111111111111111");

                let get_list_order = await Restful.get(path, params, headers);

                console.log("get_list_order", get_list_order);
                if (get_list_order.data && get_list_order.data.data) {
                    this.list_order = get_list_order.data.data;
                    //   this.readPayment();
                } else {
                    throw "Lỗi lấy danh sách Đơn hàng";
                }
            } catch (e) {
                console.log(e);
                if (e.data && e.data.error_message) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.error_message,
                    });
                    return;
                }
                Toast2.fire({
                    icon: "error",
                    title: e,
                });
            }
        },
        // async readPayment() {
        //   try {
        //     let path = `${APICMS}/v1/selling-page/payment/payment_read`;
        //     let params = {};
        //     let headers = { Authorization: this.store_token };

        //     let read_payment = await Restful.get(path, params, headers);

        //     if (read_payment.data && read_payment.data.data) {
        //       this.list_payment = read_payment.data.data;
        //       this.list_payment.forEach((payment) => {
        //         this.list_order = this.list_order.map((order) => {
        //           if (order.order_id == payment.order_id) {
        //             return { ...order, payment: true, payment_info: payment };
        //           }
        //         });
        //       });
        //       console.log("list order", this.list_order);
        //     } else throw "Lỗi khi lấy thông tin thanh toán";
        //     console.log("read payment", read_payment);
        //   } catch (e) {
        //     console.log(e);
        //   }
        // },

        async sendMessage(item) {
            try {
                if (item.other_info && item.other_info.msg_config) {
                    let mid = item.other_info.msg_config.mid;
                    let token_bbh = item.other_info.msg_config.token_bbh;
                    let order_id = item.order_id;
                    let path = "https://api.botbanhang.vn/v1.3/public/json";
                    let params = {
                        access_token: token_bbh,
                        psid: mid,
                    };
                    let body = {
                        messages: [
                            {
                                text: `Đơn hàng ${order_id} đã được giao vận!`,
                            },
                        ],
                    };
                    console.log("body message", body);

                    let message = await Restful.post(path, body, params);
                    this.swalToast(
                        "Gửi link thanh toán về Message thành công",
                        "success"
                    );
                    return;
                }
                throw "";
            } catch (e) {
                console.log(e);
                this.swalToast("Lỗi khi gửi tin nhắn về message!", "error");
            }
        },
        async createDelivery(item) {
            try {
                console.log("111111111111", item);
                if (this.handle_api) return;
                this.handle_api = true;
                if (
                    item &&
                    item.order_id &&
                    item.other_info &&
                    item.other_info.info_delivery
                ) {
                    let path = `${APICMS}/v1/selling-page/delivery/delivery_create`;
                    let headers = { Authorization: this.store_token };
                    let body = {
                        ...item.other_info.info_delivery,
                        order_id: item.order_id,
                    };
                    console.log("body 1111111", body);
                    let create_delivery = await Restful.post(path, body, {}, headers);

                    this.sendMessage(item);
                }
                this.handle_api = false;
            } catch (e) {
                this.handle_api = false;
                console.log(e);
            }
        },
        handleUpdateOrder(status, item, ind) {
            this.updateOrder(status, item, ind);
        },
        async updateOrder(status, item, ind) {
            let path = `${APICMS}/v1/selling-page/order/order_update`;
            let headers = {
                Authorization: this.store_token,
            };
            let body = {
                id: item.id,
                // access_token: this.store_token,
                status: status,
            };
            let updated = await Restful.post(path, body, {}, headers);
            await this.readOrder();
            this.handleClickOrder(ind, true);
        },
        changeClassGateway(item) {
            //   if (item.status == "unconfirmed") return "unconfirmed";
            //   // if(item.status=='confirmed') return 'confirmed'
            //   if (item.status == "cancelled") return "cancelled";
            if (item.is_gateway) return true;
        },
        changeClassCod(item) {
            //   if (item.status == "unconfirmed") return "unconfirmed";
            //   // if(item.status=='confirmed') return 'confirmed'
            //   if (item.status == "cancelled") return "cancelled";
            if (item.is_cod) return true;
        },
        changeClassNormal(item) {
            if (!item.is_cod && !item.is_gateway) return true;
        },
        isActiveConfirm(item) {
            if (item.status === "confirmed") {
                return true;
            }
            return false;
        },
        isUnconfirm(item) {
            return item.status !== "confirmed" && item.status !== "cancelled";
        },
        isCancelled(item) {
            return item.status === "cancelled";
        },
        async handleGetMoreOrder() {
            try {
                this.skip = this.skip + 20;
                let path = `${APICMS}/v1/selling-page/order/order_read`;
                let params = {
                    sort: "createdAt DESC",
                    skip: this.skip,
                };
                let headers = { Authorization: this.store_token };

                let get_list_order = await Restful.get(path, params, headers);

                console.log("get_list_order", get_list_order.data);
                if (get_list_order.data && get_list_order.data.data) {
                    if (!get_list_order.data.data.length) {
                        Toast2.fire({
                            icon: "success",
                            title: "Đã hiển thị tất cả đơn hàng",
                        });
                        return;
                    }
                    this.list_order = this.list_order.concat(get_list_order.data.data);
                } else {
                    throw "Lỗi lấy danh sách Đơn hàng";
                }
            } catch (e) {
                if (e.data && e.data.error_message) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.error_message,
                    });
                    return;
                }
                Toast2.fire({
                    icon: "error",
                    title: e,
                });
            }
        },
        checkPhone() {
            let order = this.list_order.slice(0, 19);
            if (!this.phoneProp) return;
            let check = order.find((item) => {
                return item.customer_phone === this.phoneProp;
            });
            if (!check) {
                if (localStorage.getItem("cus_phone") === this.phoneProp) {
                    check = true;
                }
            }
            if (!check) {
                localStorage.setItem("cus_phone", this.phoneProp);
                EventBus.$emit("create-empty-order");
            }
        },
        swalToast(title, icon) {
            const Toast = Swal.mixin({
                toast: true,
                position: "center",
                showConfirmButton: false,
                width: "80vw",
                timer: 2000,
                timerProgressBar: false,
                onOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer);
                    toast.addEventListener("mouseleave", Swal.resumeTimer);
                },
            });
            Toast.fire({
                icon: icon,
                title: title,
                padding: "5px",
            });
        },
    },
    beforeDestroy() {
        EventBus.$off("call-order");
    },
    watch: {
        store_token() {
            this.readOrder();
        },
        phoneProp() {
            console.log("run watch");
            this.checkPhone();
        },
    },
};