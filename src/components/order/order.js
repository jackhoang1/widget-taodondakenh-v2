import EventBus from "@/EventBus.js"
import Restful from "@/services/resful.js"
import SearchAddress from "@/components/SearchAddress.vue"
import ViettelPost from "@/components/delivery/viettelPost/ViettelPost.vue"
// import Ghn from "@/components/delivery/ghn/Ghn.vue"
import Alepay from "@/components/payment/alepay/Alepay.vue"
import Delivery from "@/components/delivery/Delivery.vue"

// const APICMS = "https://ext.botup.io"  //product
const APICMS = "http://localhost:1337" //dev
// const APICMS = "http://188.166.250.86:1337"; //dev


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
        ViettelPost,
        Delivery,
        // Ghn,
        Alepay
    },
    props: [
        "store_token",
        "payload",
        "handleChangeAppToken",
    ],
    data() {
        return {
            res_order_info: "",
            product_info: {
                total_item: 0,
                list_product: ''
            },
            platform_type: "",
            delivery_platform: "",
            name: "",
            phone: "",
            street: "",
            country: "Việt Nam",
            list_city: [],
            city: {},
            list_district: [],
            district: {},
            list_ward: [],
            ward: {},
            list_city_delivery: [],
            city_delivery: {},
            list_district_delivery: [],
            district_delivery: {},
            list_ward_delivery: [],
            ward_delivery: {},
            address_delivery: "",

            email: "",
            list_branch: [],
            branch: {},
            has_branch: false,
            address: "",
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
            msg_content: 'Quý khách đã tạo thành công đơn hàng số {{order_id}} , đơn hàng của quý khách đang được giao vận.',
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
            type_location_order: 'order',
            type_location_delivery: 'delivery',
            info_delivery: "",

            reset_token: false,
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
        EventBus.$on('info-delivery-a', (e) => {
            this.info_delivery = e
            console.log(' this.info_delivery', this.info_delivery);
        })
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
            this.city = {}
            this.district = {}
            this.ward = {}
            this.address = ''
            this.street = ''
        },
        resetChangeCity() {
            this.district = {}
            this.ward = {}
        },
        resetChangeDistrict() {
            this.ward = {}
        },
        async getListCity() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/provinces`
                let params = { 'type_location': this.type_location_order }
                let headers = { 'Authorization': this.store_token }

                let get_list_city = await Restful.get(path, params, headers)
                console.log('list city', get_list_city);
                if (
                    get_list_city.data &&
                    get_list_city.data.data
                ) {
                    this.list_city = get_list_city.data.data
                }
            } catch (e) {
                console.log(e)
            }
        },
        async getListCityDelivery() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/provinces`
                let headers = { 'Authorization': this.store_token }
                let params = { 'type_location': 'delivery' }
                let get_list_city = await Restful.get(path, params, headers)

                if (
                    get_list_city.data &&
                    get_list_city.data.data
                ) {
                    this.list_city_delivery = get_list_city.data.data.provinces
                }
            } catch (error) {
                console.log("error", error)
            }
        },
        async getListDistrict() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/districts`
                let params = {
                    'type_location': this.type_location_order,
                    'province_id': this.city.id
                }
                let headers = { 'Authorization': this.store_token }

                let get_list_district = await Restful.get(path, params, headers)

                if (
                    get_list_district &&
                    get_list_district.data &&
                    get_list_district.data.data
                ) {
                    this.list_district = get_list_district.data.data
                    console.log('list_district', this.list_district);
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        async getListDistrictDelivery() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/districts`
                let params = {
                    'provinceId': this.city_delivery.PROVINCE_ID,
                    'type_location': 'delivery'
                }
                let headers = { Authorization: this.store_token }

                let get_district = await Restful.get(path, params, headers)
                console.log('get_district', get_district);
                if (
                    get_district.data &&
                    get_district.data.data
                ) {
                    this.list_district_delivery = get_district.data.data.districts
                }
            } catch (error) {
                console.log("error", error)
            }
        },
        async getListWard() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/wards`
                let params = {
                    'type_location': this.type_location_order,
                    'district_id': this.district.id
                }
                let headers = { 'Authorization': this.store_token }

                let get_list_ward = await Restful.get(path, params, headers)

                if (
                    get_list_ward &&
                    get_list_ward.data &&
                    get_list_ward.data.data
                ) {
                    let arr_ward = get_list_ward.data.data.map(ward => {
                        return {
                            'name': ward.ward_name,
                            'code': ward.ward_code
                        }
                    })

                    this.list_ward = arr_ward
                    console.log('list ward', this.list_ward);
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        async getListWardDelivery() {
            try {
                let path = `${APICMS}/v1/selling-page/locations/wards`
                let params = {
                    'districtId': this.district_delivery.DISTRICT_ID,
                    'type_location': 'delivery'
                }
                let headers = { Authorization: this.store_token }

                let get_ward = await Restful.get(path, params, headers)
                console.log('get_ward', get_ward);
                if (
                    get_ward.data &&
                    get_ward.data.data
                ) {
                    this.list_ward_delivery = get_ward.data.data.wards
                }
            } catch (error) {
                console.log("error", error)
            }
        },
        handleAsyncCityVTP() {
            console.log('handleAsyncCityVTP run', this.list_city_delivery);
            if (!this.city.name) return
            let arr_city = this.list_city_delivery.filter(city => {
                if (city.PROVINCE_NAME.toLowerCase().includes(this.city.name.toLowerCase())
                )
                    return city
            })
            this.city_delivery = arr_city[0]
            console.log('city delivery', this.city_delivery);

        },
        handleAsyncDistrictVTP() {
            if (!this.district.name) return
            console.log('list district', this.list_district_delivery);
            let arr_district = this.list_district_delivery.filter(district => {
                if (district.DISTRICT_NAME.toLowerCase().includes(this.district.name.toLowerCase())
                )
                    return district
            })
            console.log('arr_district', arr_district);

            this.district_delivery = arr_district[0]
        },
        handleAsyncWardVTP() {
            if (!this.ward.name) return
            console.log('list ward', this.list_ward_delivery);
            let arr_ward = this.list_ward_delivery.filter(ward => {
                if (ward.WARDS_NAME.toLowerCase().includes(this.ward.name.toLowerCase())
                )
                    return ward
            })
            console.log('arr_ward', arr_ward);
            this.ward_delivery = arr_ward[0]

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
                    get_cart &&
                    get_cart.data &&
                    get_cart.data.data
                ) {
                    console.log("get cart", get_cart)
                    this.cart = get_cart.data.data
                }

                // Tính tổng giá trị giỏ hàng
                let total = []
                if (this.cart.length > 0) {
                    this.cart.forEach((item) => {
                        let total_array = item.product_price * item.product_quantity
                        total.push(total_array)
                    })
                    this.total_price = total.reduce((a, b) => a + b)
                } else {
                    this.total_price = 0
                }
            } catch (e) {
                console.log("error", e)
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
                let add_cart = await Restful.post(path, body, {}, headers)
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

                let postDeleteCart = await Restful.post(path, body, {}, headers)

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
                    title: "Đã xảy ra lỗi",
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

                let postAddQuantity = await Restful.post(path, body, {}, headers)

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
                // Tăng số lượng sản phẩm trong giỏ hàng
                let path = `${APICMS}/v1/selling-page/cart/cart_sub_product`
                let body = {
                    product_id: item.product_id,
                    client_id: this.client_id,
                }
                let headers = { Authorization: this.store_token }

                let postAddQuantity = await Restful.post(path, body, {}, headers)

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
                !this.city.name ||
                !this.district.name ||
                !this.ward.name ||
                !this.email ||
                (this.order_option != 0 && !this.shipping_fee)
            ) {
                console.log(this.order_option);
                return Toast.fire({
                    icon: "error",
                    title: "Vui lòng điền đầy đủ thông tin",
                })
            }

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
            if (isNaN(Number(this.phone))) {
                Toast.fire({
                    icon: "error",
                    title: "Số điện thoại không hợp lệ",
                })
                return
            }
            this.address = `${this.street}, ${this.ward.name}, ${this.district.name}, ${this.city.name}`;
            // Hiện thông tin đơn hàng
            this.is_show_order_info = true
        },
        async handleCallApiOrder() {
            try {
                // Check xem đang tạo mới order hay update order
                if (this.is_update_order) {
                    this.updateOrder()
                    return
                }
                // Ngăn spam "Tạo đơn hàng"
                this.prevent_click = true

                // EventBus.$on("info_delivery", (e) => {
                //     this.info_delivery = e()
                //     console.log('order----info delivery', this.info_delivery);
                // });
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
                let path = `${APICMS}/v1/selling-page/order/order_create_3rd`
                let body = {
                    is_cod: this.is_cod,
                    is_gateway: this.is_gateway,
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
                    customer_province_code: this.city.code,
                    customer_district_code: this.district.code,
                    customer_ward_code: this.ward.code,
                    note: this.note,
                    status: "confirmed",
                    platform_type: this.platform_type,
                    branchId: this.branch.id,
                    other_info: {}

                }
                // tính tổng số sản phẩm và tên các sản phẩm
                this.handleProductSum(this.cart)
                //kt tuỳ chọn nếu chọn gateway sẽ gửi info delivery >tạo payment> orthor info
                if (this.order_option == 2) {
                    EventBus.$emit('info-delivery', this.product_info, this.total_price)
                    body.other_info.info_delivery = this.info_delivery
                }
                if (!body.branchId) delete body.branchId
                if (!this.city.name.includes("Tỉnh")) {
                    delete body["customer_province_name"]
                }
                if (this.platform_type === "MISA") {
                    delete body["branchId"]
                    body["BranchId"] = this.branch.id
                }
                // Tạo customer mới đối với Haravan
                if (this.platform_type === "HARAVAN") {
                    delete body["customer_city_name"]
                    body["customer_province_name"] = this.city.name
                }
                this.callOrder(path, body)
            } catch (e) {
                console.log(e)
            }
        },
        async callOrder(path, body) {
            try {
                // Call Api tạo đơn hàng
                Swal.showLoading()
                let headers = { Authorization: this.store_token }

                let create_order = await Restful.post(path, body, {}, headers)

                Swal.hideLoading()
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
                    console.log('this.res_order_info', this.res_order_info);

                    let order_id = create_order.data.data.order_info.order_id
                    let product_info = create_order.data.data.order_info.product_info
                    this.res_order_info = create_order.data.data
                    // Đẩy tin nhắn về Msg
                    if (order_id) {
                        let content = this.covertMsgContent(order_id)
                        this.sendMessage(content)
                    }
                    // this.resetAddress()

                    // gọi hàm tạo giao vận từ components delivery
                    console.log('order_option', this.order_option);
                    if (this.order_option == 1) {
                        console.log('run option 1');
                        EventBus.$emit("create-delivery", order_id)
                    }
                    else if (this.order_option == 2) {
                        // gọi hàm tạo thanh toán từ components payment
                        EventBus.$emit("create-payment", order_id)
                        // EventBus.$emit("create-delivery", order_id)
                    }
                    Toast2.fire({
                        icon: "success",
                        title: "Tạo đơn hàng thành công",
                    })
                    // show modal choose delivery or payment
                    // Xóa giỏ hàng sau khi tạo đơn
                    this.handleDeleteAllCart()
                    setTimeout(() => {
                        EventBus.$emit("call-order")
                    }, 1000)

                } else {
                    Swal.hideLoading()
                    Toast.fire({
                        icon: "error",
                        title: "Lỗi khi tạo đơn, Vui lòng thử lại!",
                    });
                    this.prevent_click = false
                }
            } catch (e) {
                Swal.hideLoading()
                console.log("eeeeeeeeeeeeeeee", e);
                this.prevent_click = false
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
                    title: "Đã xảy ra lỗi",
                });
            }
        },
        async createHaravanCustomer(body) {
            try {
                let path = `${APICMS}/v1/selling-page/other/haravan_create_customer`
                console.log("haraas")
                let customer = {
                    customer_name: this.name,
                    customer_email: this.email,
                    customer_address: this.address,
                    customer_phone: this.phone,
                    customer_province_name: this.city.name,
                    customer_city_name: this.city.name,
                    access_token: this.store_token,
                }

                let createCustomer = await Restful.post(path, customer)

                console.log("hrv acc success")
                path = `${APICMS}/v1/selling-page/order/order_create_3rd`
                this.callOrder(path, body)
            } catch (e) {
                console.log("eeer", e.data.error_message)
                if (
                    e &&
                    e.data &&
                    e.data.error_message === 'Địa chỉ Email đã được sử dụng.'
                ) {
                    let path = `${APICMS}/v1/selling-page/order/order_create_3rd`
                    let body = {
                        access_token: this.store_token,
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
                if (e && e.data && e.data.error_message) {
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

                let postDeleteAllCart = await Restful.post(path, body, {}, headers)

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
        async sendMessage(content) {
            try {
                let list_product = this.cart.map((item) => {
                    return `${item.product_quantity}  ${item.product_name} \n`
                });
                let strProduct = list_product.join(" ")

                let path = `https://api.botbanhang.vn/v1.3/public/json`
                let params = {
                    access_token: this.payload.token_bbh,
                    psid: this.payload.mid,
                }
                let body = {
                    messages: [
                        { text: content },
                        {
                            text: `Tên khách hàng: ${this.name} \nSố điện thoại: ${this.phone} \nEmail: ${this.email} \nĐịa chỉ: ${this.address}`,
                        },
                        {
                            text: `Danh sách sản phẩm: \n${strProduct} \nTổng giá trị đơn hàng: \n${this.$options.filters.toCurrency(
                                this.total_price
                            )}`,
                        },
                    ],
                }

                let message = await Restful.post(path, body, params)

                console.log("send", body)
            } catch (e) {
                console.log("error send mess", e)
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
                    !this.has_branch && this.getBranchKiotviet()
                }
                if (this.platform_type === "MISA") {
                    !this.has_branch && this.getBranchMisa()
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
            this.getListCity()
            this.getListCityDelivery()

            // Load giỏ hàng
            this.getCart()
        },
        async getBranchKiotviet() {
            try {
                let store_token = localStorage.getItem('order_store_token')
                if (!store_token) throw 'token is emply'
                let path = `${APICMS}/v1/selling-page/other/kiotviet_get_branch`
                let body = {
                    access_token: store_token,
                }
                // Lấy danh sách chi nhánh Kiotviet
                let get_branch = await Restful.post(path, body)
                if (
                    get_branch &&
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
                    e &&
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
                    title: "Đã xảy ra lỗi",
                });
                console.log("get branch err", e)
            }
        },
        async resetTokenKiotviet() {
            try {
                if (this.reset_token) return;
                let path = `${APICMS}/v1/selling-page/other/kiotviet_update_token`
                let body = {
                    access_token: this.store_token,
                }

                let reset_token_kiotviet = await Restful.post(path, body)

                if (
                    reset_token_kiotviet &&
                    reset_token_kiotviet.data &&
                    reset_token_kiotviet.data.data
                ) {
                    this.reset_token = true
                    let store_token = reset_token_kiotviet.data.data.store_token
                    localStorage.setItem('order_store_token', store_token)
                    this.handleChangeAppToken(store_token)
                    this.getBranchKiotviet()
                    return true
                }
                console.log("reset_token_kiotviet", reset_token_kiotviet)
            } catch (e) {
                console.log(e)
            }
        },
        async resetTokenMisa() {
            if (this.reset_token) return
            let path_api_reset = `${APICMS}/v1/selling-page/other/misa_update_token`
            let body = {
                access_token: this.store_token,
            }

            let reset_token_misa = await Restful.post(path_api_reset, body)

            if (
                reset_token_misa &&
                reset_token_misa.data &&
                reset_token_misa.data.data
            ) {
                this.reset_token = true
                let store_token = reset_token_misa.data.data.store_token
                localStorage.setItem('order_store_token', store_token)
                this.handleChangeAppToken(store_token)
                this.getBranchMisa()
                return true
            }
            console.log("reset_token_misa", reset_token_misa)
        },
        async getBranchMisa() {
            try {
                let store_token = localStorage.getItem('order_store_token')
                if (!store_token) throw 'token is emply'
                let path = `${APICMS}/v1/selling-page/other/misa_get_branch`
                let body = {
                    access_token: store_token,
                }
                // Lấy danh sách chi nhánh MISA
                let get_branch = await Restful.post(path, body)

                console.log("get branch misa", get_branch)
                if (
                    get_branch &&
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
                    get_branch &&
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
                    title: "Đã xảy ra lỗi",
                });
                console.log("get branch err", e);
            }
        },

        showSettingMsg() {
            this.is_show_setting_msg = !this.is_show_setting_msg;
        },
        async getOrderInfo(id) {
            // Reset client_id tránh loạn giỏ hàng
            this.client_id = ''
            localStorage.removeItem("client_id")
            this.cart = []
            let path = `${APICMS}/v1/selling-page/order/order_read`
            let params = {
                access_token: this.store_token,
                id,
            }

            let order = await Restful.get(path, params)

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
                    this.city = {}
                    this.district = {}
                    this.ward = {}
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
                let body = {
                    access_token: this.store_token,
                    customer_name: this.name,
                    customer_phone: this.phone,
                    customer_address: "Chưa xác định",
                    status: "unconfirmed",
                    platform_type: this.platform_type,
                };

                let emptyOrder = await Restful.post(path, body)

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
                        title: "Đã xảy ra lỗi",
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
                let body = {
                    access_token: this.store_token,
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

                let callUpdateOrder = await Restful.post(path, body)

                if (callUpdateOrder.data &&
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
                        title: "Đã xảy ra lỗi",
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
                    title: "Đã xảy ra lỗi",
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
        city: function () {
            console.log('11111');
            this.handleAsyncCityVTP()
            this.getListDistrictDelivery()
        },
        district: function () {
            console.log('22222');
            this.handleAsyncDistrictVTP()
            this.getListWardDelivery()
        },
        ward: function () {
            console.log('333333');
            this.handleAsyncWardVTP()
        },
        total_price: function () {
            this.handleTotalPayment()
        },
        shipping_fee: function () {
            this.handleTotalPayment()
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
};