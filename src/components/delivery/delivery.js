import Restful from "@/services/resful.js"
import Autocomplete from "@/components/SearchAddress.vue"
import EventBus from "@/EventBus.js"

// const APICMS = "https://ext.botup.io" //product
const APICMS = "https://devbbh.tk"; //dev


export default {
    components: { Autocomplete },
    props: ['store_token', 'payload', 'is_update_order', 'prop_receiver_name', 'prop_receiver_phone', 'prop_receiver_email', 'prop_receiver_address', 'prop_receiver_city', 'prop_receiver_district', 'prop_receiver_ward', 'prop_receiver_street', 'prop_total_price', 'order_option', 'propSendMessage'],
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
            list_order_payment_vtp: [{ name: 'Chưa thanh toán/Do not collect money', value: 1 }, { name: 'Thu phí ship và giá sản phẩm/Collect ship fee and price of products', value: 2 }, { name: 'Thu giá sản phẩm/Collect price of products', value: 3 }, { name: 'Thu phí ship/Collect ship fee', value: 4 }],
            list_order_payment_ghn: [{ name: 'Người gửi trả tiền', value: 1 }, { name: 'Người nhận trả tiền', value: 2 }],
            list_order_payment_ghtk: [{ name: 'Người nhận trả tiền', value: 0 }, { name: 'Người gửi trả tiền', value: 1 }],
            order_info: {
                order_id: "",
                inventory: "",
                group_address_id: "",
                sender_name: "",
                sender_phone: "",
                sender_email: this.payload.store_email,
                sender_street: "",
                sender_address: "",
                sender_ward: "",
                sender_district: "",
                sender_city: "",

                receiver_name: this.prop_receiver_name,
                receiver_phone: this.prop_receiver_phone,
                receiver_email: this.prop_receiver_email,
                receiver_address: this.prop_receiver_address,
                receiver_ward: this.prop_receiver_ward,
                receiver_district: this.prop_receiver_district,
                receiver_city: this.prop_receiver_city,
                weight: "",
                length: "",
                width: "",
                height: "",
                product_type: "",
                order_payment: "",
                order_service: "",
                required_note: "",
                cod_amount: 0,
                cod_amount_num: 0,
                shipping_fee: 0,
                coupon: "",
                other_info: {
                    // pick_date: "2020-09-03",
                    is_freeship: "",
                    transport: "",
                },
                note: "",
            },
            validate_failed: {
                inventory: false,
                order_payment: false,
                weight: false,
                order_service: false,
                length: false,
                width: false,
                height: false,
                product_type: false,
                required_note: false,
                coupon_real_ghn: false,
                other_info: {
                    transport: false,
                },
                order_value_num: false,
            },
            coupon_real_ghn: true,
            option_save_info: true,
            handle_api: false,
            is_show_popup: false,
            is_show_note: false,
        };
    },
    async created() {
    },
    async mounted() {
        this.getInventory()
        this.getEmailLocal()
        this.formatNumber(this.prop_total_price)    //default cod_amount = total_price
        this.initialization                         //default hình thức thanh toán
    },
    computed: {
        initialization() {   //default mã ghi chú bắt buộc(GHN), hình thức thanh toán , phân loại sản phẩm(VTP)
            if (this.payload.delivery_platform == 'VIETTEL_POST') {
                this.order_info.product_type = 'HH'
                this.order_info.order_payment = this.list_order_payment_vtp[0]
            }
            if (this.payload.delivery_platform == 'GHN') {
                this.order_info.required_note = 'KHONGCHOXEMHANG'
                this.order_info.order_payment = this.list_order_payment_ghn[1]
            }
            if (this.payload.delivery_platform == 'GHTK') {
                 this.order_info.order_payment = this.list_order_payment_ghtk[0]
                 this.order_info.other_info.transport = 'road'
                }
        },
    },
    methods: {
        async getInventory() {
            try {
                let path = `${APICMS}/v1/selling-page/delivery/delivery_inventory`
                let headers = {
                    Authorization: this.store_token
                }

                let get_inventory = await Restful.get(path, null, headers)

                if (
                    get_inventory.data &&
                    get_inventory.data.data
                ) {
                    let list_inventories = get_inventory.data.data.inventory || get_inventory.data.data.shops || get_inventory.data.data.data
                    if (list_inventories && list_inventories.length > 0) {
                        this.list_inventories = list_inventories
                        this.order_info.inventory = this.list_inventories[0]    //default store serial 1
                    }
                }
            } catch (e) {
                console.log(e)
            }
        },
        async getPricingServices() {
            try {
                let body = {}
                if (this.payload.delivery_platform == 'VIETTEL_POST') {
                    if (!this.order_info.inventory.provinceId ||
                        !this.order_info.inventory.districtId ||
                        !this.order_info.receiver_city ||
                        !this.order_info.receiver_district ||
                        !this.order_info.product_type ||
                        !this.order_info.weight ||
                        !this.order_info.length ||
                        !this.order_info.width ||
                        !this.order_info.height ||
                        !this.prop_total_price) return
                    body = {
                        "sender_province": this.order_info.inventory.provinceId,
                        "sender_district": this.order_info.inventory.districtId,
                        "receiver_province": this.order_info.receiver_city.province_id,
                        "receiver_district": this.order_info.receiver_district.district_id,
                        "product_type": this.order_info.product_type,
                        "weight": parseInt(this.order_info.weight),
                        "length": parseInt(this.order_info.length),
                        "width": parseInt(this.order_info.width),
                        "height": parseInt(this.order_info.height),
                        "product_price": parseInt(this.prop_total_price),
                    }
                }
                if (this.payload.delivery_platform == 'GHN') {
                    if (!this.order_info.inventory.district_id ||
                        !this.order_info.receiver_district) return
                    body = {
                        "shop_id": this.order_info.inventory._id,
                        "from_district": this.order_info.inventory.district_id,
                        "to_district": this.order_info.receiver_district.meta_data.ghn.district_id,
                    }
                }
                if (this.payload.delivery_platform == 'GHTK') { return }
                let path = `${APICMS}/v1/selling-page/delivery/delivery_get_service`
                let headers = {
                    Authorization: this.store_token
                }

                let get_pricing_services = await Restful.post(path, body, null, headers)

                if (
                    get_pricing_services.data &&
                    get_pricing_services.data.data
                ) {
                    let services = get_pricing_services.data.data.services
                    this.order_info.order_service = ""
                    this.order_info.shipping_fee = 0
                    this.pricing_services_list = services
                    if (services && services.length > 0) {
                        this.order_info.order_service = services[0]   //default dịch vụ 1
                    }
                }
            } catch (e) {
                console.log(e)
            }
        },
        async getShippingFee() {
            try {
                if (this.handle_api) return
                if (this.payload.delivery_platform == "VIETTEL_POST") return
                let body = {}
                if (this.payload.delivery_platform == "GHN") {
                    if (!this.order_info.inventory ||
                        !this.order_info.order_service ||
                        !this.order_info.receiver_district ||
                        !this.order_info.receiver_ward ||
                        !this.order_info.weight ||
                        !this.order_info.height ||
                        !this.order_info.length ||
                        !this.order_info.width
                    ) return
                    body = {
                        "shop_id": this.order_info.inventory._id,
                        "service_id": this.order_info.order_service.service_id,
                        "coupon": this.order_info.coupon,
                        "district_id": this.order_info.receiver_district.meta_data.ghn.district_id,
                        "ward_code": this.order_info.receiver_ward.meta_data.ghn.code,
                        "height": parseInt(this.order_info.height),
                        "length": parseInt(this.order_info.length),
                        "weight": parseInt(this.order_info.weight),
                        "width": parseInt(this.order_info.width),
                    }
                }
                if (this.payload.delivery_platform == "GHTK") {
                    if (!this.prop_receiver_street
                        || !this.order_info.receiver_district
                        || !this.order_info.receiver_city
                        || !this.order_info.weight
                        || !this.order_info.other_info.transport
                        || !this.prop_total_price
                    ) return
                    this.order_info.receiver_address = `${this.prop_receiver_street}, ${this.order_info.receiver_ward.name}, ${this.order_info.receiver_district.name}, ${this.order_info.receiver_city.name}`
                    body = {
                        "receiver_province": this.order_info.receiver_city.name,
                        "receiver_district": this.order_info.receiver_district.name,
                        "receiver_address": this.order_info.receiver_address,
                        "weight": parseInt(this.order_info.weight) / 1000,  // khối lượng tính theo kg
                        "value": this.prop_total_price,
                        "transport": this.order_info.other_info.transport
                    }
                }
                let path = `${APICMS}/v1/selling-page/delivery/delivery_ship_fee`
                let headers = { Authorization: this.store_token }

                this.handle_api = true
                let get_shipping_fee = await Restful.post(path, body, null, headers)
                this.handle_api = false

                if (
                    get_shipping_fee.data &&
                    get_shipping_fee.data.data &&
                    get_shipping_fee.data.data.data
                ) {
                    this.coupon_real_ghn = true
                    return this.order_info.shipping_fee = get_shipping_fee.data.data.data.total || get_shipping_fee.data.data.data.fee     //GHN||GHTK
                }
                this.order_info.shipping_fee = 0
            } catch (e) {
                console.log(e);
                this.handle_api = false
                if (
                    e.data &&
                    e.data.error_message &&
                    e.data.error_message.code_message_value
                ) {
                    this.coupon_real_ghn = false
                    this.swalToast(e.data.error_message.code_message_value, 'error')
                }
                this.order_info.shipping_fee = 0
            }
        },
        //handle change btn select//
        async handleShopChange() {
            await this.getPricingServices()
            this.getShippingFee()
        },
        handleChangeCity() {
            if (this.payload.delivery_platform == "VIETTEL_POST") {
                this.getPricingServices()
            }
            if (this.payload.delivery_platform == "GHTK") {
                this.getShippingFee()
            }
        },
        handleChangeDistrict() {
            if (this.payload.delivery_platform == "VIETTEL_POST") {
                this.getPricingServices()
            }
            if (this.payload.delivery_platform == "GHTK") {
                this.getShippingFee()
            }
            if (this.payload.delivery_platform == "GHN") {
                this.handleShopChange()
            }
        },
        handleChangeWard() {
            if (this.payload.delivery_platform == "GHN") {
                this.getShippingFee()
            }
        },
        handleChangeSize() {
            if (this.payload.delivery_platform == "VIETTEL_POST") {
                this.getPricingServices()
            }
            if (this.payload.delivery_platform == "GHN") {
                this.getShippingFee()
            }
        },
        handleChangeWeight() {
            if (this.payload.delivery_platform == "VIETTEL_POST") {
                this.getPricingServices()
            }
            if (this.payload.delivery_platform == "GHN" || this.payload.delivery_platform == "GHTK") {
                this.getShippingFee()
            }
        },
        /////////////////////////
        handleShippingFeeVTP() {
            if (this.order_info.order_service) {
                this.order_info.shipping_fee = this.order_info.order_service.GIA_CUOC
            }
            else {
                this.order_info.shipping_fee = 0
            }
            this.$emit('shipping_fee', this.order_info.shipping_fee)
            console.log('emit', this.order_info.shipping_fee);
        },
        //component order sẽ gọi hàm này
        infoDelivery(product_info) {
            let other = {}
            let body = {
                "sender_name": this.order_info.inventory.name,
                "sender_address": this.order_info.inventory.address,
                "sender_phone": this.order_info.inventory.phone,
                "sender_ward": this.order_info.inventory.wardsId,
                "sender_district": this.order_info.inventory.districtId,
                "sender_province": this.order_info.inventory.provinceId,
                "receiver_name": this.order_info.receiver_name,
                "receiver_phone": this.order_info.receiver_phone,
                "receiver_address": this.order_info.receiver_address,
                "product_name": product_info.list_product,
                "product_quantity": product_info.total_item,
                "product_price": parseInt(this.prop_total_price),
                "product_type": this.order_info.product_type,
                "weight": parseInt(this.order_info.weight),
                "length": parseInt(this.order_info.length),
                "width": parseInt(this.order_info.width),
                "height": parseInt(this.order_info.height),
                "required_note": this.order_info.note,
            }
            if (this.payload.delivery_platform == "VIETTEL_POST") {
                other = {
                    "sender_email": this.order_info.sender_email,
                    "group_address_id": this.order_info.inventory.groupaddressId,
                    "receiver_province": this.order_info.receiver_city.province_id,
                    "receiver_district": this.order_info.receiver_district.district_id,
                    "receiver_ward": this.order_info.receiver_ward.ward_id,
                    "receiver_email": this.order_info.receiver_email,
                    "order_payment": this.order_info.order_payment.value,
                    "order_service": this.order_info.order_service.MA_DV_CHINH
                }
            }
            if (this.payload.delivery_platform == "GHN") {
                delete body["sender_ward"]
                delete body["sender_district"]
                delete body["required_note"]
                other = {
                    "sender_ward": this.order_info.inventory.ward_code,
                    "sender_district": this.order_info.inventory.district_id,
                    "receiver_province": this.order_info.receiver_city.meta_data.ghn.province_id,
                    "receiver_district": this.order_info.receiver_district.meta_data.ghn.district_id,
                    "receiver_ward": this.order_info.receiver_ward.meta_data.ghn.code,
                    "code_amount": this.order_info.code_amount_num,
                    "shop_id": this.order_info.inventory._id,
                    "content": `${product_info.list_product} [Tổng số lượng ${product_info.total_item}]`,
                    "required_note": this.order_info.required_note,
                    "service_type_id": this.order_info.order_service.service_type_id,
                    "payment_type_id": this.order_info.order_payment.value,
                    "order_value": parseInt(this.prop_total_price),
                }
                if (this.coupon_real_ghn) {
                    other["coupon"] = this.order_info.coupon
                }
            }
            if (this.payload.delivery_platform == "GHTK") {
                delete body["length"]
                delete body["width"]
                delete body["height"]
                delete body["weight"]
                delete body["product_name"]
                delete body["product_quantity"]
                delete body["product_price"]
                other = {
                    "products": [{ name: product_info.list_product, weight: parseInt(this.order_info.weight) / 1000, quantity: product_info.total_item }],
                    "receiver_province": this.order_info.receiver_city.name,
                    "receiver_district": this.order_info.receiver_district.name,
                    "receiver_ward": this.order_info.receiver_ward.name,
                    "code_amount": this.order_info.code_amount_num,
                    "order_value": parseInt(this.prop_total_price),
                    "cod_amount": parseInt(this.order_info.cod_amount),
                    "other_info": {
                        "transport": this.order_info.other_info.transport,
                        "is_freeship": this.order_info.order_payment.value
                    }
                }


            }
            let info_delivery = { ...body, ...other }
            return info_delivery
        },
        // call in component order
        validateCreateDelivery() {
            //handle border red when failed
            this.validate_failed.inventory = !this.order_info.inventory ? true : false
            this.validate_failed.order_payment = !this.order_info.order_payment ? true : false
            this.validate_failed.weight = !this.order_info.weight ? true : false
            if (this.payload.delivery_platform == 'VIETTEL_POST' || this.payload.delivery_platform == 'GHN') {
                this.validate_failed.order_service = !this.order_info.order_service ? true : false
                this.validate_failed.length = !this.order_info.length || this.order_info["length"] < 0 ? true : false
                this.validate_failed.width = !this.order_info.width || this.order_info["width"] < 0 ? true : false
                this.validate_failed.height = !this.order_info.height || this.order_info["height"] < 0 ? true : false
            }
            if (this.payload.delivery_platform == 'VIETTEL_POST') {
                this.validate_failed.product_type = !this.order_info.product_type ? true : false
            }
            if (this.payload.delivery_platform == 'GHN') {
                this.validate_failed.required_note = !this.order_info.required_note ? true : false
                this.validate_failed.coupon_real_ghn = !this.coupon_real_ghn ? true : false
            }
            if (this.payload.delivery_platform == 'GHTK') {
                this.validate_failed.other_info.transport = !this.order_info.other_info.transport ? true : false
                this.validate_failed.weight = !this.order_info.weight || this.order_info.weight / 1000 > 20 ? true : false
                this.validate_failed.order_value_num = !this.order_info.order_value_num || this.order_info.order_value_num >= 20000000 ? true : false
            }
            //handle sweetalert when failed
            if (!this.order_info.inventory || !this.order_info.order_payment || !this.order_info.weight) { return false }

            if (this.payload.delivery_platform == 'VIETTEL_POST' || this.payload.delivery_platform == 'GHN') {
                if (!this.order_info.order_service || this.order_info["length"] < 0 || this.order_info["width"] < 0 || this.order_info["height"] < 0) { return false }
            }
            if (this.payload.delivery_platform == 'VIETTEL_POST' && !this.order_info.product_type) { return false }
            if (this.payload.delivery_platform == 'GHN') {
                if (!this.order_info.required_note || !this.coupon_real_ghn == true) { return false }
            }
            if (this.payload.delivery_platform == 'GHTK') {
                if (!this.order_info.other_info.transport) {
                    return false
                }
                if (this.order_info.weight / 1000 > 20) {
                    this.swalToast('Khối lượng tổng đơn hàng không quá 20kg', 'warning')
                    return 'failed'
                }
                if (this.order_info.order_value_num >= 20000000) {
                    this.swalToast('Giá trị đơn hàng để tính phí bảo hiểm không quá 20.000.000đ', 'warning')
                    return 'failed'
                }
            }
            return true
        },
        // component order sẽ gọi hàm này
        async createDelivery(order_id, product_info) {
            try {
                let path = `${APICMS}/v1/selling-page/delivery/delivery_create`
                let headers = { Authorization: this.store_token }
                let info_delivery = this.infoDelivery(product_info)
                let body = {
                    ...info_delivery,
                    "order_id": order_id
                };
                console.log("body create delivery", body)

                let create_order = await Restful.post(path, body, {}, headers)

                if (
                    create_order.data &&
                    create_order.data.data &&
                    create_order.data.data.snap_order
                ) {
                    if ((create_order.data.data.snap_order.data && create_order.data.data.snap_order.data.fee) || create_order.data.data.snap_order.data || create_order.data.data.snap_order.success) {
                        let delivery_id = ''
                        let time = create_order.data.data.updatedAt
                        if (this.payload.delivery_platform == "GHTK") {
                            delivery_id = create_order.data.data.snap_order.order.label
                        }
                        else {
                            delivery_id = create_order.data.data.snap_order.data.order_code || create_order.data.data.snap_order.data.ORDER_NUMBER         //GHN || VTP 
                        }
                        this.propSendMessage(order_id, null, delivery_id, time)
                        this.swalToast("Tạo đơn giao vận thành công", "success")
                        return
                    }
                    if (
                        !create_order.data.data.snap_order.success &&
                        this.payload.delivery_platform == "GHTK"
                    ) {
                        return this.swalToast(create_order.data.data.snap_order.message, "error", 4000)
                    }
                }
                this.swalToast(`Tạo đơn lỗi bên ${this.payload.delivery_platform}`, "error", 3000)
            } catch (e) {
                console.log("e", e)
                if (
                    e.data &&
                    e.data.error_message
                ) {
                    if (e.data.error_message.code_message_value) {
                        return this.swalToast(e.data.error_message.code_message_value, 'error') //GHN
                    }
                    this.swalToast(e.data.error_message, 'error')   //VTP
                }

            }
        },
        handleSaveInfo() {
            // if (this.option_save_info) {
            let data = JSON.parse(localStorage.getItem('order_3d_platform'))
            console.log('localstorerage', { ...data, 'store_email': this.store_email });
            localStorage.setItem('order_3d_platform', JSON.stringify({ ...data, 'option_save_info': this.option_save_info, 'sender_email': this.order_info.sender_email }))
            // }
        },
        getEmailLocal() {
            if (this.payload.delivery_platform == "VIETTEL_POST") {
                let data = JSON.parse(localStorage.getItem('order_3d_platform'))
                if (data && data.option_save_info) {
                    return this.order_info.sender_email = data.sender_email
                }
                this.option_save_info = false
            }

        },
        handleShowNote() {
            this.is_show_note = !this.is_show_note
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
            let number = string.toString().replace(/\D/g, "")
            this.order_info.cod_amount_num = number
            this.order_info.cod_amount = new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "VND",
            }).format(number)
            return number.length
        },
        swalToast(title, icon, timer = 2000) {
            const Toast = Swal.mixin({
                toast: true,
                position: "center",
                showConfirmButton: false,
                width: '80vw',
                timer: timer,
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
        'order_info.inventory': function () {
            this.handleShopChange()
        },
        prop_receiver_address: function (value) {
            this.order_info.receiver_address = this.prop_receiver_address
            if (this.payload.delivery_platform == 'GHTK') {
                this.getShippingFee()
            }
        },
        prop_receiver_city: function (value) {
            this.order_info.receiver_city = this.prop_receiver_city
            this.handleChangeCity()
        },
        prop_receiver_district: function (value) {
            console.log('11111111111111111111111111');
            this.order_info.receiver_district = this.prop_receiver_district
            this.handleChangeDistrict()
        },
        prop_receiver_ward: function (value) {
            this.order_info.receiver_ward = this.prop_receiver_ward
            this.handleChangeWard()
        },
        prop_receiver_name: function () {
            this.order_info.receiver_name = this.prop_receiver_name
        },
        prop_receiver_phone: function () {
            this.order_info.receiver_phone = this.prop_receiver_phone
        },
        prop_receiver_email: function () {
            this.order_info.receiver_email = this.prop_receiver_email
        },
        'payload.store_email': function () {
            this.order_info.sender_email = this.payload.store_email
        },
        prop_total_price: function () {
            if (this.payload.delivery_platform == 'VIETTEL_POST') {
                this.getPricingServices()
            }
            if (this.payload.delivery_platform == 'GHTK') {
                this.getShippingFee()
            }
            if (this.payload.delivery_platform == 'GHN' || this.payload.delivery_platform == 'GHTK') {
                this.formatNumber(this.prop_total_price)
            }
        },
        'order_info.shipping_fee': function () {
            console.log('emit shipping fee');
            this.$emit('shipping_fee', this.order_info.shipping_fee)
        },
        'order_info.order_service': function () {
            this.handleShippingFeeVTP()
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
            });
            return formatter.format(value)
        },
    }
};