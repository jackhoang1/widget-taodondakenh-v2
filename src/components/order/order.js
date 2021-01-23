import EventBus from "@/EventBus.js"
import Restful from "@/services/resful.js"
import SearchAddress from "@/components/SearchAddress.vue"
import Payment from "@/components/payment/Payment.vue"
import Delivery from "@/components/delivery/Delivery.vue"
import { APICMS, apiCmsCheckDelivery } from "@/services/constant.js"
import compDetectAddress from "@/components/DetectAddress.vue"
import compSwitch from "@/components/switch/Switch.vue"
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
        compDetectAddress,
        compSwitch,
        SearchAddress,
        Delivery,
        Payment
    },
    props: [
        'store_token',
        'dataInit',
        'payload',
        'handleHideCreateOrder',
        'handleShowCreateOrder',
        'showLogin',
        'hideLogin',
        'readSetting',
        'updateSetting'
    ],
    data() {
        return {
            detectAddress: "",
            res_order_info: "",
            product_info: {
                total_item: 0,
                list_product: ''
            },
            listDiscount: [{ type: 1, name: 'Số tiền' }, { type: 2, name: 'Theo %' }],
            discount: { type: 1, name: 'Số tiền' },
            discountNumber: 0,
            discountNumberString: '0 đ',
            discountPercent: 0,
            discountPercentNum: 0,

            skip: 20,
            platform_type: this.payload.platform_type,
            name: "",
            phone: "",
            street: "",
            streetOrderEdit: "",
            house_number: "",
            country: "Việt Nam",
            list_city: [],
            city: "",
            list_district: [],
            district: "",
            list_ward: [],
            ward: "",

            email: "botbanhang@gmail.com",
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
            listProductWillAddToCart: [],
            id: "",
            order_id: "",

            total_payment: 0,
            total_price: 0,
            totalPriceDiscount: 0,
            shipping_fee: 0,
            list_product: [],
            is_show_order_info: false,
            msg_content_reset: {
                order: 'Thông tin đơn hàng',
                delivery: 'Đơn hàng {{order_id}} của bạn đã được vận chuyển. Mã vận đơn là {{delivery_id}}. Để kiểm tra tình trạng giao hàng, vui lòng ấn nút "Kiểm tra vận đơn" bên dưới',
                payment: 'Thanh toán đơn hàng {{order_id}} của bạn trên {{payment_name}}, vui lòng ấn nút "Thanh toán" bên dưới',
                activated: { order: true, delivery: true, payment: true }
            },
            msg_content: {
                order: 'Thông tin đơn hàng',
                delivery: 'Đơn hàng {{order_id}} của bạn đã được vận chuyển. Mã vận đơn là {{delivery_id}}. Để kiểm tra tình trạng giao hàng, vui lòng ấn nút "Kiểm tra vận đơn" bên dưới',
                payment: 'Thanh toán đơn hàng {{order_id}} của bạn trên {{payment_name}}, vui lòng ấn nút "Thanh toán" bên dưới',
                activated: { order: true, delivery: true, payment: true }
            },
            is_show_setting_msg: false,
            statusEditOrder: 'normal',
            wait_create_empty_order: false,

            show_modal_option: false,
            show_delivery: false,
            show_payment: false,
            show_form: 'order',
            validate_failed: {
                name: false,
                phone: false,
                country: false,
                city: false,
                district: false,
                ward: false,
                street: false,
                branch: false,
                product: false
            },
            order_option: 0,
            listSaveAddress: '',
            saveAddress: '',
            saveAddressModal: '',
            is_cod: false,
            is_gateway: false,
            info_delivery: '',
            handle_api: false,
            reset_token: false,
            validate_info: false,
            is_loading: false,
            is_edit_msg: false,
            isFreeShip: false,
            showSaveAddress: false,
            showSetting: false,
            showSettingContent: true,
            isCallApi: false
        };
    },
    created() {
        if (this.store_token) {
            this.initialData()
            this.name = this.payload.name
            this.phone = this.payload.phone
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

                let listCity = await Restful.get(path, null, headers)

                if (listCity.data && listCity.data.data) {
                    this.list_city = listCity.data.data
                }
            } catch (e) {
                console.log(e)
            }
        },
        async getListDistrict() {
            try {
                if (!this.city.province_id) return console.log('require province_id');
                let path = `${APICMS}/v1/selling-page/locations/districts_v2`
                let params = { 'province_id': this.city.province_id }
                let headers = { 'Authorization': this.store_token }

                let listDistrict = await Restful.get(path, params, headers)

                if (listDistrict.data && listDistrict.data.data) {
                    this.list_district = listDistrict.data.data
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        async getListWard() {
            try {
                if (!this.district.district_id) return console.log('require district_id');
                let path = `${APICMS}/v1/selling-page/locations/wards_v2`
                let params = { 'district_id': this.district.district_id }
                let headers = { 'Authorization': this.store_token }

                let listWard = await Restful.get(path, params, headers)

                if (listWard.data && listWard.data.data) {
                    this.list_ward = listWard.data.data
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        async readCustomerAddress() {
            try {
                let customer_id = this.payload.customer_id

                if (!customer_id) return

                let path = `${APICMS}/v1/selling-page/customer/customer_address_read`
                let headers = { Authorization: this.store_token }
                let body = { customer_id }

                let customerAddress = await Restful.post(path, body, null, headers)

                if (
                    customerAddress &&
                    customerAddress.data &&
                    customerAddress.data.data &&
                    customerAddress.data.data.length > 0
                ) {
                    this.listSaveAddress = customerAddress.data.data
                    if (this.listSaveAddress.length > 0)
                        this.saveAddressModal = this.listSaveAddress[0]
                }

            } catch (e) {
                console.log(e);
            }
        },
        async deleteCustomerAddress(saveAddressModal) {
            try {
                if (!saveAddressModal || !saveAddressModal.id) return
                let id = saveAddressModal.id
                let path = `${APICMS}/v1/selling-page/customer/customer_address_delete`
                let headers = { Authorization: this.store_token }
                let params = { id }

                let delCustomerAddress = await Restful.get(path, params, headers)
                if (
                    delCustomerAddress
                ) {
                    this.saveAddressModal = ''
                    this.listSaveAddress = this.listSaveAddress.filter((address, index) => {
                        if (address.id != id) {
                            return address
                        }
                    })
                }

            } catch (e) {
                console.log(e);
            }
        },
        async handleShowPopup() {   // * show popup list product  tự map attribute check cart
            // Show Popup khi nhấn "Thêm sản phẩm"
            try {
                this.is_show_popup = !this.is_show_popup
                await this.getListProduct()
                this.list_product = this.handleCheckCartInListProduct(this.list_product)
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
                    if (
                        this.list_product.length === 0 &&
                        (this.platform_type === 'SAPO' || this.platform_type === 'HARAVAN')
                    ) {
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

            this.filter_list_product = this.handleCheckCartInListProduct(this.filter_list_product)
        },
        toggleClosePopup() {
            // Close Popup tìm sản phẩm
            this.is_show_popup = !this.is_show_popup
            this.search_value = ''
            this.search_value_old = ''
            this.skip = 20
            this.filter_list_product = []
            this.list_product = this.handleCheckCartInListProduct(this.list_product)
        },
        async toggleSavePopup() {
            this.is_show_popup = !this.is_show_popup
            this.search_value = ''
            this.search_value_old = ''
            this.skip = 20
            this.filter_list_product = []
            await this.handleCheckProductAddCart()
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
        async getCart(_type) { // * lấy giỏ hàng
            try {
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
                    get_cart.data.data &&
                    get_cart.data.data.cart
                ) {
                    if (!_type) {
                        let cart = get_cart.data.data.cart
                        this.cart = cart
                    }

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
                    return console.log('Error ::: Thêm sản phẩm thất bại');
                }
                if (this.isCallApi) return
                this.isCallApi = true

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
                // Lưu client_id api setting
                if (add_cart &&
                    add_cart.data &&
                    add_cart.data.data &&
                    add_cart.data.data.client_id
                ) {
                    this.client_id = add_cart.data.data.client_id
                }
                this.isCallApi = false
                return console.log('Thêm sản phẩm thành công');

            } catch (error) {
                this.isCallApi = false
                console.log("error", error);
                Toast.fire({
                    icon: "error",
                    title: "Thêm sản phẩm thất bại",
                });
            }
        },
        async delProductCart(item) {// *     xoá 1 sản phẩm trong giỏ hàng
            try {
                if (this.isCallApi) return
                this.isCallApi = true
                let path = `${APICMS}/v1/selling-page/cart/cart_delete_product`
                let body = {
                    product_id: item.product_id,
                    client_id: this.client_id,
                }
                let headers = { Authorization: this.store_token }

                let postDeleteCart = await Restful.post(path, body, null, headers)
                if (
                    postDeleteCart &&
                    postDeleteCart.data &&
                    postDeleteCart.data.data
                ) {
                    let product = postDeleteCart.data.data
                    this.total_price = this.total_price - product.product_price * product.product_quantity

                    this.cart = this.cart.filter((product, index) => {
                        if (item.product_id !== product.product_id) return product
                    })
                }
                this.isCallApi = false
                return console.log("Đã xóa sản phẩm");
            } catch (error) {
                this.isCallApi = false
                console.log("error", error);
                Toast.fire({
                    icon: "error",
                    title: "Lỗi khi xoá giỏ hàng",
                });
            }
        },
        async handleAddQuantity(item) { // * tăng 1 sản phẩm trong giỏ hàng

            try {
                if (this.isCallApi) return
                this.isCallApi = true
                let path = `${APICMS}/v1/selling-page/cart/cart_add_product`
                let body = {
                    product_id: item.product_id,
                    client_id: this.client_id,
                }
                let headers = { Authorization: this.store_token }

                let addQuantity = await Restful.post(path, body, null, headers)
                if (addQuantity && addQuantity.data && addQuantity.data.data) {
                    let product = addQuantity.data.data
                    this.total_price = this.total_price + product.product_price

                    this.cart.map(product => {
                        if (product.product_id === item.product_id) {
                            product.product_quantity++
                        }
                        return product
                    })
                }
                this.isCallApi = false
            } catch (error) {
                this.isCallApi = false
                console.log(error, "error");
                Toast.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi",
                })
            }
        },
        async handleSubQuantity(item) {// * Giảm 1 sản phẩm trong giỏ hàng
            try {
                if (this.isCallApi) return
                this.isCallApi = true
                let path = `${APICMS}/v1/selling-page/cart/cart_sub_product`
                let body = {
                    product_id: item.product_id,
                    client_id: this.client_id,
                }
                let headers = { Authorization: this.store_token }

                let subQuantity = await Restful.post(path, body, null, headers)

                if (subQuantity && subQuantity.data && subQuantity.data.data) {
                    this.getCart('get-total-price')
                    this.cart.map(product => {
                        if (product.product_id === item.product_id && item.product_quantity > 1) {
                            product.product_quantity--
                        }
                        return product
                    })
                }
                this.isCallApi = false
            } catch (error) {
                this.isCallApi = false
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
            if (this.discount.type === 1) {
                if (this.discountNumber > this.total_price) return this.swalToast('Số tiền giảm giá không quá tổng tiền sản phẩm', 'error')
                if (this.isFreeShip)
                    this.total_payment = this.total_price - this.discountNumber
                else {
                    this.total_payment = this.total_price - this.discountNumber + this.shipping_fee
                }
            }
            if (this.discount.type === 2) {
                if (this.discountPercent < 0 || this.discountPercent > 100) return this.swalToast('% giảm giá trong khoảng 0 > 100%', 'error')
                this.discountPercentNum = this.discountPercent * this.total_price / 100
                if (this.isFreeShip) {
                    this.total_payment = this.total_price - this.discountPercentNum

                }
                else {
                    this.total_payment = this.total_price - this.discountPercentNum + this.shipping_fee

                }
            }

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
            this.validate_failed.country = !this.country ? true : false
            this.validate_failed.city = !this.city ? true : false
            this.validate_failed.district = !this.district ? true : false
            this.validate_failed.ward = !this.ward ? true : false
            this.validate_failed.street = !this.street ? true : false
            this.validate_failed.branch = !Object.keys(this.branch)[0] ? true : false
            if (
                !this.name ||
                !this.phone ||
                !this.country ||
                !this.city ||
                !this.district ||
                !this.ward ||
                !this.street
            ) {
                return false
            }
            if (!this.payload.psid) {
                this.swalToast('Thiếu thông tin fb_client_id', 'error')
                return 'failed'
            }
            if (!this.payload.asid) {
                this.swalToast('Thiếu thông tin current_staff_id', 'error')
                return 'failed'
            }
            if (!this.payload.customer_id) {
                this.swalToast('Thiếu thông tin customer_id', 'error')
                return 'failed'
            }
            if (!this.payload.fb_staff_name) {
                this.swalToast('Thiếu thông tin fb_staff_name', 'error')
                return 'failed'
            }
            if (!this.payload.fb_page_id) {
                this.swalToast('Thiếu thông tin fb_page_id', 'error')
                return 'failed'
            }
            if (this.list_branch[0] && !Object.keys(this.branch)[0]) {
                this.swalToast('Thiếu thông tin chi nhánh', 'error')
                return 'failed'
            }
            return true
        },
        validateAll() {
            let check = true
            let validateOrder = this.validateOrder()
            if (validateOrder === 'failed') check = 'failed'
            if (!validateOrder) check = false
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
                    'discount_number': this.discountNumber,
                    'discount_percent': this.discountPercent,
                    "fb_client_id": this.payload.psid,
                    "fb_staff_id": this.payload.asid,
                    "fb_staff_name": this.payload.fb_staff_name,
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
                if (!body.branchId) delete body.branchId    // *todo
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
                if (this.statusEditOrder === 'draft_order') {
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
                    create_order &&
                    create_order.data &&
                    create_order.data.data &&
                    create_order.data.data.order_info &&
                    create_order.data.data.order_info.order_id &&
                    (create_order.data.data.order_info.snap_order ||
                        this.platform_type === "CUSTOM")
                ) {
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
                        if (    // * check  activated  order is true => send messager
                            this.msg_content &&
                            this.msg_content.activated &&
                            this.msg_content.activated.order
                        ) {
                            this.sendMessage(order_id, null, null, time)
                        }
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
                    })
                }
                this.is_loading = false
            } catch (e) {
                this.is_loading = false
                console.log("e", e)
                if (
                    e &&
                    e.data &&
                    e.data.error_message &&
                    e.data.error_message.errorCode
                ) return this.swalToast(e.data.error_message.message, 'error')
                if (e.data && e.data.error_message)
                    return this.swalToast(e.data.error_message, 'error')

                Toast2.fire({
                    icon: "error",
                    title: "Lỗi khi tạo đơn",
                });
            }
        },
        async delAllCart() {
            try {
                if (this.isCallApi) return
                this.isCallApi = true
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
                this.cart = []
                this.total_price = 0
                this.isCallApi = false
                // Đóng chi tiết đơn hàng
                this.closeOrderInfo()
            } catch (e) {
                this.isCallApi = false
                console.log("error", e)
            }
        },
        handleActivatedSwitch(type) {
            if (this.msg_content && this.msg_content.activated) {
                switch (type) {
                    case 'order':
                        this.msg_content.activated.order = !this.msg_content.activated.order

                        break;
                    case 'delivery':
                        this.msg_content.activated.delivery = !this.msg_content.activated.delivery

                        break;
                    case 'payment':
                        this.msg_content.activated.payment = !this.msg_content.activated.payment

                        break;
                    default:
                        break;
                }
            }
        },
        covertMsgContent(order_id, delivery_id, payment_name) {
            let msg_order = this.msg_content.order.replace(/{{order_id}}/g, order_id)
            let msg_delivery = this.msg_content.delivery.replace(/{{order_id}}/g, order_id).replace(/{{delivery_id}}/g, delivery_id)
            let msg_payment = this.msg_content.payment.replace(/{{order_id}}/g, order_id).replace(/{{payment_name}}/g, payment_name)
            return { msg_order, msg_delivery, msg_payment }
        },
        async sendMessage(order_id, url_payment, delivery_id, time = 1577840400000) { // * gửi tin về mes (tạo order, giao vận, thanh toánnsf)
            try {
                let msg_sample = this.covertMsgContent(order_id, delivery_id, this.payload.payment_platform)
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
                                                "url": `${apiCmsCheckDelivery}/?access_token=${this.store_token}&order_id=${delivery_id}`,
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
        async getListProduct(params) {
            try {
                let path = `${APICMS}/v1/selling-page/product/product_read`
                let headers = {
                    Authorization: this.store_token
                }
                // Load danh sách sản phẩm
                let get_list_product = await Restful.get(path, params, headers)
                if (
                    get_list_product &&
                    get_list_product.data &&
                    get_list_product.data.data
                ) {
                    this.list_product = get_list_product.data.data
                    this.list_product = this.handleCheckCartInListProduct(this.list_product)
                    if (
                        get_list_product.data.data.length &&
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
        handleCheckCartInListProduct(arr) { // * tạo 1 trường check trong product và kiểm tra với cart > tồn tại trong giỏ hàng => check=true
            let newArr = []
            newArr = arr.map((product, indexProduct) => {
                let check = false
                if (this.cart && this.cart.length > 0) {
                    this.cart.forEach((item, index) => {
                        if (product.product_id == item.product_id) {
                            check = true
                        }
                    })
                }

                return { ...product, check }
            })

            return newArr
        },
        async handleCheckProductAddCart() { // * kiểm tra product vừa thêm có trong giỏ hàng k => call api add cart
            if (this.list_product && this.list_product.length > 0) {
                for (let product of this.list_product) {
                    let hasInCart = false
                    if (this.cart && this.cart.length > 0) {
                        this.cart.forEach((productCart, indexProductCart) => {
                            if (product.product_id == productCart.product_id) {
                                hasInCart = true
                            }
                        })
                    }
                    console.log('before add to cart');
                    if (product.check == true && !hasInCart) {
                        await this.handleAddToCart(product)
                    }
                    if (product.check == false && hasInCart) {
                        await this.delProductCart(product)
                    }
                }
                this.updateSetting('client_id', { client_id: this.client_id })
            }
        },
        changeStatusCheckCart(item) {
            item.check = !item.check
        },
        convertProductData() { // * convert product variant
            let products = [].concat(this.list_product)
            this.list_product = []

            let findImage = (product, imageId) => {
                if (product.images) {
                    product.images.map((image) => {
                        if (image.id === imageId) {
                            return image.src
                        }
                    })
                }
                return product.image
            }

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
                this.list_product = this.handleCheckCartInListProduct(this.list_product)
            })
        },
        async getMoreProduct() { // * lấy thêm product
            try {
                let path = `${APICMS}/v1/selling-page/product/product_read`
                let headers = { Authorization: this.store_token }
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
                    get_list_product &&
                    get_list_product.data &&
                    get_list_product.data.data
                ) {
                    let list_product = get_list_product.data.data
                    if (list_product.length === 0) {
                        return this.swalToast('Đã hiện hết sản phẩm', 'success')
                    }
                    this.skip = this.skip + 20
                    if (this.platform_type === "HARAVAN" || this.platform_type === "SAPO") {
                        return this.convertMoreProduct(list_product)
                    }

                    list_product = this.handleCheckCartInListProduct(list_product)
                    this.list_product = this.list_product.concat(list_product)


                }
                // Convert data theo variant nếu là Haravan và Sapo

            } catch (e) {
                console.log("get product err", e)
            }
        },
        convertMoreProduct(products) {// *  sau khi lấy thêm product => convert product có (variant)
            if (products.length === 0) return
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
                map_variant = this.handleCheckCartInListProduct(map_variant)
                this.list_product = this.list_product.concat(map_variant)
            });
        },
        async initialData() { // * khởi tạo data
            try {
                if (this.payload.setting && this.payload.setting.setting_data) {

                    let setting = this.payload.setting.setting_data
                    if (setting.client_id)
                        this.client_id = setting.client_id
                    if (setting.msg_content) {
                        this.msg_content = setting.msg_content
                        if (!this.msg_content.activated) {  // * init activated msg_content with old setting before 23/01/21
                            this.msg_content.activated = {}
                            this.msg_content.activated = { order: true, delivery: true, payment: true }
                        }
                    }

                }
                await this.getListProduct()
                this.getListProvince()
                this.readCustomerAddress()
                if (this.statusEditOrder === 'normal') this.getCart()
            } catch (e) {
                console.log(e);
            }
        },
        async getBranchKiotviet() {
            try {
                let path = `${APICMS}/v1/selling-page/other/kiotviet_get_branch`
                let headers = { Authorization: this.store_token }

                let get_branch = await Restful.post(path, null, null, headers)

                if (
                    get_branch &&
                    get_branch.data &&
                    get_branch.data.data &&
                    get_branch.data.data.data
                ) {
                    this.list_branch = get_branch.data.data.data
                    this.has_branch = true
                    if (this.list_branch.length) {
                        this.branch = this.list_branch[0]   //default branch 1
                    }
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
                    title: "Lỗi get branch kiotviet",
                });
                console.log("get branch err", e)
            }
        },
        async resetTokenKiotviet() {
            try {
                if (this.reset_token) return
                let path = `${APICMS}/v1/selling-page/other/kiotviet_update_token`
                let headers = { 'Authorization': this.store_token }

                let reset_token_kiotviet = await Restful.post(path, null, null, headers)

                if (
                    reset_token_kiotviet &&
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
                    reset_token_misa &&
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
                    get_branch &&
                    get_branch.data &&
                    get_branch.data.data
                ) {
                    let branchs = get_branch.data.data
                    this.has_branch = true
                    if (branchs.length) {
                        this.list_branch = branchs.map((branch) => {
                            return { id: branch.Id, branchName: branch.Name }
                        })
                        this.branch = this.list_branch[0]   //default branch 1
                    }
                }
                if (
                    get_branch &&
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
                    })
                    return
                }
                Toast2.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi lấy chi nhanh Misa",
                });
                console.log("get branch err :::", e);
            }
        },
        hanndleFieldAddress(item) {// * Chọn địa chỉ từ order => field vào câc trường address 
            if (!item) return
            this.street = item.customer_street_name
            this.streetOrderEdit = this.street
            this.city = {}
            this.city.name = item.customer_province_name || item.customer_city_name
            this.city.code = item.customer_province_code || item.customer_city_code

            this.city.meta_data = {}
            this.city.meta_data.haravan = {}
            this.city.meta_data.haravan.code = item.customer_province_code || item.customer_city_code

            this.district = {}
            this.district.name = item.customer_district_name
            this.district.code = item.customer_district_code

            this.district.meta_data = {}
            this.district.meta_data.haravan = {}
            this.district.meta_data.haravan.name = item.customer_district_name
            this.district.meta_data.haravan.code = item.customer_district_code

            this.ward = {}
            this.ward.name = item.customer_ward_name
            this.ward.code = item.customer_ward_code

            this.ward.meta_data = {}
            this.ward.meta_data.haravan = {}
            this.ward.meta_data.haravan.name = item.customer_ward_name
            this.ward.meta_data.haravan.code = item.customer_ward_code
        },
        handleFieldSaveAddress(type) {// * Chọn địa chỉ đã lưu => field vào câc trường address 
            // if (!this.saveAddress) return
            let address = ''
            if (type === 'modal') {
                address = this.saveAddressModal
                this.saveAddress = ''
            }
            else {
                address = this.saveAddress
            }

            this.street = address.street
            this.city = {}
            this.city.name = address.province
            this.city.code = address.province_id || address.city_id

            this.city.meta_data = {}
            this.city.meta_data.haravan = {}
            this.city.meta_data.haravan.code = address.province_id || address.city_id

            this.district = {}
            this.district.name = address.district
            this.district.code = address.district_id

            this.district.meta_data = {}
            this.district.meta_data.haravan = {}
            this.district.meta_data.haravan.name = address.district
            this.district.meta_data.haravan.code = address.district_id

            this.ward = {}
            this.ward.name = address.ward
            this.ward.code = address.ward_id

            this.ward.meta_data = {}
            this.ward.meta_data.haravan = {}
            this.ward.meta_data.haravan.name = address.ward
            this.ward.meta_data.haravan.code = address.ward_id
            if (type === 'modal')
                this.hideModalSavePlace()
        },
        async getOrderInfo(item) { // * lấy thông tin order khi sửa new_order hoặc draft_order
            // * Reset client_id tránh loạn giỏ hàng
            this.client_id = ''
            this.cart = []
            this.statusEditOrder = 'draft_order'
            this.name = item.customer_name
            this.phone = item.customer_phone
            this.platform_type = item.platform_type
            this.id = item.id
            this.order_id = item.order_id
            this.$emit('msg-info', item.other_info)
            this.$emit('customer-id', item.customer_id)
            if (item.status === 'new_order') {// *  sửa đơn mới   
                this.statusEditOrder = 'new_order'
                this.client_id = item.product_info[0].client_id
                this.cart = item.product_info
                this.hanndleFieldAddress(item)
                this.$emit('msg-info', item.other_info)
            }
        },
        async updateOrder(data) {
            try {
                this.is_loading = true
                let path = `${APICMS}/v1/selling-page/order/order_update_3rd`
                let headers = { Authorization: this.store_token }
                let body = { ...data, id: this.id, order_id: this.order_id }

                let update_order = await Restful.post(path, body, null, headers)

                if (
                    update_order &&
                    update_order.data &&
                    update_order.data.data &&
                    update_order.data.data.order_info &&
                    update_order.data.data.order_info.order_id
                ) {
                    this.statusEditOrder = 'normal'
                    let order_info = update_order.data.data.order_info
                    let order_id = order_info.order_id
                    let time = 0

                    if (order_info.updatedAt)
                        time = order_info.updatedAt
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
                        if (    // * check  activated  order is true => send messager
                            this.msg_content &&
                            this.msg_content.activated &&
                            this.msg_content.activated.order
                        ) {
                            this.sendMessage(order_id, null, null, time)
                        }
                    }
                    setTimeout(() => {
                        this.delAllCart()
                    }, 1000)
                    setTimeout(() => {
                        EventBus.$emit("call-order")
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
            } catch (e) {
                this.is_loading = false
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
                if (e && e.data && e.data.error_message) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.error_message,
                    })
                    return
                }
                if (e && e.errors) {
                    Toast2.fire({
                        icon: "error",
                        title: e.errors,
                    });
                    return
                }
                Toast2.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi khi cập nhật đơn",
                })
            }
        },
        async handleEditOrder() {
            try {
                if (
                    !this.id ||
                    !this.phone ||
                    !this.name ||
                    !this.city ||
                    !this.district ||
                    !this.ward ||
                    !this.street ||
                    !this.payload.asid ||
                    !this.payload.fb_staff_name
                ) return Toast.fire({
                    icon: "error",
                    title: "Vui lòng điền đầy đủ thông tin",
                })
                this.is_loading = true
                this.address = `${this.street}, ${this.ward.name}, ${this.district.name}, ${this.city.name}`
                let path = `${APICMS}/v1/selling-page/order/order_update`
                let headers = { Authorization: this.store_token }
                let body = {
                    "id": this.id,
                    "staff_id_update": this.payload.asid,
                    "staff_name_update": this.payload.fb_staff_name,
                    "customer_name": this.name,
                    "customer_phone": this.phone,
                    "customer_address": this.address,
                    "customer_city_name": this.city.name,
                    "customer_province_name": this.city.name,
                    "customer_district_name": this.district.name,
                    "customer_ward_name": this.ward.name,
                    "customer_street_name": this.street,
                    "customer_province_code": this.city.code,
                    "customer_district_code": this.district.code,
                    "customer_ward_code": this.ward.code,
                }
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

                let editOrder = await Restful.post(path, body, null, headers)

                if (
                    editOrder &&
                    editOrder.data &&
                    editOrder.data.data
                ) {
                    this.statusEditOrder = 'new_order'
                    let order_info = editOrder.data.data
                    let order_id = order_info.order_id
                    let time = 0

                    setTimeout(() => {
                        EventBus.$emit("call-order")
                        this.handleShowCreateOrder()
                    }, 1000)
                    this.is_loading = false
                    Toast2.fire({
                        icon: "success",
                        title: "Sửa đơn hàng thành công",
                    })
                } else {
                    this.is_loading = false
                    Toast.fire({
                        icon: "error",
                        title: "Đã xảy ra lỗi khi sửa đơn",
                    })
                }
            } catch (e) {
                this.is_loading = false
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
                if (e && e.data && e.data.error_message) {
                    Toast2.fire({
                        icon: "error",
                        title: e.data.error_message,
                    })
                    return
                }
                if (e && e.errors) {
                    Toast2.fire({
                        icon: "error",
                        title: e.errors,
                    });
                    return
                }
                Toast2.fire({
                    icon: "error",
                    title: "Đã xảy ra lỗi khi sửa đơn",
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
        closeOrderInfo() {
            this.is_show_order_info = false
        },
        handleShowForm(name) {
            this.show_form = name
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
            this.updateSetting('msg_content', { msg_content: this.msg_content })
            this.handleModalEditMsg()
        },
        handleResetMsg() {
            this.msg_content = this.msg_content_reset
        },
        showModalSavePlace() {
            this.showSaveAddress = true
        },
        hideModalSavePlace() {
            this.showSaveAddress = false
        },
        async checkKeyBoard(event, string) {
            if (
                event.keyCode == 37 ||
                event.keyCode == 39 ||
                event.keyCode == 8 ||
                event.keyCode == 46
            ) return

            let caret_pos = event.target.selectionStart
            let input = document.getElementById('input-discount-number')

            let number_length = await this.formatNumber(string)
            //handle caret_pos when number length = 3*x+1
            if (number_length == Math.floor(number_length / 3) * 3 + 1) {
                caret_pos = caret_pos + 1
            }
            //focus in position
            if (input != null) {
                if (input.createTextRange) {
                    let range = input.createTextRange()
                    range.move('character', caret_pos)
                    range.select()
                } else {
                    if (input.selectionStart) {
                        input.focus()
                        input.setSelectionRange(caret_pos, caret_pos)
                    } else input.focus()
                }
            }
            if (event.keyCode == 8) {
            }
        },
        async formatNumber(string) {
            if (!string) return
            let number = string.toString().replace(/\D/g, '')
            this.discountNumber = Number(number)
            this.discountNumberString = new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'VND',
            }).format(number)
            return number.length
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
            })
            Toast.fire({
                icon: icon,
                title: title,
                padding: "5px",
            })
        },
    },
    watch: {
        detectAddress: function (newVal) {
            console.log('detectAddress', newVal);
            if (newVal) {
                this.city = newVal.province

                if (newVal.district)
                    this.district = newVal.district
                else {
                    this.getListDistrict()
                }
                if (newVal.ward)
                    this.ward = newVal.ward
                else {
                    this.getListWard()
                }
                if (newVal.street) {
                    this.street = newVal.street.name
                    if (newVal.house_number) {
                        this.house_number = newVal.house_number.name
                        this.street = this.house_number + ' ' + this.street
                    }
                }

            }
        },
        discount: function (newVal) {
            if (newVal.type === 1) {
                this.discountPercent = 0
            }
            if (newVal.type === 2) {
                this.discountNumber = 0
                this.discountNumberString = "0 đ"
            }
            if (newVal.type === 0) {
                this.discountNumber = 0
                this.discountNumberString = "0 đ"
                this.discountPercent = 0
            }
        },
        discountNumber: function (newVal) {
            if (newVal > this.total_price && this.cart.length > 0) return this.swalToast('Số tiền giảm giá không quá tổng tiền sản phẩm', 'error')
            if (this.isFreeShip)
                this.total_payment = this.total_price - this.discountNumber
            else {
                this.total_payment = this.total_price - this.discountNumber + this.shipping_fee
            }
            this.totalPriceDiscount = this.total_price - this.discountNumber
        },
        discountPercent: function (newVal) {
            if ((newVal < 0 || newVal > 100) && this.cart.length > 0) return this.swalToast('% giảm giá trong khoảng 0 > 100%', 'error')
            this.discountPercentNum = this.discountPercent * this.total_price / 100
            if (this.isFreeShip) {
                this.total_payment = this.total_price - this.discountPercentNum
            }
            else {
                this.total_payment = this.total_price - this.discountPercentNum + this.shipping_fee
            }
            this.totalPriceDiscount = this.total_price - this.discountPercentNum

        },
        store_token() {
            this.initialData()
            this.name = this.payload.name
            this.phone = this.payload.phone
        },
        total_price: function () {
            this.handleTotalPayment()
        },
        shipping_fee: function () {
            this.handleTotalPayment()
        },
        order_option: function (newVal) {
            if (newVal == 0) this.shipping_fee = 0
        },
        'payload.platform_type': function () {
            this.platform_type = this.payload.platform_type
        },
        'payload.setting': function (newVal, oldVal) {
            console.log('watch run :::');
            if (
                this.payload.setting &&
                this.payload.setting.setting_data
            ) {
                let setting = this.payload.setting.setting_data
                if (setting.client_id) {
                    this.client_id = setting.client_id
                    this.getCart()
                }
                if (setting.msg_content)
                    this.msg_content = setting.msg_content
            }
        },
        saveAddress: function (newVal) {
            if (newVal)
                this.handleFieldSaveAddress()
        },
        isFreeShip: function () {
            console.log('is free ship');
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
    beforeDestroy() {
        this.$emit('init-Data-When-Destroy-Comp-Order', this.dataInit)
    },
    destroyed() {
        EventBus.$off("get-order", (item) => {
            this.getOrderInfo(item)
        })
        EventBus.$off("show-modal-setting", () => {
            this.showFormLogin()
        })
        EventBus.$off("hide-modal-setting", () => {
            this.hideFormLogin()
        })
    },
};