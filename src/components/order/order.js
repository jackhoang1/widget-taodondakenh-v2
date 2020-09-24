import EventBus from "@/EventBus.js"
import Restful from "@/services/resful.js"
import SearchAddress from "@/components/SearchAddress.vue"
import Alepay from "@/components/payment/alepay/Alepay.vue"
import Delivery from "@/components/delivery/Delivery.vue"

// const APICMS = "https://ext.botup.io"  //product
// const APICMS = "http://localhost:1337" //dev
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
        toast.addEventListener("mouseenter", Swal.stopTimer)
        toast.addEventListener("mouseleave", Swal.resumeTimer)
    },
    width: "80vw",
});

export default {
    components: {
        SearchAddress,
        Delivery,
        Alepay
    },
    props: [
        "store_token",
        "payload"
    ],
    data() {
        return {
            res_order_info: "",
            product_info: {
                total_item: 0,
                list_product: ''
            },
            platform_type: "",
            name: "",
            phone: "",
            street: "",
            country: "Việt Nam",
            list_city: [],
            city: "",
            list_district: [],
            district: "",
            list_ward: [],
            ward: "",

            email: "",
            list_branch: [],
            branch: {},
            has_branch: false,
            address: "",
            address_delivery: "",
            client_id: "",
            list_product: [],
            filter_list_product: [],
            is_show_popup: false,
            search_value: "",
            note: "",
            is_show_note: false,
            cart: [],
            order_id: "",

            total_payment: 0,
            total_price: 0,
            shipping_fee: 0,
            list_product: [],

            is_show_order_info: false,
            prevent_click: false,
            msg_content_reset: 'Quý khách đã tạo thành công đơn hàng số {{order_id}} ',
            msg_content: 'Quý khách đã tạo thành công đơn hàng số {{order_id}} ',
            is_show_setting_msg: false,
            is_update_order: false,
            wait_create_empty_order: false,

            show_modal_option: false,
            show_delivery: false,
            show_payment: false,
            show_form: 'order',

            order_option: 0,
            order_step: 0,
            is_cod: false,
            is_gateway: false,
            info_delivery: "",
            handle_api: false,
            reset_token: false,
            validate_info: false,
            is_loading: false,
        };
    },
    created() {
        EventBus.$on("get-order", (id) => {
            this.getOrderInfo(id)
        });
        EventBus.$on("create-empty-order", () => {
            if (!this.platform_type) {
                this.wait_create_empty_order = true
                return
            }
            this.createEmptyOrder()
        });
        EventBus.$on("disable-update-order", () => {
            this.is_update_order = false
        });
        if (this.store_token) {
            this.getInitialData()
            this.name = this.payload.name
            this.phone = this.payload.phone
            this.email = this.payload.email
        }
    },
    mounted() {
        console.log("payload", this.payload)
    },
    methods: {
        handleOrderStep() {
            if (this.order_step == 0 && this.order_option == 0) {
                this.handleCallApiOrder()
            }
        },

        resetAddress() {
            this.city = ""
            this.district = ""
            this.ward = ""
            this.address = ''
            this.street = ''
        },
        resetChangeCity() {
            this.district = ""
            this.ward = ""
        },
        resetChangeDistrict() {
            this.ward = ""
        },
        async getListProvince() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/provinces_v2`
                let headers = { 'Authorization': this.store_token }

                let get_list_city = await Restful.get(path, null, headers)

                if (get_list_city.data && get_list_city.data.data) {
                    this.list_city = get_list_city.data.data
                }
            } catch (e) {
                console.log(e)
            }
        },
        async getListDistrict() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/districts_v2`
                let params = { 'province_id': this.city.province_id }
                let headers = { 'Authorization': this.store_token }

                let get_list_district = await Restful.get(path, params, headers)

                if (get_list_district.data && get_list_district.data.data) {
                    this.list_district = get_list_district.data.data
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        async getListWard() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/wards_v2`
                let params = { 'district_id': this.district.district_id }
                let headers = { 'Authorization': this.store_token }

                let get_list_ward = await Restful.get(path, params, headers)

                if (get_list_ward.data && get_list_ward.data.data) {
                    this.list_ward = get_list_ward.data.data
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        async handleShowPopup() {
            // Show Popup khi nhấn "Thêm sản phẩm"
            try {
                this.is_show_popup = !this.is_show_popup
                this.getListProduct()
            } catch (e) {
                console.log("error", e);
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                })
            }
        },
        async handleSearch() {
            try {
                if (this.search_value) {
                    if (this.platform_type === "HARAVAN" || this.platform_type === "SAPO") {
                        this.searchByFilter()
                        return
                    }
                    // Tìm sản phẩm
                    let search_value_data = this.search_value
                    let search_value = search_value_data
                    // let path = `${APICMS}/v1/selling-page/product/product_read`
                    let params = {
                        search: search_value,
                    }

                    await this.getListProduct(params)

                    if (this.list_product.length) return
                    // Search với các search_value viết hoa kí tự đầu
                    search_value = search_value_data.charAt(0).toUpperCase() + search_value.substring(1)
                    params.search = search_value

                    await this.getListProduct(params)

                    if (this.list_product.length) return

                    // Search với các search_value viết thường
                    search_value = search_value_data.toLowerCase()
                    params.search = search_value
                    await this.getListProduct(params)

                    if (!this.list_product.length) {
                        Toast.fire({
                            icon: "error",
                            title: "Không tìm thấy sản phẩm",
                        })
                    }
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        searchByFilter() {
            let products = this.list_product
            let search = this.search_value.toLowerCase()
            console.log("search", search)
            this.filter_list_product = products.filter((item) => {
                console.log("here", item.product_name.toLowerCase())
                return item.product_name.toLowerCase().includes(search)
            })
        },
        handleClosePopup() {
            // Close Popup tìm sản phẩm
            this.is_show_popup = !this.is_show_popup
            this.search_value = ''
            this.filter_list_product = []
            this.getCart()
        },
        handleShowNote() {
            this.is_show_note = !this.is_show_note
            if (this.is_show_note) {
                setTimeout(() => {
                    this.$refs.note.focus()
                })
            }
        },
        async getCart() {
            try {
                // Lấy giỏ hàng
                let path = `${APICMS}/v1/selling-page/cart/cart_read`
                let params = {
                    client_id: this.client_id,
                    sort: 'createdAt DESC',
                }
                let headers = { Authorization: this.store_token }

                let get_cart = await Restful.get(path, params, headers)

                if (
                    get_cart.data &&
                    get_cart.data.data &&
                    get_cart.data.data.cart
                ) {
                    console.log("get cart", get_cart)
                    this.cart = get_cart.data.data.cart
                    this.total_price = get_cart.data.data.total_price
                }
            } catch (e) {
                console.log("error", e)
                this.swalToast('Lỗi khi lấy giỏ hàng', 'error')
            }
        },
        async handleAddToCart(item) {
            try {
                // Lỗi nếu sản phẩm ko có giá
                if (!item.product_price) {
                    Toast.fire({
                        icon: "error",
                        title: "Thêm sản phẩm thất bại",
                    });
                    return;
                }
                let path = `${APICMS}/v1/selling-page/cart/cart_add_product`
                let body = {
                    access_token: this.store_token,
                    product_id: item.product_id,
                    client_id: this.client_id || '',
                    product_price: item.product_price,
                    product_quantity: 1,
                    product_name: item.product_name,
                    product_image: item.image || '',
                    other_info: item.product_option,
                };
                let headers = {
                    Authorization: this.store_token
                }
                if (this.platform_type === "MISA") {
                    body.other_info = {}
                    body.other_info.UnitId = item.other_info.UnitId
                    body["product_code"] = item.product_code
                }
                console.log("body handleAddToCart", body)
                // Thêm sản phẩm vào giỏ hàng
                let add_cart = await Restful.post(path, body, null, headers)
                // Lưu client_id và lưu vào localStorage
                if (
                    add_cart.data &&
                    add_cart.data.data &&
                    add_cart.data.data.client_id
                ) {
                    this.client_id = add_cart.data.data.client_id
                    this.client_id && localStorage.setItem("client_id", this.client_id)
                }

                Toast.fire({
                    icon: "success",
                    title: "Thêm sản phẩm thành công",
                });
            } catch (error) {
                console.log("error", error);
                Toast.fire({
                    icon: "error",
                    title: "Thêm sản phẩm thất bại",
                });
            }
        },
        async handleDeleteCart(item) {
            try {
                let path = `${APICMS}/v1/selling-page/cart/cart_delete_product`
                let body = {
                    product_id: item.product_id,
                    client_id: this.client_id,
                }
                let headers = { Authorization: this.store_token }

                let postDeleteCart = await Restful.post(path, body, null, headers)

                Toast.fire({
                    icon: "success",
                    title: "Đã xóa sản phẩm",
                });

                // Load lại giỏ hàng
                this.getCart();
            } catch (error) {
                console.log("error", error);
                Toast.fire({
                    icon: "error",
                    title: "Lỗi khi xoá giỏ hàng",
                });
            }
        },
        async handleAddQuantity(item) {
            try {
                // Tăng số lượng sản phẩm trong giỏ hàng
                let path = `${APICMS}/v1/selling-page/cart/cart_add_product`
                let body = {
                    product_id: item.product_id,
                    client_id: this.client_id,
                }
                let headers = { Authorization: this.store_token }

                let postAddQuantity = await Restful.post(path, body, null, headers)

                // Load lại giỏ hàng
                this.getCart()
            } catch (error) {
                console.log(error, "error");
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                })
            }
        },
        async handleSubQuantity(item) {
            try {
                // Giảm số lượng sản phẩm trong giỏ hàng
                let path = `${APICMS}/v1/selling-page/cart/cart_sub_product`
                let body = {
                    product_id: item.product_id,
                    client_id: this.client_id,
                }
                let headers = { Authorization: this.store_token }

                let postAddQuantity = await Restful.post(path, body, null, headers)

                // Load lại giỏ hàng
                this.getCart()
            } catch (error) {
                console.log(error, "error")
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                })
            }
        },
        handleProductSum(arr) {
            if (!arr && arr.length == 0) return
            let total_item = 0
            let list_product = ""
            arr.forEach(product => {
                total_item = total_item + product.product_quantity
                list_product = `${list_product} ${product.product_name},`
            })
            this.product_info.total_item = total_item
            this.product_info.list_product = list_product
        },
        handleTotalPayment() {
            this.total_payment = this.total_price + this.shipping_fee
        },
        validateEmail(email) {
            let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            if (reg.test(email) == false) {
                return false;
            }
            return true;

        },
        handleCreateOrder() {
            if (this.cart.length === 0) {
                Toast.fire({
                    icon: "error",
                    title: "Giỏ hàng trống",
                })
                return
            }
            // Validate form thông tin khách hàng
            if (
                !this.name ||
                !this.phone ||
                !this.country ||
                !this.city ||
                !this.district ||
                !this.ward ||
                !this.street
            ) {
                console.log(this.order_option);
                return Toast.fire({
                    icon: "error",
                    title: "Vui lòng điền đầy đủ thông tin",
                })
            }
            if (!this.validateEmail(this.email)) {
                return Toast.fire({
                    icon: "error",
                    title: "Email không hợp lệ!",
                })
            }
            //check validate components delivery, payment
            if (this.$refs.delivery && !this.$refs.delivery.validateCreateDelivery()) return
            if (this.$refs.payment && !this.$refs.payment.validateCreatePayment()) return
            // Check trạng thái chọn chọn chi nhánh
            if (this.list_branch[0]) {
                if (!Object.keys(this.branch)[0]) {
                    Toast.fire({
                        icon: "error",
                        title: "Vui lòng chọn chi nhánh",
                    })
                    return
                }
            }

            // Check phone là kiểu Number
            if (isNaN(Number(this.phone)) || this.phone.length != 10) {
                Toast.fire({
                    icon: "error",
                    title: "Số điện thoại không hợp lệ",
                })
                return
            }
            if (this.order_option != 0 && !this.shipping_fee) {
                return Toast.fire({
                    icon: "error",
                    title: "Vui lòng điền đủ thông tin giao vận"
                })
            }
            this.address = `${this.street}, ${this.ward.name}, ${this.district.name}, ${this.city.name}`
            this.is_show_order_info = true
            return true
        },
        async handleCallApiOrder() {
            try {
                if (!this.handleCreateOrder()) return
                // Check xem đang tạo mới order hay update order
                if (this.is_update_order) {
                    this.updateOrder()
                    return
                }
                // Ngăn spam "Tạo đơn hàng"
                this.prevent_click = true
                if (this.order_option == 1) {
                    this.is_cod = true
                    this.is_gateway = false
                } else if (this.order_option == 2) {
                    this.is_cod = false
                    this.is_gateway = true
                } else {
                    this.is_cod = false
                    this.is_gateway = false
                }
                let path = `${APICMS}/v1/selling-page/order/order_create`
                let body = {
                    "customer_id": this.payload.customer_id,
                    "fb_page_id": this.payload.fb_page_id,
                    "is_cod": this.is_cod,
                    "is_gateway": this.is_gateway,
                    "product_info": this.cart,
                    "customer_name": this.name,
                    "customer_phone": this.phone,
                    "customer_email": this.email,
                    "customer_address": this.address,
                    "customer_city_name": this.city.name,
                    "customer_province_name": this.city.name,
                    "customer_district_name": this.district.name,
                    "customer_ward_name": this.ward.name,
                    "customer_street_name": this.street,
                    "customer_province_code": this.city.code,
                    "customer_district_code": this.district.code,
                    "customer_ward_code": this.ward.code,
                    "note": this.note,
                    "status": "new_confirmed",
                    "platform_type": this.platform_type,
                    "branchId": this.branch.id,
                    "other_info": {}
                }
                // tính tổng số sản phẩm và tên các sản phẩm
                this.handleProductSum(this.cart)
                //check nếu gateway sẽ gửi info delivery >tạo payment> orther info
                if (this.order_option == 2) {
                    // lấy thông tin giao vận từ components delivery
                    if (this.$refs.delivery) {
                        this.info_delivery = this.$refs.delivery.infoDelivery(this.product_info)
                    }
                    body.other_info.msg_config = {}
                    body.other_info.msg_config.psid = this.payload.psid
                    body.other_info.msg_config.token_bbh = this.payload.token_bbh
                    body.other_info.info_delivery = this.info_delivery
                }
                if (!body.branchId) delete body.branchId    //????
                if (this.platform_type === "MISA") {
                    delete body["branchId"]
                    body["BranchId"] = this.branch.id
                }
                // Tạo customer mới đối với Haravan
                if (this.platform_type === "HARAVAN") {
                    this.address = `${this.street}, ${this.ward.meta_data.haravan.name}, ${this.district.meta_data.haravan.name}, ${this.city.name}`;
                    delete body["customer_city_name"]
                    body["customer_province_name"] = this.city.name
                    body["customer_province_code"] = this.city.meta_data.haravan.code
                    body["customer_district_name"] = this.district.meta_data.haravan.name
                    body["customer_district_code"] = this.district.meta_data.haravan.code
                    body["customer_ward_name"] = this.ward.meta_data.haravan.name
                    body["customer_ward_code"] = this.ward.meta_data.haravan.code
                    body["customer_address"] = this.address

                }
                this.callOrder(path, body)
            } catch (e) {
                console.log(e)
            }
        },
        async callOrder(path, body) {
            try {
                // Call Api tạo đơn hàng
                this.is_loading = true
                let headers = { Authorization: this.store_token }

                let create_order = await Restful.post(path, body, null, headers)

                if (
                    create_order.data &&
                    create_order.data.data &&
                    create_order.data.data.order_info &&
                    create_order.data.data.order_info.order_id &&
                    (create_order.data.data.order_info.snap_order ||
                        this.platform_type === "CUSTOM")
                ) {
                    // if (create_order.data.data.snap_order &&
                    //     !create_order.data.data.snap_order.Success &&
                    //     this.platform_type === "MISA"
                    // ) {
                    //     throw create_order.data.data.snap_order
                    // }
                    // if (this.platform_type !== "CUSTOM" &&
                    //     create_order.data.data.snap_order.errors
                    // ) {
                    //     throw create_order.data.data.snap_order
                    // }
                    let order_id = create_order.data.data.order_info.order_id
                    if (this.order_option == 1) {
                        if (this.$refs.delivery) {
                            await this.$refs.delivery.createDelivery(order_id, this.product_info)
                        }
                    }
                    else if (this.order_option == 2) {
                        if (this.$refs.payment) {
                            await this.$refs.payment.createPayment(order_id)
                        }
                    }
                    else {
                        Toast2.fire({
                            icon: "success",
                            title: "Tạo đơn hàng thành công",
                        })
                        this.sendMessage(order_id)
                    }
                    setTimeout(() => {
                        this.handleDeleteAllCart()
                    }, 1000)
                    setTimeout(() => {
                        EventBus.$emit("call-order")
                    }, 1000)

                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Lỗi khi tạo đơn, Vui lòng thử lại!",
                    });
                    this.prevent_click = false
                }
                this.is_loading = false
            } catch (e) {
                this.is_loading = false
                console.log("eeeeeeeeeeeeeeee", e);
                this.prevent_click = false
                if (
                    e.data &&
                    e.data.error_message &&
                    e.data.error_message.errorCode
                ) {
                    return this.swalToast(e.data.error_message.message, 'error')
                }
                // if (
                //     e &&
                //     e.data &&
                //     e.data.error_message &&
                //     e.data.error_message.message
                // ) {
                //     Toast2.fire({
                //         icon: "error",
                //         title: e.data.error_message.message,
                //     });
                //     return;
                // }
                // if (e && e.data && e.data.error_message) {
                //     Toast2.fire({
                //         icon: "error",
                //         title: e.data.error_message,
                //     });
                //     return;
                // }
                // if (e && e.errors) {
                //     Toast2.fire({
                //         icon: "error",
                //         title: e.errors,
                //     });
                //     return;
                // }
                // if (e && e.ErrorMessage) {
                //     Toast2.fire({
                //         icon: "error",
                //         title: e.ErrorMessage,
                //     });
                //     return;
                // }
                Toast2.fire({
                    icon: "error",
                    title: "Lỗi khi tạo đơn",
                });
            }
        },
        async createHaravanCustomer(body) {
            try {
                let path = `${APICMS}/v1/selling-page/other/haravan_create_customer`
                console.log("haraas")
                let headers = { Authorization: this.store_token }
                let customer = {
                    customer_name: this.name,
                    customer_email: this.email,
                    customer_address: this.address,
                    customer_phone: this.phone,
                    customer_province_name: this.city.name,
                    customer_city_name: this.city.name,
                }

                let createCustomer = await Restful.post(path, customer, null, headers)

                console.log("hrv acc success")
                path = `${APICMS}/v1/selling-page/order/order_create_3rd`
                this.callOrder(path, body)
            } catch (e) {
                console.log("eeer", e.data.error_message)
                if (
                    e.data &&
                    e.data.error_message === 'Địa chỉ Email đã được sử dụng.'
                ) {
                    let path = `${APICMS}/v1/selling-page/order/order_create_3rd`
                    let body = {
                        product_info: this.cart,
                        customer_name: this.name,
                        customer_phone: this.phone,
                        customer_email: this.email,
                        customer_address: this.address,
                        customer_city_name: this.city.name,
                        customer_province_name: this.city.name,
                        customer_district_name: this.district.name,
                        customer_ward_name: this.ward.name,
                        customer_street_name: this.street,
                        note: this.note,
                        status: "unconfirmed",
                        platform_type: this.platform_type,
                        branchId: this.branch.id,
                    }
                    if (!body.branchId) delete body.branchId
                    if (!this.city.name.includes("Tỉnh")) {
                        delete body["customer_province_name"]
                    }
                    this.callOrder(path, body)
                    return
                }
                if (
                    e.data &&
                    e.data.error_message
                ) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.error_message,
                    })
                    this.prevent_click = false
                    return
                }
                Toast2.fire({
                    icon: "error",
                    title: "Xảy ra lỗi khi tạo Haravan customer",
                });
                this.prevent_click = false;
            }
        },
        async handleDeleteAllCart() {
            try {
                // Xóa giỏ hàng sau khi tạo thành cong đơn hàng
                let path = `${APICMS}/v1/selling-page/cart/cart_delete`
                let body = {
                    client_id: this.client_id
                }
                let headers = {
                    Authorization: this.store_token
                }

                let postDeleteAllCart = await Restful.post(path, body, null, headers)

                this.note = ''

                // Bỏ chặn click nút 'Xác nhận'
                this.prevent_click = false

                this.getCart()

                // Đóng chi tiết đơn hàng
                this.closeOrderInfo()
            } catch (e) {
                console.log("error", e)
            }
        },
        covertMsgContent(order_id) {
            localStorage.setItem("msg_content", this.msg_content)
            return this.msg_content.replace(/{{order_id}}/g, order_id)
        },
        async sendMessage(order_id, url_payment) {
            try {
                let list_product = this.cart.map((item) => {
                    return `${item.product_quantity}  ${item.product_name} \n`
                });
                let strProduct = list_product.join(" ")
                let content = this.covertMsgContent(order_id);
                let path = `https://api.botbanhang.vn/v1.3/public/json`
                let params = {
                    access_token: this.payload.token_bbh,
                    psid: this.payload.psid,
                }
                let messages = [
                    { text: content },
                    {
                        text: `Tên khách hàng: ${this.name} \nSố điện thoại: ${this.phone} \nEmail: ${this.email} \nĐịa chỉ: ${this.address}`,
                    },
                    {
                        text: `Danh sách sản phẩm: \n${strProduct} \nGiá trị đơn hàng: \n${this.$options.filters.toCurrency(this.total_price)}`,
                    },
                ]
                if (this.order_option == 1) {
                    messages = messages.concat(
                        [
                            {
                                text: `Đơn hàng của quý khách đang được giao vận.\nPhí ship ${this.$options.filters.toCurrency(this.shipping_fee)}`
                            }
                        ]
                    )
                }
                if (this.order_option == 2) {
                    messages = messages.concat(
                        [
                            {
                                text: `Phí ship ${this.$options.filters.toCurrency(this.shipping_fee)} \n Tổng thanh toán ${this.$options.filters.toCurrency(this.total_payment)}`
                            },
                            {
                                text: `Sau khi thanh toán đơn hàng sẽ được giao vận ${url_payment}`
                            }
                        ]
                    )
                }
                let body = { messages }
                let sent_message = await Restful.post(path, body, params)

                console.log("send", body)
            } catch (e) {
                console.log("error send mess", e)
                this.swalToast("Lỗi khi gửi tin về message", "error")
            }
        },
        closeOrderInfo() {
            this.is_show_order_info = false
        },
        async getListProduct(params) {
            try {
                let path = `${APICMS}/v1/selling-page/product/product_read`
                let headers = {
                    Authorization: this.store_token
                }
                // Load danh sách sản phẩm
                let get_list_product = await Restful.get(path, params, headers)

                if (
                    get_list_product.data &&
                    get_list_product.data.data
                ) {
                    this.list_product = get_list_product.data.data
                }
                if (
                    get_list_product.data &&
                    get_list_product.data.data[0] &&
                    get_list_product.data.data[0].platform_type
                ) {
                    this.platform_type = get_list_product.data.data[0].platform_type
                }
                console.log(this.platform_type)

                // Lấy chi nhánh nếu là Kiotviet
                if (this.platform_type === "KIOTVIET") {
                    this.has_branch = true
                    this.getBranchKiotviet()
                }
                if (this.platform_type === "MISA") {
                    this.has_branch = true
                    this.getBranchMisa()
                }
                // Convert data theo variant nếu là Haravan và Sapo
                if (this.platform_type === "HARAVAN" || this.platform_type === "SAPO") {
                    this.convertProductData()
                }
            } catch (e) {
                console.log("get product err", e)
            }
        },
        convertProductData() {
            let products = [].concat(this.list_product)
            this.list_product = []

            let findImage = (product, imageId) => {
                if (product.images) {
                    product.images.map((image) => {
                        if (image.id === imageId) {
                            return image.src
                        }
                    });
                }
                return product.image;
            };

            products.map((product, ind) => {
                let map_variant = product.variants.map((variant) => {
                    variant.image = findImage(product, variant.image_id)
                    return {
                        product_id: variant.id,
                        product_name: product.product_name,
                        product_price: variant.price,
                        product_option: variant.title,
                        image: variant.image,
                    }
                })
                this.list_product = this.list_product.concat(map_variant)
            });
        },
        async getInitialData() {
            if (localStorage.getItem("client_id")) {
                this.client_id = localStorage.getItem("client_id")
            }
            if (localStorage.getItem("msg_content")) {
                this.msg_content = localStorage.getItem("msg_content")
            }
            await this.getListProduct()
            this.getListProvince()
            this.getCart()
        },
        async getBranchKiotviet() {
            try {
                let path = `${APICMS}/v1/selling-page/other/kiotviet_get_branch`
                let headers = { Authorization: this.store_token }

                let get_branch = await Restful.post(path, null, null, headers)

                if (
                    get_branch.data &&
                    get_branch.data.data &&
                    get_branch.data.data.data
                ) {
                    this.list_branch = get_branch.data.data.data
                    this.has_branch = true
                }
            } catch (e) {
                if (this.resetTokenKiotviet()) return
                if (
                    e.data &&
                    e.data.error_message &&
                    e.data.error_message.message
                ) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.error_message.message,
                    })
                    return
                }
                Toast2.fire({
                    icon: "error",
                    title: "Lỗi get branch kiotviet",
                });
                console.log("get branch err", e)
            }
        },
        async resetTokenKiotviet() {
            try {
                if (this.reset_token) return;
                let path = `${APICMS}/v1/selling-page/other/kiotviet_update_token`
                let headers = { 'Authorization': this.store_token }

                let reset_token_kiotviet = await Restful.post(path, null, null, headers)

                if (
                    reset_token_kiotviet.data &&
                    reset_token_kiotviet.data.data
                ) {
                    this.reset_token = true
                    this.getBranchKiotviet()
                    return true
                }

            } catch (e) {
                this.swalToast('Lỗi reset token kiotviet', 'error')
                console.log(e)
            }
        },
        async resetTokenMisa() {
            try {
                if (this.reset_token) return
                let path = `${APICMS}/v1/selling-page/other/misa_update_token`
                let headers = { 'Authorization': this.store_token }

                let reset_token_misa = await Restful.post(path, null, null, headers)

                if (
                    reset_token_misa.data &&
                    reset_token_misa.data.data
                ) {
                    this.reset_token = true
                    console.log("reset_token_misa", reset_token_misa)
                    this.getBranchMisa()
                    return true
                }
            } catch (e) {
                this.swalToast('Lỗi reset token misa', 'error')
                console.log(e);
            }

        },
        async getBranchMisa() {
            try {
                let path = `${APICMS}/v1/selling-page/other/misa_get_branch`
                let headers = { Authorization: this.store_token }

                let get_branch = await Restful.post(path, null, null, headers)

                console.log("get branch misa", get_branch)
                if (
                    get_branch.data &&
                    get_branch.data.data
                ) {
                    let list_branch = get_branch.data.data
                    this.list_branch = list_branch.map((branch) => {
                        return { id: branch.Id, branchName: branch.Name }
                    })
                    // console.log("list_branch", this.list_branch)
                    this.has_branch = true
                }
                if (
                    get_branch.data &&
                    get_branch.data.code == 200 &&
                    !get_branch.data.data
                ) {
                    this.resetTokenMisa()
                }
            } catch (e) {
                console.log(e);
                if (this.resetTokenMisa()) return
                if (
                    e &&
                    e.data &&
                    e.data.error_message &&
                    e.data.error_message.message
                ) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.error_message.message,
                    });
                    return;
                }
                Toast2.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi lấy chi nhanh Misa",
                });
                console.log("get branch err", e);
            }
        },

        showSettingMsg() {
            this.is_show_setting_msg = !this.is_show_setting_msg;
        },
        handleSaveMsg() {
            localStorage.setItem('msg_content', this.msg_content)
            this.showSettingMsg()
        },
        handleResetMsg() {
            this.msg_content = this.msg_content_reset
        },
        async getOrderInfo(id) {
            // Reset client_id tránh loạn giỏ hàng
            this.client_id = ''
            localStorage.removeItem("client_id")
            this.cart = []
            let path = `${APICMS}/v1/selling-page/order/order_read`
            let headers = { Authorization: this.store_token }
            let params = {
                id,
            }

            let order = await Restful.get(path, params, headers)

            let dataOrder = {}
            if (
                order.data &&
                order.data.data
            ) {
                this.is_update_order = true

                dataOrder = order.data.data
                this.name = dataOrder.customer_name
                this.phone = dataOrder.customer_phone
                this.email = dataOrder.customer_email
                this.street = dataOrder.customer_street_name
                this.note = dataOrder.note
                this.country = "Việt Nam"
                this.platform_type = dataOrder.platform_type
                this.order_id = dataOrder.id

                if (dataOrder.branchId) {
                    this.branchId = dataOrder.branchId
                }
                this.list_city.map((item) => {
                    if (dataOrder.customer_city_name === item.name) {
                        this.city = item;
                    }
                })
                if (dataOrder.customer_city_name === "") {
                    this.city = ""
                    this.district = ""
                    this.ward = ""
                    return
                }

                await this.getListDistrict()
                this.list_district.map((item) => {
                    if (dataOrder.customer_district_name === item.name) {
                        this.district = item
                    }
                })

                await this.getListWard()
                this.list_ward.map((item) => {
                    if (dataOrder.customer_ward_name === item.name) {
                        this.ward = item
                    }
                })
                console.log("call order", order)
            }
        },
        async createEmptyOrder() {
            try {
                // Tạo order rỗng
                if (this.platform_type !== "CUSTOM") return
                let path = `${APICMS}/v1/selling-page/order/order_create_3rd`
                let headers = { Authorization: this.store_token }
                let body = {
                    // access_token: this.store_token,
                    customer_name: this.name,
                    customer_phone: this.phone,
                    customer_address: "Chưa xác định",
                    status: "unconfirmed",
                    platform_type: this.platform_type,
                };

                let emptyOrder = await Restful.post(path, body, {}, headers)

                if (emptyOrder.data && emptyOrder.data.data) {
                    console.log("create empty order ok")
                    this.order_id = emptyOrder.data.data.id
                    EventBus.$emit("call-order")
                    Toast2.fire({
                        icon: "success",
                        title: "Tạo đơn hàng thành công",
                    })
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Đã xảy ra lỗi khi tạo đơn rỗng",
                    })
                }
            } catch (error) {
                if (error.data.error_message.message) {
                    Toast2.fire({
                        icon: "error",
                        title: error.data.error_message.message,
                    })
                    return
                }
                if (error.data.error_message) {
                    Toast2.fire({
                        icon: "error",
                        title: error.data.error_message,
                    });
                    return
                }
                if (error.errors) {
                    Toast2.fire({
                        icon: "error",
                        title: error.errors,
                    })
                    return
                }
                Toast2.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                })
            }
        },
        async updateOrder() {
            try {
                this.prevent_click = true
                let path = `${APICMS}/v1/selling-page/order/order_update`
                let headers = { Authorization: this.store_token }
                let body = {
                    id: this.order_id,
                    product_info: this.cart,
                    customer_name: this.name,
                    customer_phone: this.phone,
                    customer_email: this.email,
                    customer_address: this.address,
                    customer_city_name: this.city.name,
                    customer_province_name: this.city.name,
                    customer_district_name: this.district.name,
                    customer_ward_name: this.ward.name,
                    customer_street_name: this.street,
                    note: this.note,
                    status: "confirmed",
                }
                if (!this.city.name.includes("Tỉnh")) {
                    delete body["customer_province_name"]
                }

                let callUpdateOrder = await Restful.post(path, body, {}, headers)

                if (
                    callUpdateOrder.data &&
                    callUpdateOrder.data.data
                ) {
                    this.is_update_order = false
                    console.log("before")
                    // Yêu cầu ListOrder.vue get list order
                    EventBus.$emit("call-order")
                    console.log("after")

                    // Đẩy tin nhắn về Msg
                    if (
                        callUpdateOrder.data.data.order_id
                    ) {
                        let content = this.covertMsgContent(callUpdateOrder.data.data.order_id)
                        this.sendMessage(content)
                    } else {
                        let content = this.covertMsgContent("order_id")
                        this.sendMessage(content)
                    }
                    localStorage.removeItem("cus_phone")
                    Toast2.fire({
                        icon: "success",
                        title: "Cập nhật đơn hàng thành công",
                    })

                    this.$emit("switch-header")
                    // Xóa giỏ hàng sau khi tạo đơn
                    this.handleDeleteAllCart()
                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Đã xảy ra lỗi khi cập nhật đơn",
                    })
                    this.prevent_click = false
                }
            } catch (error) {
                this.prevent_click = false;
                if (error.data.error_message.message) {
                    Toast2.fire({
                        icon: "error",
                        title: error.data.error_message.message,
                    })
                    return
                }
                if (error.data.error_message) {
                    Toast2.fire({
                        icon: "error",
                        title: error.data.error_message,
                    })
                    return
                }
                if (error.errors) {
                    Toast2.fire({
                        icon: "error",
                        title: error.errors,
                    });
                    return
                }

                Toast2.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi khi cập nhật đơn",
                })
            }
        },
        handleShowForm(name) {
            this.show_form = name;
        },
        swalToast(title, icon) {
            const Toast = Swal.mixin({
                toast: true,
                position: "center",
                showConfirmButton: false,
                width: '80vw',
                timer: 2000,
                timerProgressBar: false,
                onOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer)
                    toast.addEventListener("mouseleave", Swal.resumeTimer)
                },
            });
            Toast.fire({
                icon: icon,
                title: title,
                padding: "5px",
            })
        },
    },
    beforeDestroy() {
        EventBus.$off("get-order")
        EventBus.$off("create-empty-order")
        EventBus.$off("disable-update-order")
    },
    watch: {
        store_token() {
            this.getInitialData();
            this.name = this.payload.name
            this.phone = this.payload.phone
            this.email = this.payload.email
        },
        platform_type() {
            if (this.wait_create_empty_order) {
                this.createEmptyOrder()
            }
        },
        total_price: function () {
            this.handleTotalPayment()
        },
        shipping_fee: function () {
            this.handleTotalPayment()
        },
        order_option: function (newValue) {
            if (newValue == 0) this.shipping_fee = 0
        }
    },
    filters: {
        // Convert số sang vnd
        toCurrency(value) {
            if (typeof value !== "number") {
                return value;
            }
            var formatter = new Intl.NumberFormat("de-DE", {
                style: "currency",
                minimumFractionDigits: 0,
                currency: "VND",
            })
            return formatter.format(value);
        },
    },
    destroyed() {
        EventBus.$off("get-order", (id) => {
            this.getOrderInfo(id)
        });
        EventBus.$off("create-empty-order", () => {
            if (!this.platform_type) {
                this.wait_create_empty_order = true
                return
            }
            this.createEmptyOrder()
        });
        EventBus.$off("disable-update-order", () => {
            this.is_update_order = false
        })
    },
};