import Restful from "@/services/resful.js"
import InfoOrder from "@/components/infoOrder/InfoOrder.vue"
import Autocomplete from "@/components/SearchAddress.vue"

// const APICMS = "https://ext.botup.io" //product
const APICMS = "http://localhost:1337" //dev
// const APICMS = "http://188.166.250.86:1337"; //dev


export default {
    components: { InfoOrder, Autocomplete },
    props: ['payload', 'res_order_info', 'product_info', 'handleShowForm'],
    data() {
        return {
            list_inventories: "",
            pack_service_list: "",
            country: "",

            list_city: "",
            list_district_sender: "",
            list_ward_sender: "",
            list_district_receiver: "",
            list_ward_receiver: "",

            pricing_services_list: "",
            order_info: {
                inventory: "",
                group_address_id: "",
                sender_name: "",
                sender_phone: "",
                sender_email: "",
                sender_street: "",
                sender_address: "",
                sender_ward: "",
                sender_district: "",
                sender_city: "",
                receiver_name: this.res_order_info.customer_name,
                receiver_phone: this.res_order_info.customer_phone,
                receiver_email: this.res_order_info.customer_email,
                receiver_street: "",
                receiver_address: this.res_order_info.customer_address,
                receiver_ward: "",
                receiver_district: "",
                receiver_city: "",
                product_name: this.product_info.list_product,
                product_quantity: this.product_info.total_item,
                product_price: this.res_order_info.total_price,
                product_price_num: this.res_order_info.total_price,
                weight: "",
                length: "",
                width: "",
                height: "",
                product_type: "",
                order_payment: "",
                order_service: "",
                required_note: "",
                money_collection: 0,

                shipping_fee: 0,
            },
            handle_api: false,
            is_show_popup: false,
            is_show_note: false,
            is_show_order_info: false,
        };
    },
    async created() {
    },
    async mounted() {
        this.getCity()
        this.getInventory()
        console.log('payload', this.payload);
        console.log('res_order_info', this.res_order_info);

    },
    methods: {
        async getListDistrictSender() {
            this.list_district_sender = await this.getDistrict(this.order_info.sender_city.PROVINCE_ID)
        },
        async getListDistrictReceiver() {
            this.list_district_receiver = await this.getDistrict(this.order_info.receiver_city.PROVINCE_ID)
        },
        async getListWardSender() {
            this.list_ward_sender = await this.getWard(this.order_info.sender_district.DISTRICT_ID)
        },
        async getListWardReceiver() {
            this.list_ward_receiver = await this.getWard(this.order_info.receiver_district.DISTRICT_ID)
        },
        async getCity() {
            try {
                if (this.payload.delivery_platform_type != "VIETTEL_POST") return
                let path = 'https://transporter.viettelsale.com/v1/location/provinces'
                let params = {}
                let headers = {
                    "Content-Type": "application/json",
                    Authorization: this.payload.access_token_shipping
                }

                let get_city = await Restful.get(path, params, headers)

                if (get_city && get_city.data && get_city.data.data) {
                    this.list_city = get_city.data.data
                }
            } catch (error) {
                console.log("error", error)
            }
        },
        async getDistrict(id) {
            try {
                if (this.payload.delivery_platform_type != "VIETTEL_POST" || !id) return;
                let path = 'https://transporter.viettelsale.com/v1/location/districts'
                // console.log("city", this.city)
                let params = { provinceId: id }
                let headers = {
                    "Content-Type": "application/json",
                    Authorization: this.payload.access_token_shipping
                }

                let get_district = await Restful.get(path, params, headers)

                // console.log('get_dítrict', get_district);
                if (get_district && get_district.data && get_district.data.data && get_district.data.status == 200 && get_district.data.message == "success") {
                    return get_district.data.data
                }
            } catch (error) {
                console.log("error", error)
            }
        },
        async getWard(id) {
            try {
                if (this.payload.delivery_platform_type != "VIETTEL_POST" || !id) return;
                let path =
                    "https://transporter.viettelsale.com/v1/location/wards"
                // is receiver
                let params = { districtId: id }
                let headers = {
                    "Content-Type": "application/json",
                    Authorization: this.payload.access_token_shipping
                }

                let get_ward = await Restful.get(path, params, headers)

                // console.log('get ward', get_ward);
                if (get_ward && get_ward.data && get_ward.data.data && get_ward.data.status == 200 && get_ward.data.message == "success") {
                    return get_ward.data.data
                }
            } catch (error) {
                console.log("error", error)
            }
        },
        resetAddress() {
            this.order_info.sender_city = ""
            this.order_info.sender_district = ""
            this.order_info.sender_ward = ""
            this.order_info.sender_street = ""
            this.order_info.sender_address = ""
            this.order_info.receiver_city = ""
            this.order_info.receiver_district = ""
            this.order_info.receiver_ward = ""
            this.order_info.receiver_street = ""
            this.order_info.receiver_address = ""
        },
        resetChangeCitySender() {
            this.order_info.sender_district = ""
            this.order_info.sender_ward = ""
        },
        resetChangeCityReceiver() {
            this.order_info.receiver_district = ""
            this.order_info.receiver_ward = ""
        },
        resetChangeDistrictSender() {
            this.order_info.sender_ward = ""
            console.log('1111111111111111', this.order_info.sender_ward);
        },
        resetChangeDistrictReceiver() {
            this.order_info.receiver_ward = ""
        },
        async getInventory() {
            try {
                if (this.payload.delivery_platform_type != "VIETTEL_POST") return
                let path =
                    "https://transporter.viettelsale.com/v1/inventory"
                let params = {}
                let headers = {
                    "Content-Type": "application/json",
                    Authorization: this.payload.access_token_shipping
                }

                let get_inventory = await Restful.get(path, params, headers)

                if (get_inventory && get_inventory.data && get_inventory.data.data) {
                    this.list_inventories = get_inventory.data.data
                }
            } catch (e) {
                console.log(e)
            }
        },
        async getPricingServices() {
            try {
                if (this.payload.delivery_platform_type != "VIETTEL_POST") return
                let path = 'https://transporter.viettelsale.com/v1/pricing/all'
                let order_info = this.order_info
                let body = {
                    SENDER_PROVINCE: order_info.sender_city.PROVINCE_ID,
                    SENDER_DISTRICT: order_info.sender_district.DISTRICT_ID,
                    RECEIVER_PROVINCE: order_info.receiver_city.PROVINCE_ID,
                    RECEIVER_DISTRICT: order_info.receiver_district.DISTRICT_ID,
                    PRODUCT_TYPE: order_info.product_type,
                    PRODUCT_WEIGHT: parseInt(order_info.weight),
                    PRODUCT_PRICE: parseInt(order_info.product_price_num),
                    MONEY_COLLECTION: parseInt(order_info.money_collection),
                }
                let params = null
                let headers = {
                    // "Content-Type": "application/json",
                    Authorization: this.payload.access_token_shipping
                }
                let get_pricing_services = await Restful.post(path, body, params, headers)

                if (get_pricing_services && get_pricing_services.data && get_pricing_services.data.data && get_pricing_services.data.status == 200) {
                    this.pricing_services_list = get_pricing_services.data.data
                }
            } catch (e) {
                console.log(e)
            }
        },
        handleShippingFee() {
            if (this.order_info.order_service) {
                return this.order_info.shipping_fee = this.order_info.order_service.GIA_CUOC
            }
            return this.order_info.shipping_fee = 0
        },
        async createOrder() {
            try {
                if (this.payload.delivery_platform_type != "VIETTEL_POST") return
                if (this.handle_api) return
                this.handle_api = true
                Swal.showLoading()
                this.getSenderAddress()
                let path = `${APICMS}/v1/selling-page/delivery/delivery_create`
                let order_info = this.order_info
                console.log('order_info', order_info)
                let body = {
                    delivery_token: this.payload.delivery_token,
                    group_address_id: order_info.inventory.groupaddressId,
                    sender_name: order_info.sender_name,
                    sender_address: order_info.sender_address,
                    sender_phone: order_info.sender_phone,
                    sender_email: order_info.sender_email,
                    sender_ward: order_info.sender_ward.WARDS_ID,
                    sender_district: order_info.sender_district.DISTRICT_ID,
                    sender_province: order_info.sender_city.PROVINCE_ID,
                    receiver_name: order_info.receiver_name,
                    receiver_phone: order_info.receiver_phone,
                    receiver_address: order_info.receiver_address,
                    receiver_email: order_info.receiver_email,
                    receiver_province: order_info.receiver_city.PROVINCE_ID,
                    receiver_district: order_info.receiver_district.DISTRICT_ID,
                    receiver_ward: order_info.receiver_ward.WARDS_ID,
                    product_name: order_info.product_name,
                    product_quantity: order_info.product_quantity,
                    product_price: parseInt(order_info.product_price_num),
                    product_type: order_info.product_type,
                    order_payment: order_info.order_payment,
                    order_service: order_info.order_service.MA_DV_CHINH,
                    weight: parseInt(order_info.weight),
                    length: parseInt(order_info.length),
                    width: parseInt(order_info.width),
                    height: parseInt(order_info.height),
                    required_note: order_info.required_note,
                };
                console.log("body", body)

                let create_order = await Restful.post(path, body)

                this.handle_api = false
                Swal.hideLoading()
                if (
                    create_order &&
                    create_order.data &&
                    create_order.data.data &&
                    create_order.data.data.snap_order &&
                    create_order.data.data.snap_order.data &&
                    create_order.data.data.snap_order.message == 'success'
                ) {
                    console.log("33333333333333333", create_order)
                    this.handleCloseOrderInfo()
                    this.resetAddress()
                    this.handleShowForm('order')
                    this.swalToast("Tạo đơn thành công", "success")
                    return
                }
                this.swalToast("Đã xảy ra lối", "error")
            } catch (e) {
                console.log("e", e)
                this.handle_api = false
                Swal.hideLoading()
                if (
                    e &&
                    e.data &&
                    e.data.error_message &&
                    e.data.code == 403
                ) {
                    return this.swalToast(e.data.error_message.message)

                }

            }
        },
        getSenderAddress() {
            this.order_info.sender_address = `${this.order_info.sender_street}, ${this.order_info.sender_ward.WARDS_NAME}, ${this.order_info.sender_district.DISTRICT_NAME}, ${this.order_info.sender_city.PROVINCE_NAME}`
        },
        checkValidatePricingServices() {
            if (!this.order_info.sender_city) {
                this.swalToast("Bạn chưa chọn Tỉnh/TP bên gửi", 'warning')
                return false
            }
            if (!this.order_info.sender_district) {
                this.swalToast("Bạn chưa chọn Quận/Huyện bên gửi", "warning")
                return false
            }
            if (!this.order_info.receiver_city) {
                this.swalToast("Bạn chưa chọn Tỉnh/TP bên nhận", 'warning')
                return false
            }
            if (!this.order_info.receiver_district) {
                this.swalToast("Bạn chưa chọn Quận/Huyện bên nhận", "warning")
                return false
            }
            if (!this.order_info.weight) {
                this.swalToast("Bạn chưa nhập khối lượng", "warning")
                return false
            }
            if (!this.order_info.product_type) {
                this.swalToast("Bạn chưa chọn phân loại sản phẩm", "warning")
                return false
            }
            if (!this.order_info.product_price_num) {
                this.swalToast("Bạn chưa nhập giá sản phẩm", "warning")
                return false
            }
            return true
        },
        checkValidateAll() {
            if (!this.checkValidatePricingServices()) return false
            if (!this.order_info.inventory) {
                this.swalToast("Bạn chưa chọn kho hàng", "warning")
                return false
            }
            if (!this.order_info.sender_name) {
                this.swalToast("Bạn chưa nhập Tên bên gửi", 'warning')
                return false
            }
            if (!this.order_info.sender_phone) {
                this.swalToast("Bạn chưa nhập số ĐT bên gửi", 'warning')
                return false
            }
            if (!this.order_info.sender_email) {
                this.swalToast("Bạn chưa nhập số email bên gửi", 'warning')
                return false
            }
            if (!this.order_info.sender_street) {
                this.swalToast("Bạn chưa nhập địa chỉ bên gửi", 'warning')
                return false
            }
            console.log('this.order_info.sender_ward', this.order_info.sender_ward);
            if (!this.order_info.sender_ward) {
                this.swalToast("Bạn chưa chọn Xã/Phường bên gửi", "warning")
                return false
            }
            if (!this.order_info.receiver_name) {
                this.swalToast("Bạn chưa nhập Tên bên nhận", 'warning')
                return false
            }
            if (!this.order_info.receiver_phone) {
                this.swalToast("Bạn chưa nhập số ĐT bên nhận", 'warning')
                return false
            }
            if (!this.order_info.receiver_email) {
                this.swalToast("Bạn chưa nhập số email bên nhận", 'warning')
                return false
            }
            if (!this.order_info.receiver_address) {
                this.swalToast("Bạn chưa nhập địa chỉ bên nhận", 'warning')
                return false
            }
            if (!this.order_info.receiver_ward) {
                this.swalToast("Bạn chưa chọn Xã/Phường bên nhận", "warning")
                return false
            }
            if (!this.order_info.product_name) {
                this.swalToast("Bạn chưa sản phẩm", "warning")
                return false
            } if (!this.order_info.product_quantity) {
                this.swalToast("Bạn chưa số lượng sản phẩm", "warning")
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
            if (!this.order_info.order_payment) {
                this.swalToast("Bạn chưa chọn hình thức thanh toán đơn hàng", "warning")
                return false
            }
            if (!this.order_info.order_service) {
                this.swalToast("Bạn chưa chọn dịch vụ giao vận", "warning")
                return false
            }
            return true
        },
        handleShowNote() {
            this.is_show_note = !this.is_show_note
        },
        handleCloseOrderInfo() {
            this.is_show_order_info = false
        },
        handleShowOrderInfo() {
            if (!this.checkValidateAll()) return
            this.is_show_order_info = true
        },
        async checkKeyBoard(event, string) {
            if (
                event.keyCode == 37 ||
                event.keyCode == 39 ||
                event.keyCode == 8 ||
                event.keyCode == 46
            )
                return
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
            this.order_info.product_price_num = number
            this.order_info.product_price = new Intl.NumberFormat("de-DE", {
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
            })
        },
    },
    // watch: {
    //     order_info: {
    //         handler: function () {
    //             this.getPricingServices()
    //         },
    //         deep: true, // deep watch
    //     },

    // },
    filters: {
        toCurrency(value) {
            if (typeof value !== "number") {
                return value
            }
            let formatter = new Intl.NumberFormat("de-DE", {
                style: "currency",
                minimumFractionDigits: 0,
                currency: "VND",
            });
            return formatter.format(value)
        },
    },
};