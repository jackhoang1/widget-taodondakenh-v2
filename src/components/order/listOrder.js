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
    props: ["store_token", "payload", "handleEditOrder"],
    data() {
        return {
            //   basePath: "https://ext.botup.io/v1/selling-page/",
            list_order: [],
            skip: 0,
            order_filter: "",
            handle_api: false,
            handle_draft_order: false,
            delivery_platform: "",
            payment_platform: "",
        };
    },
    async created() {
        try {
            if (!this.store_token) {
                throw "Error store_token";
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
            // this.$emit("click-edit");
            this.handleEditOrder("create")
            // Emit event để CreateOrder.vue call order detail
            EventBus.$emit("get-order", item);
        },
        async readOrder() {
            try {
                let path = `${APICMS}/v1/selling-page/order/order_read`;
                let params = { sort: "createdAt DESC" };
                let headers = { Authorization: this.store_token };

                let get_list_order = await Restful.get(path, params, headers);

                if (get_list_order.data && get_list_order.data.data) {
                    if (get_list_order.data.data.orders) {
                        this.list_order = get_list_order.data.data.orders;
                    }
                    if (get_list_order.data.data.delivery_platform) {
                        this.delivery_platform = get_list_order.data.data.delivery_platform
                    }
                    if (get_list_order.data.data.payment_platform) {
                        this.payment_platform = get_list_order.data.data.payment_platform
                    }
                    this.$emit('platform', this.delivery_platform, this.payment_platform)
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
        async updateStatusOrder(status, item, ind) {
            if (status == "cancel_order") return
            let path = `${APICMS}/v1/selling-page/order/order_update`;
            let headers = { Authorization: this.store_token }
            let body = {
                id: item.id,
                status: status,
            }
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
            if (item.is_cod && !item.is_gateway) return true;
        },
        changeClassNormal(item) {
            if (!item.is_cod && !item.is_gateway) return true;
        },
        isActiveConfirm(item) {
            if (item.status != "draft_order")
                return item.status === "new_order";
        },
        isUnconfirm(item) {
            return item.status == "unconfirmed";
        },
        isCancelled(item) {
            if (item.status == "draft_order")
                return item.status === "cancel_order";
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
            if (!this.payload.phone) return
            if (this.payload.phone == localStorage.getItem("cus_phone")) return
            let length = this.list_order.length
            let phone_created = false
            if (length > 0) {
                for (const order of this.list_order) {
                    if ((order.status == 'draft_order' && order.customer_phone == this.payload.phone)) {
                        phone_created = true
                        break
                    }
                }
                if (phone_created) {
                    return
                }

            }
            localStorage.setItem("cus_phone", this.payload.phone);
            this.createDraftOrder()
        },
        async createDraftOrder() {
            try {
                if (this.handle_draft_order) return
                this.handle_draft_order = true
                let path = `${APICMS}/v1/selling-page/order/order_draft`
                let body = {
                    // platform_type: this.payload.platform_type,
                    customer_phone: this.payload.phone,
                    customer_name: this.payload.name,
                    status: 'draft_order',
                }
                if (this.payload.email) {
                    body["customer_email"] = this.payload.email
                }
                let headers = { Authorization: this.store_token }

                let create_draft = await Restful.post(path, body, null, headers)
                this.readOrder()
                console.log('create_draft', create_draft);
            } catch (e) {
                console.log(e);
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
        store_token: function () {
            this.readOrder();
        },
        // 'payload.phone': function () {
        //     console.log("run watch list-order");
        //     this.checkPhone();
        // },
    },
};