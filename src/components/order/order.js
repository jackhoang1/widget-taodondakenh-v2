import EventBus from "@/EventBus.js"
import Restful from "@/services/resful.js"
import SearchAddress from "@/components/SearchAddress.vue"
import Payment from "@/components/payment/Payment.vue"
import Delivery from "@/components/delivery/Delivery.vue"
import { APICMS } from "@/services/domain.js"

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
        Payment
    },
    props: [
        "store_token",
        "payload",
        "handleShowCreateOrder",
        'showLogin',
        'hideLogin'
    ],
    data() {
        return {
            res_order_info: "",
            product_info: {
                total_item: 0,
                list_product: ''
            },
            skip: 20,
            platform_type: this.payload.platform_type,
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
            search_value_old: "",
            note: "",
            is_show_note: false,
            cart: [],
            order_id: "",

            total_payment: 0,
            total_price: 0,
            shipping_fee: 0,
            list_product: [],

            is_show_order_info: false,
            msg_content_reset: {
                order: 'Thông tin đơn hàng',
                delivery: 'Đơn hàng {{order_id}} của bạn đã được vận chuyển. Mã vận đơn là {{delivery_id}}. Để kiểm tra tình trạng giao hàng, vui lòng ấn nút "Kiểm tra vận đơn" bên dưới',
                payment: 'Thanh toán đơn hàng {{order_id}} của bạn trên {{payment_name}}, vui lòng ấn nút "Thanh toán" bên dưới'
            },
            msg_content: {
                order: 'Thông tin đơn hàng',
                delivery: 'Đơn hàng {{order_id}} của bạn đã được vận chuyển. Mã vận đơn là {{delivery_id}}. Để kiểm tra tình trạng giao hàng, vui lòng ấn nút "Kiểm tra vận đơn" bên dưới',
                payment: 'Thanh toán đơn hàng {{order_id}} của bạn trên {{payment_name}}, vui lòng ấn nút "Thanh toán" bên dưới'
            },
            is_show_setting_msg: false,
            is_update_order: false,
            wait_create_empty_order: false,

            show_modal_option: false,
            show_delivery: false,
            show_payment: false,
            show_form: 'order',
            validate_failed: {
                name: false,
                phone: false,
                email: false,
                country: false,
                city: false,
                district: false,
                ward: false,
                street: false,
                branch: false,
            },

            order_option: 0,
            is_cod: false,
            is_gateway: false,
            info_delivery: "",
            handle_api: false,
            reset_token: false,
            validate_info: false,
            is_loading: false,
            is_edit_msg: false,
            showSetting: false,
            showSettingContent: true,
        };
    },
    created() {
        console.log('create component order');
        if (this.store_token) {
            this.getInitialData()
            this.name = this.payload.name
            this.phone = this.payload.phone
            this.email = this.payload.email
        }
        EventBus.$on("get-order", (item) => {
            this.getOrderInfo(item)
        });
        EventBus.$on("show-modal-setting", () => {
            this.showFormLogin()
        });
        EventBus.$on("hide-modal-setting", () => {
            this.hideFormLogin()
        });
    },
    mounted() {
    },
    methods: {
        getEmailLocal() {
            if (this.email || !this.payload.store_email) return
            this.email = this.payload.store_email
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
                    this.skip = 20
                    let params = {
                        search: this.search_value,
                    }
                    await this.getListProduct(params)
                    if (this.list_product.length > 0) return
                    if (this.list_product.length == 0 && (this.platform_type == 'SAPO' || this.platform_type == 'HARAVAN')) {
                        await this.getListProduct()
                        this.searchByFilter()
                        if (this.filter_list_product.length == 0) {
                            return Toast.fire({
                                icon: "error",
                                title: "Không tìm thấy sản phẩm",
                            })
                        }
                    }
                    if (this.list_product.length == 0) {
                        Toast.fire({
                            icon: "error",
                            title: "Không tìm thấy sản phẩm",
                        })
                    }
                }
            } catch (e) {
                console.log("error", e)
                Toast.fire({
                    icon: "error",
                    title: "Lỗi khi tìm kiếm",
                })
            }
        },
        searchByFilter() {
            let products = this.list_product
            let search = this.search_value.toLowerCase()
            this.filter_list_product = products.filter((item) => {
                return item.product_name.toLowerCase().includes(search)
            })
        },
        handleClosePopup() {
            // Close Popup tìm sản phẩm
            this.is_show_popup = !this.is_show_popup
            this.search_value = ''
            this.search_value_old = ''
            this.skip = 20
            this.filter_list_product = []
            this.getCart()
        },
        handleShowNote() {
            this.is_show_note = !this.is_show_note
            if (this.is_show_note) {
                setTimeout(() => {
                    if (this.$refs.note)
                        this.$refs.note.focus()
                })
            }
        },
        handleModalSetting() {
            this.showSetting = !this.showSetting
        },
        showModalSettingContent() {
            this.showSettingContent = true
        },
        hideModalSettingContent() {
            this.showSettingContent = false
        },
        showFormLogin() {
            console.log('close run');
            this.showLogin()
            this.hideModalSettingContent()
        },
        hideFormLogin() {
            this.hideLogin()
            this.showModalSettingContent()
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
                    return
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
                if (this.platform_type === 'ONLINE_CRM') {
                    body['product_id'] = item.product_code
                    body['product_code'] = item.product_code
                }
                // Thêm sản phẩm vào giỏ hàng
                let add_cart = await Restful.post(path, body, null, headers)
                // Lưu client_id và lưu vào localStorage
                if (
                    add_cart.data &&
                    add_cart.data.data &&
                    add_cart.data.data.client_id
                ) {
                    this.client_id = add_cart.data.data.client_id
                    this.client_id && localStorage.setItem("order_3rd_client_id", this.client_id)
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
        async delProductCart(item) {
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
            let is_email = reg.test(email)
            if (is_email) {
                return true
            }
            this.validate_failed.email = !is_email ? true : false
            this.swalToast('Email không hợp lệ!', 'error')
        },
        validatePhone(phone) {
            let is_phone = phone.match(/^[0]{1}?[1-9]{1}?[0-9]{8}$/im) || phone.match(/^[\+]?[8]{1}?[4]{1}?[0-9]{9}$/im)
            if (is_phone) {
                return true
            }
            this.validate_failed.phone = !is_phone ? true : false
            this.swalToast('Số điện thoại không hợp lệ', 'error')
        },
        validateOrder() {
            this.validate_failed.name = !this.name ? true : false
            this.validate_failed.phone = !this.phone ? true : false
            this.validate_failed.email = !this.email ? true : false
            this.validate_failed.country = !this.country ? true : false
            this.validate_failed.city = !this.city ? true : false
            this.validate_failed.district = !this.district ? true : false
            this.validate_failed.ward = !this.ward ? true : false
            this.validate_failed.street = !this.street ? true : false
            this.validate_failed.branch = !Object.keys(this.branch)[0] ? true : false
            if (!this.name || !this.phone || !this.email || !this.country || !this.city || !this.district || !this.ward || !this.street) {
                return false
            }
            if (this.list_branch[0] && !Object.keys(this.branch)[0]) {
                return false
            }
            return true
        },
        validateAll() {
            let check = true
            if (!this.validateOrder()) check = false
            //check validate components delivery, payment
            if (this.$refs.delivery) {
                let validate_delivery = this.$refs.delivery.validateCreateDelivery()
                if (validate_delivery == 'failed') check = 'failed'
                if (!validate_delivery) check = false
            }
            if (this.$refs.payment) {
                let validate_payment = this.$refs.payment.validateCreatePayment()
                if (!validate_payment) check = false
            }
            if (!check) {
                Toast.fire({
                    icon: "error",
                    title: "Vui lòng điền đầy đủ thông tin",
                })
            }
            if (!this.validatePhone(this.phone)) check = false
            if (!this.validateEmail(this.email)) check = false

            return check
        },
        handleCreateOrder() {
            if (this.cart.length == 0) {
                return this.swalToast('Giỏ hàng trống, hãy thêm sản phẩm!', 'error')
            }
            if (!this.validateAll() || this.validateAll() == 'failed') { return }
            if (this.order_option != 0 && !this.shipping_fee) {
                return Toast.fire({
                    icon: "error",
                    title: "Hệ thống đang tính phí giao vận. Vui lòng thử lại!"
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
                // if (this.is_update_order) {
                //     this.updateOrder()
                //     return
                // }
                // Ngăn spam "Tạo đơn hàng"
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
                    "fb_client_id": this.payload.psid,
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
                    "status": "new_order",
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
                    body.other_info.msg_config.messages = this.msg_content.delivery
                    body.other_info.msg_config.access_token = this.store_token
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
                if (this.platform_type === 'ONLINE_CRM') {
                    delete body['customer_city_name']
                    delete body['customer_city_code']
                }
                if (this.is_update_order) {
                    return this.updateOrder(body)
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
                    let time = create_order.data.data.order_info.updatedAt
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
                        this.sendMessage(order_id, null, null, time)
                    }
                    setTimeout(() => {
                        this.delAllCart()
                    }, 1000)
                    setTimeout(() => {
                        EventBus.$emit("call-order")
                        this.handleShowCreateOrder()
                    }, 1000)

                } else {
                    Toast.fire({
                        icon: "error",
                        title: "Lỗi khi tạo đơn, Vui lòng thử lại!",
                    });
                }
                this.is_loading = false
            } catch (e) {
                this.is_loading = false
                console.log("eeeeeeeeeeeeeeee", e);
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
                if (e.data && e.data.error_message) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.error_message,
                    });
                    return;
                }
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
        async delAllCart() {
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
                this.getCart()
                // Đóng chi tiết đơn hàng
                this.closeOrderInfo()
            } catch (e) {
                console.log("error", e)
            }
        },
        covertMsgContent(order_id, delivery_id, payment_name) {
            let msg_order = this.msg_content.order.replace(/{{order_id}}/g, order_id)
            let msg_delivery = this.msg_content.delivery.replace(/{{order_id}}/g, order_id).replace(/{{delivery_id}}/g, delivery_id)
            let msg_payment = this.msg_content.payment.replace(/{{order_id}}/g, order_id).replace(/{{payment_name}}/g, payment_name)
            return { msg_order, msg_delivery, msg_payment }
        },
        async sendMessage(order_id, url_payment, delivery_id, time = 1577840400000) {
            try {
                let msg_sample = this.covertMsgContent(order_id, delivery_id, this.payload.payment_platform);
                let timestamp = Number(time.toString().slice(0, 10))
                let address = {
                    "street_1": `${this.street}`,
                    "street_2": "",
                    "city": `${this.district.name}`,
                    "postal_code": `${this.city.meta_data.haravan.province_id}`,
                    "state": `${this.city.meta_data.haravan.code}`,
                    "country": "VN"
                }
                let summary = {
                    "subtotal": `${this.total_price}`,
                    "shipping_cost": `${this.shipping_fee}`,
                    "total_cost": `${this.total_payment}`
                }
                let elements = this.cart.map(product => {
                    return {
                        "title": `${product.product_name}`,
                        "quantity": `${product.product_quantity}`,
                        "price": `${product.product_price}`,
                        "currency": "VND",
                        "image_url": `${product.product_image}`
                    }
                })
                let payload = {
                    "template_type": "receipt",
                    "recipient_name": `${this.name}`,
                    "order_number": `${order_id}`,
                    "currency": "VND",
                    "payment_method": 'No',
                    "timestamp": `${timestamp}`,
                    address,
                    summary,
                    elements
                }
                let template_btn = []
                if (this.order_option == 1) {
                    payload['payment_method'] = `Ship cod ${this.payload.delivery_platform}`
                    template_btn = template_btn.concat(
                        [
                            {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "button",
                                        "text": msg_sample.msg_delivery,
                                        "buttons": [
                                            {
                                                "type": "web_url",
                                                "url": `https://devbbh.tk/dev-cms/#/deliver/?access_token=${this.store_token}&order_id=${delivery_id}`,
                                                "title": "Kiểm tra vận đơn"
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    )
                }
                if (this.order_option == 2) {
                    payload['payment_method'] = `Payment ${this.payload.payment_platform}`
                    template_btn = template_btn.concat(
                        [
                            {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "button",
                                        "text": msg_sample.msg_payment,
                                        "buttons": [
                                            {
                                                "type": "web_url",
                                                "url": `${url_payment}`,
                                                "title": "Thanh toán"
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    )
                }
                let messages = [
                    { text: msg_sample.msg_order },
                    {
                        "attachment": {
                            "type": "template",
                            payload
                        }
                    }
                ]
                messages = messages.concat(template_btn)
                let body = { messages }
                let path = `https://api.botbanhang.vn/v1.3/public/json`
                let params = {
                    access_token: this.payload.token_bbh,
                    psid: this.payload.psid,
                }

                let sent_message = await Restful.post(path, body, params)

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
                    if (
                        get_list_product.data.data[0] &&
                        get_list_product.data.data[0].platform_type
                    ) {
                        this.platform_type = get_list_product.data.data[0].platform_type
                        this.$emit('platform_type', this.platform_type)
                    }
                }
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
                return product.image
            };

            products.map((product, index) => {
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
        async getMoreProduct() {
            try {
                let path = `${APICMS}/v1/selling-page/product/product_read`
                let headers = {
                    Authorization: this.store_token
                }
                let params = {
                    skip: this.skip,
                    search: this.search_value
                }
                if (this.search_value) {
                    if (this.search_value != this.search_value_old) {
                        this.skip = 20
                    }
                    this.search_value_old = this.search_value
                }
                // Load danh sách sản phẩm
                let get_list_product = await Restful.get(path, params, headers)

                if (
                    get_list_product.data &&
                    get_list_product.data.data
                ) {
                    let list_product = get_list_product.data.data
                    if (list_product.length == 0) {
                        return this.swalToast('Đã hiện hết sản phẩm', 'success')
                    }
                    this.skip = this.skip + 20
                    if (this.platform_type === "HARAVAN" || this.platform_type === "SAPO") {
                        return this.convertMoreProduct(list_product)
                    }
                    this.list_product = this.list_product.concat(list_product)


                }
                // Convert data theo variant nếu là Haravan và Sapo

            } catch (e) {
                console.log("get product err", e)
            }
        },
        convertMoreProduct(products) {
            if (products.length == 0) return
            let findImage = (product, imageId) => {
                if (product.images) {
                    product.images.map((image) => {
                        if (image.id === imageId) {
                            return image.src
                        }
                    });
                }
                return product.image
            };
            products.map((product, index) => {
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
            if (localStorage.getItem("order_3rd_client_id")) {
                this.client_id = localStorage.getItem("order_3rd_client_id")
            }
            if (localStorage.getItem("order_3rd_msg_content")) {
                this.msg_content = JSON.parse(localStorage.getItem("order_3rd_msg_content"))
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
                    if (this.list_branch && this.list_branch.length > 0) {
                        this.branch = this.list_branch[0]   //default branch 1
                    }
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

                if (
                    get_branch.data &&
                    get_branch.data.data
                ) {
                    let branchs = get_branch.data.data
                    this.has_branch = true
                    if (branchs && branchs.length > 0) {
                        this.list_branch = branchs.map((branch) => {
                            return { id: branch.Id, branchName: branch.Name }
                        })
                        this.branch = this.list_branch[0]   //default branch 1
                    }
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

        async getOrderInfo(item) {
            // Reset client_id tránh loạn giỏ hàng
            console.log('getOrderInfo', item);
            this.client_id = ''
            localStorage.removeItem("order_3rd_client_id")
            this.cart = []
            this.is_update_order = true
            this.name = item.customer_name
            this.phone = item.customer_phone
            this.email = item.customer_email || this.payload.store_email  //customer không có email > email merchant
            this.platform_type = item.platform_type
            this.order_id = item.id
            this.$emit('msg-info', item.other_info)
        },
        async updateOrder(data) {
            try {
                this.is_loading = true
                let path = `${APICMS}/v1/selling-page/order/order_update_3rd`
                let headers = { Authorization: this.store_token }
                let body = {
                    ...data,
                    id: this.order_id
                }

                let update_order = await Restful.post(path, body, {}, headers)

                if (
                    update_order.data &&
                    update_order.data.data &&
                    update_order.data.data.order_info &&
                    update_order.data.data.order_info.order_id
                ) {
                    this.is_update_order = false
                    let order_id = update_order.data.data.order_info.order_id
                    let time = update_order.data.data.order_info.updatedAt
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
                        this.sendMessage(order_id, null, null, time)
                    }
                    setTimeout(() => {
                        this.delAllCart()
                    }, 1000)
                    setTimeout(() => {
                        EventBus.$emit("call-order")
                        this.$emit("switch-header")
                        this.handleShowCreateOrder()
                    }, 1000)
                    this.is_loading = false
                    // Xóa giỏ hàng sau khi tạo đơn
                } else {
                    this.is_loading = false
                    Toast.fire({
                        icon: "error",
                        title: "Đã xảy ra lỗi khi cập nhật đơn",
                    })
                }
            } catch (error) {
                this.is_loading = false
                if (error.data && error.data.error_message && error.data.error_message.message) {
                    Toast2.fire({
                        icon: "error",
                        title: error.data.error_message.message,
                    })
                    return
                }
                if (error.data && error.data.error_message) {
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
        checkPayment() {
            if (!this.payload.payment_platform) {
                return this.swalToast("Hãy cài đặt thanh toán để sử dụng chức năng này!", "warning")
            }
        },
        checkDelivery() {
            if (!this.payload.delivery_platform) {
                return this.swalToast("Hãy cài đặt giao vận để sử dụng chức năng này!", "warning")
            }
        },
        handleShowForm(name) {
            this.show_form = name;
        },
        handleModalEditMsg() {
            this.is_edit_msg = !this.is_edit_msg
            if (this.is_edit_msg) {
                setTimeout(() => {
                    if (this.$refs.msg_order)
                        this.$refs.msg_order.focus()
                })
            }
        },
        handleSaveMsg() {
            localStorage.setItem('order_3rd_msg_content', JSON.stringify(this.msg_content))
            this.handleModalEditMsg()
        },
        handleResetMsg() {
            this.msg_content = this.msg_content_reset
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
    watch: {
        store_token() {
            this.getInitialData();
            this.name = this.payload.name
            this.phone = this.payload.phone
            this.email = this.payload.email
        },
        total_price: function () {
            this.handleTotalPayment()
        },
        shipping_fee: function () {
            this.handleTotalPayment()
        },
        order_option: function (newValue) {
            if (newValue == 0) this.shipping_fee = 0
        },
        'payload.platform_type': function () {
            this.platform_type = this.payload.platform_type
        },
        'payload.store_email': function () {
            this.getEmailLocal()
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
        EventBus.$off("get-order", (item) => {
            this.getOrderInfo(item)
        })
        EventBus.$off("show-modal-setting", () => {
            this.showFormLogin()
        });
        EventBus.$off("hide-modal-setting", () => {
            this.hideFormLogin()
        });
    },
};