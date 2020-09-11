import Restful from "@/services/resful.js";
import InfoOrder from "../infoOrder/InfoOrder.vue"
import Autocomplete from "../autocomplete/Autocomplete.vue"

// const APICMS = "https://ext.botup.io";
const APICMS = "http://localhost:1337" //dev
// const APICMS = "http://188.166.250.86:1337"; //dev


// const APIGHN = 'https://dev-online-gateway.ghn.vn'  //dev
const APIGHN = 'https://online-gateway.ghn.vn'      //product
export default {
    components: { InfoOrder, Autocomplete },
    props: ['payload', 'res_order_info', 'product_info', 'handleShowForm'],
    data() {
        return {
            store_list: "",
            pack_service_list: "",
            country: "",
            list_city: "",
            list_to_district: "",
            list_to_ward: "",
            list_return_district: "",
            list_return_ward: "",

            order_info: {
                store: "",
                to_name: this.res_order_info.customer_name,
                to_phone: this.res_order_info.customer_phone,
                to_address: this.res_order_info.customer_address,
                to_ward: "",
                to_district: "",
                to_city: "",
                return_phone: "",
                return_address: "",
                return_ward: "",
                return_district: "",
                return_city: "",
                cod_amount: 0,
                cod_amount_num: 0,
                content: this.product_info.list_product,
                weight: "",
                length: "",
                width: "",
                height: "",
                coupon: "",
                service_type_id: "",
                payment_type_id: "",
                required_note: "",
                order_value: this.res_order_info.total_price,
                order_value_num: this.res_order_info.total_price,
                shipping_fee: 0,
            },
            is_show_popup: false,
            is_show_note: false,
            is_show_order_info: false,
        };
    },
    mounted() {
        this.getCity()
        this.getStoreList()
    },
    methods: {
        async getStoreList() {
            try {
                if (this.payload.platform_type != "GHN") return;
                let path = `${APIGHN}/shiip/public-api/v2/shop/all`
                let params = { Offset: 0, Limit: 50 }
                let headers = {
                    "Content-Type": "application/json",
                    Token: this.payload.access_token_shipping
                }

                let get_store_list = await Restful.get(path, params, headers)

                if (
                    get_store_list &&
                    get_store_list.data &&
                    get_store_list.data.data
                ) {
                    this.store_list = get_store_list.data.data.shops
                }
                // console.log("store_list 1111111111111111111111", this.store_list)
            } catch (error) {
                console.log("error", error)
            }
        },
        checkValidatePackService() {

        },
        async getPackService() {
            try {
                if (this.payload.platform_type != "GHN" || !this.order_info.store.district_id || !this.order_info.to_district.DistrictID) return
                let path = `${APIGHN}/shiip/public-api/pack-service/all`
                let params = {
                    from_district: this.order_info.store.district_id,
                    to_district: this.order_info.to_district.DistrictID,
                };
                let headers = {
                    "Content-Type": "application/json",
                    Token: this.payload.access_token_shipping
                }

                let get_pack_service = await Restful.get(path, params, headers)

                if (
                    get_pack_service &&
                    get_pack_service.data &&
                    get_pack_service.data.data
                ) {
                    let pack_service_list = get_pack_service.data.data.filter((item) => {
                        if (item.service_type_id != "0") return item
                    });
                    this.pack_service_list = pack_service_list
                }
            } catch (e) {
                console.log("error", e)
            }
        },

        async getListReturnDistrict() {
            this.list_return_district = await this.getDistrict(this.order_info.return_city.ProvinceID)
        },
        async getListToDistrict() {
            this.list_to_district = await this.getDistrict(this.order_info.to_city.ProvinceID)
        },
        async getListReturnWard() {
            this.list_return_ward = await this.getWard(this.order_info.return_district.DistrictID)
        },
        async getListToWard() {
            this.list_to_ward = await this.getWard(this.order_info.to_district.DistrictID)
        },

        async getCity() {
            try {
                if (this.payload.platform_type != "GHN") return
                let path = `${APIGHN}/shiip/public-api/master-data/province`
                let params = {}
                let headers = {
                    "Content-Type": "application/json",
                    Token: this.payload.access_token_shipping
                }

                let get_city = await Restful.get(path, params, headers)

                if (
                    get_city &&
                    get_city.data &&
                    get_city.data.data &&
                    get_city.data.code == 200 &&
                    get_city.data.message == "Success"
                ) {
                    this.list_city = get_city.data.data
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        async getDistrict(id) {
            try {
                if (this.payload.platform_type != "GHN" || !id) return
                let path = `${APIGHN}/shiip/public-api/master-data/district`
                let params = { province_id: id }
                let headers = {
                    "Content-Type": "application/json",
                    Token: this.payload.access_token_shipping
                }

                let get_district = await Restful.get(path, params, headers)

                if (
                    get_district &&
                    get_district.data &&
                    get_district.data.data &&
                    get_district.data.code == 200 &&
                    get_district.data.message == "Success"
                ) {
                    return get_district.data.data
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        async getWard(id) {
            try {
                if (this.payload.platform_type != "GHN" || !id) return
                let path = `${APIGHN}/shiip/public-api/master-data/ward`
                let params = { district_id: id }
                let headers = {
                    "Content-Type": "application/json",
                    Token: this.payload.access_token_shipping
                }

                let get_ward = await Restful.get(path, params, headers)

                if (
                    get_ward &&
                    get_ward.data &&
                    get_ward.data.data &&
                    get_ward.data.code == 200 &&
                    get_ward.data.message == "Success"
                ) {
                    return get_ward.data.data
                }
            } catch (e) {
                console.log("error", e)
            }
        },
        resetAddress() {
            this.order_info.to_address = ""
            this.order_info.to_city = ""
            this.order_info.to_district = ""
            this.order_info.to_ward = ""
            this.order_info.return_address = ""
            this.order_info.return_city = ""
            this.order_info.return_district = ""
            this.order_info.return_ward = ""
            console.log('reset address', this.order_info);
        },
        resetChangeCityTo() {
            this.order_info.to_district = ""
            this.order_info.to_ward = ""
        },
        resetChangeCityReturn() {
            this.order_info.return_district = ""
            this.order_info.return_ward = ""
        },
        resetChangeDistrictTo() {
            this.order_info.to_ward = ""
        },
        resetChangeDistrictReturn() {
            this.order_info.return_ward = ""
        },
        async getShippingFee() {
            try {
                if (!this.checkValidate() || this.payload.platform_type != "GHN") return
                let path = `${APIGHN}/shiip/public-api/v2/shipping-order/fee`
                let order_info = this.order_info
                let params = {
                    shop_id: order_info.store._id,
                    service_type_id: order_info.service_type_id,
                    coupon: order_info.coupon,
                    to_district_id: order_info.to_district.DistrictID,
                    to_ward_code: order_info.to_ward.WardCode,
                    height: parseInt(order_info.height),
                    length: parseInt(order_info.length),
                    weight: parseInt(order_info.weight),
                    width: parseInt(order_info.width),
                };
                let headers = {
                    "Content-Type": "application/json",
                    Token: this.payload.access_token_shipping
                }
                let get_shipping_fee = await Restful.get(path, params, headers)
                console.log("feeeeeeeeee", get_shipping_fee)
                if (
                    get_shipping_fee &&
                    get_shipping_fee.data &&
                    get_shipping_fee.data.data &&
                    get_shipping_fee.data.code == 200 &&
                    get_shipping_fee.data.message == "Success"
                ) {
                    this.order_info.shipping_fee = get_shipping_fee.data.data.total
                    this.is_show_order_info = true
                }
                console.log("feeeeeeeeee", this.order_info.shipping_fee)
            } catch (e) {
                if (e &&
                    e.data &&
                    e.data.code_message_value
                ) {
                    this.swalToast(e.data.code_message_value, 'error')
                }
                console.log(e)
            }
        },
        async createOrder() {
            try {
                if (this.payload.platform_type != "GHN") return
                let path = `${APICMS}/v1/selling-page/delivery/delivery_create`
                let order_info = this.order_info
                let body = {
                    delivery_token: this.payload.delivery_token,
                    shop_id: order_info.store._id,
                    receiver_name: order_info.to_name,
                    receiver_phone: order_info.to_phone,
                    receiver_address: order_info.to_address,
                    receiver_ward: order_info.to_ward.WardCode,
                    receiver_district: order_info.to_district.DistrictID,
                    sender_district: order_info.return_district.DistrictID,
                    sender_ward: order_info.return_ward.WardCode,
                    return_phone: order_info.return_phone,
                    return_address: order_info.return_address,
                    cod_amount: parseInt(order_info.cod_amount),
                    content: order_info.content,
                    weight: parseInt(order_info.weight),
                    length: parseInt(order_info.length),
                    width: parseInt(order_info.width),
                    height: parseInt(order_info.height),
                    coupon: order_info.coupon,
                    service_type_id: order_info.service_type_id,
                    payment_type_id: parseInt(order_info.payment_type_id),
                    required_note: order_info.required_note,
                    order_value: parseInt(order_info.order_value_num),
                };

                let async_create_order = await Restful.post(path, body)
                if (
                    async_create_order &&
                    async_create_order.data &&
                    async_create_order.data.data &&
                    async_create_order.data.data.snap_order &&
                    async_create_order.data.data.snap_order.data &&
                    async_create_order.data.data.snap_order.message == "Success") {
                    this.handleCloseOrderInfo()
                    this.resetAddress()
                    this.swalToast("Tạo đơn thành công", "success")
                    return
                }
                this.swalToast("Đã xảy ra lối", "error")
                console.log("33333333333333333", async_create_order)
            } catch (e) {
                console.log("e", e)
                if (
                    e &&
                    e.data &&
                    e.data.error_message &&
                    e.data.error_message.code_message_value &&
                    e.data.code == 403
                ) {
                    return this.swalToast(e.data.error_message.code_message_value, "error")
                }

            }
        },
        checkValidate() {
            if (!this.order_info.store._id) {
                this.swalToast("Bạn chưa chọn cửa hàng", "warning")
                return false
            }
            if (!this.order_info.return_city) {
                this.swalToast("Bạn chưa chọn Tỉnh/TP bên gửi", "warning")
                return false
            }
            if (!this.order_info.return_district) {
                this.swalToast("Bạn chưa chọn Quận/Huyện bên gửi", "warning")
                return false
            }
            if (!this.order_info.return_ward) {
                this.swalToast("Bạn chưa chọn Xã/Phường bên gửi", "warning")
                return false
            }
            if (!this.order_info.to_phone) {
                this.swalToast("Bạn chưa nhập số ĐT bên nhận", 'warning')
                return false
            }
            if (!this.order_info.to_address) {
                this.swalToast("Bạn chưa nhập địa chỉ bên nhận", "warning")
                return false
            }
            if (!this.order_info.to_city) {
                this.swalToast("Bạn chưa chọn Tỉnh/TP bên nhận", "warning")
                return false
            }
            if (!this.order_info.to_district) {
                this.swalToast("Bạn chưa chọn Quận/Huyện bên nhận", "warning")
                return false
            }
            if (!this.order_info.to_ward) {
                this.swalToast("Bạn chưa chọn Xã/Phường bên nhận", "warning")
                return false
            }
            if (!this.order_info.content) {
                this.swalToast("Bạn chưa nhập hàng hoá", "warning")
                return false
            }
            if (!this.order_info.weight) {
                this.swalToast("Bạn chưa nhập khối lượng", "warning")
                return false
            }
            if (!this.order_info.length) {
                this.swalToast("Bạn chưa nhập chiều dài", 'warning')
                return false
            }
            if (!this.order_info.width) {
                this.swalToast("Bạn chưa nhập chiều rộng", 'warning')
                return false
            }
            if (!this.order_info.height) {
                this.swalToast("Bạn chưa nhập chiều cao", "warning")
                return false
            }
            if (!this.order_info.payment_type_id) {
                this.swalToast("Bạn chưa chọn hình thức thanh toán", "warning")
                return false
            }
            if (!this.order_info.service_type_id) {
                this.swalToast("Bạn chưa chọn gói cước giao hàng", "warning")
                return false
            }
            if (!this.order_info.required_note) {
                this.swalToast("Bạn chưa chọn mã ghi chú bắt buộc", "warning")
                return false
            }
            return true
        },
        handleClosePopup() {
            this.is_show_popup = !this.is_show_popup
            this.searchValue = ""
            this.getCart()
        },
        handleShowNote() {
            this.is_show_note = !this.is_show_note
        },
        handleCloseOrderInfo() {
            this.is_show_order_info = false
        },
        async checkKeyBoard(event, string) {
            if (
                event.keyCode == 37 ||
                event.keyCode == 39 ||
                event.keyCode == 8 ||
                event.keyCode == 46
            )
                return;
            let caret_pos = event.target.selectionStart
            let input = document.getElementById("input")
            let number_length = await this.formatNumber(string)
            //handle caret_pos when number length = 3*x+1
            if (number_length == Math.floor(number_length / 3) * 3 + 1) {
                caret_pos = caret_pos + 1
            }
            //focus in position
            if (input != null) {
                if (input.createTextRange) {
                    let range = input.createTextRange()
                    range.move("character", caret_pos)
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
            let number = string.replace(/\D/g, "")
            this.order_info.order_value_num = number
            this.order_info.order_value = new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "VND",
            }).format(number)
            return number.length
        },
        swalToast(title, icon) {
            const Toast = Swal.mixin({
                toast: true,
                position: "center",
                showConfirmButton: false,
                width: '80vw',
                timer: 1000,
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
            });
        },
    },
    watch: {
        'order_info.store': function () {
            this.order_info.service_type_id = ""
            this.getPackService()
        },
        'order_info.to_district': function () {
            this.order_info.service_type_id = ""
            this.getPackService()
        }
    },
    filters: {
        toCurrency(value) {
            if (typeof value !== "number") {
                return value
            }
            let formatter = new Intl.NumberFormat("de-DE", {
                style: "currency",
                minimumFractionDigits: 0,
                currency: "VND",
            })
            return formatter.format(value)
        },
    },
}