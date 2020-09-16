import Restful from "@/services/resful.js"
import Autocomplete from "@/components/SearchAddress.vue"
import EventBus from "@/EventBus.js"

// const APICMS = "https://ext.botup.io" //product
// const APICMS = "http://localhost:1337" //dev
const APICMS = "https://devbbh.tk"; //dev


export default {
    components: { Autocomplete },
    props: ['store_token', 'payload', 'prop_receiver_name', 'prop_receiver_phone', 'prop_receiver_email', 'prop_receiver_address', 'prop_receiver_city', 'prop_receiver_district', 'prop_receiver_ward', 'prop_product_info', 'total_price', 'prop_res_order_info', 'order_option', 'propSendMessage'],
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
            receiver_city: this.prop_receiver_city,
            receiver_district: this.prop_receiver_district,
            receiver_ward: this.prop_receiver_ward,
            pricing_services_list: "",
            res_order_info: this.prop_res_order_info,
            product_info: this.prop_product_info,
            order_info: {
                inventory: "",
                group_address_id: "",
                sender_name: "",
                sender_phone: "",
                sender_email: 'testwidget123@gmail.com',
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

                shipping_fee: 0,
            },
            handle_api: false,
            is_show_popup: false,
            is_show_note: false,
        };
    },
    async created() {
        EventBus.$on("create-delivery", (order_id) => {
            this.createOrder(order_id)
        });

        // EventBus.$on("info-delivery", (product_info, total_price) => {
        //     this.handleEventBusInfo(product_info, total_price)
        // });
    },
    async mounted() {
        this.getInventory()
        console.log('payload', this.payload);
        console.log('prop_receiver_city', this.prop_receiver_city);
        console.log('prop_receiver_district', this.prop_receiver_district);
        console.log('prop_receiver_ward', this.prop_receiver_ward);

    },
    methods: {
        // async getListDistrictSender() {
        //     this.list_district_sender = await this.getDistrict(this.order_info.sender_city.PROVINCE_ID)
        // },
        // async getListDistrictReceiver() {
        //     this.list_district_receiver = await this.getDistrict(this.order_info.receiver_city.PROVINCE_ID)
        // },
        // async getListWardSender() {
        //     this.list_ward_sender = await this.getWard(this.order_info.sender_district.DISTRICT_ID)
        // },
        // async getListWardReceiver() {
        //     this.list_ward_receiver = await this.getWard(this.order_info.receiver_district.DISTRICT_ID)
        // },




        // resetAddress() {
        //     this.order_info.sender_city = ""
        //     this.order_info.sender_district = ""
        //     this.order_info.sender_ward = ""
        //     this.order_info.sender_street = ""
        //     this.order_info.sender_address = ""
        //     this.order_info.receiver_city = ""
        //     this.order_info.receiver_district = ""
        //     this.order_info.receiver_ward = ""
        //     this.order_info.receiver_street = ""
        //     this.order_info.receiver_address = ""
        // },

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
                    if (this.payload.delivery_platform_type == 'VIETTEL_POST') {
                        return this.list_inventories = get_inventory.data.data.inventory
                    }
                    if (this.payload.delivery_platform_type == 'GHN') {
                        return this.list_inventories = get_inventory.data.data.shops
                    }
                    if (this.payload.delivery_platform_type == 'GHTK') {
                        return this.list_inventories = get_inventory.data.data
                    }
                }
            } catch (e) {
                console.log(e)
            }
        },
        async getPricingServices() {
            try {
                console.log('1111111111');
                if (
                    (this.payload.delivery_platform_type == 'VIETTEL_POST' &&
                        (
                            !this.order_info.inventory.provinceId ||
                            !this.order_info.inventory.districtId ||
                            !this.order_info.receiver_city.PROVINCE_ID ||
                            !this.order_info.receiver_district.DISTRICT_ID ||
                            !this.order_info.product_type ||
                            !this.order_info.weight ||
                            !this.order_info.length ||
                            !this.order_info.width ||
                            !this.order_info.height ||
                            !this.total_price
                        )
                    ) ||
                    (this.payload.delivery_platform_type == 'GHN' &&
                        (
                            !this.order_info.inventory.district_id ||
                            ///sửa khi thay api get district
                            !this.order_info.receiver_district.DISTRICT_ID
                        )
                    ) ||
                    (this.payload.delivery_platform_type == 'GHTK')
                ) return
                let path = `${APICMS}/v1/selling-page/delivery/delivery_get_service`
                let body = {}
                if (this.payload.delivery_platform_type == 'VIETTEL_POST') {
                    body = {
                        sender_province: this.order_info.inventory.provinceId,
                        sender_district: this.order_info.inventory.districtId,
                        receiver_province: this.order_info.receiver_city.PROVINCE_ID,
                        receiver_district: this.order_info.receiver_district.DISTRICT_ID,
                        product_type: this.order_info.product_type,
                        weight: parseInt(this.order_info.weight),
                        length: parseInt(this.order_info.length),
                        width: parseInt(this.order_info.width),
                        height: parseInt(this.order_info.height),
                        product_price: parseInt(this.total_price),
                    }
                }
                if (this.payload.delivery_platform_type == 'GHN') {
                    body = {
                        from_district: this.order_info.inventory.district_id,
                        ///sửa khi thay api get district
                        to_district: this.order_info.receiver_district.DISTRICT_ID,
                    }
                }
                console.log('body getPricingServices', body);
                let headers = {
                    Authorization: this.store_token
                }

                let get_pricing_services = await Restful.post(path, body, null, headers)
                console.log('get_pricing_services', get_pricing_services);
                if (
                    get_pricing_services.data &&
                    get_pricing_services.data.data &&
                    get_pricing_services.data.code == 200
                ) {
                    this.pricing_services_list = get_pricing_services.data.data.services
                }
            } catch (e) {
                console.log(e)
            }
        },
        handleShippingFee() {
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
        infoDelivery(product_info, total_price) {
            let info_delivery = {
                'group_address_id': this.order_info.inventory.groupaddressId,
                'sender_name': this.order_info.inventory.name,
                'sender_address': this.order_info.inventory.address,
                'sender_phone': this.order_info.inventory.phone,
                'sender_email': this.order_info.sender_email,
                'sender_ward': this.order_info.inventory.wardsId,
                'sender_district': this.order_info.inventory.districtId,
                'sender_province': this.order_info.inventory.provinceId,
                'receiver_name': this.order_info.receiver_name,
                'receiver_phone': this.order_info.receiver_phone,
                'receiver_address': this.order_info.receiver_address,
                'receiver_email': this.order_info.receiver_email,
                'receiver_province': this.order_info.receiver_city.PROVINCE_ID,
                'receiver_district': this.order_info.receiver_district.DISTRICT_ID,
                'receiver_ward': this.order_info.receiver_ward.WARDS_ID,
                'product_name': product_info.list_product,
                'product_quantity': product_info.total_item,
                'product_price': parseInt(total_price),

                'product_type': this.order_info.product_type,
                'order_payment': this.order_info.order_payment,
                'order_service': this.order_info.order_service.MA_DV_CHINH,
                'weight': parseInt(this.order_info.weight),
                'length': parseInt(this.order_info.length),
                'width': parseInt(this.order_info.width),
                'height': parseInt(this.order_info.height),
                'required_note': this.order_info.required_note,
            }
            // EventBus.$emit('info-delivery-a', info_customer_delivery)
            return info_delivery
        },
        // component order sẽ gọi hàm này
        validateCreateDelivery() {

            if (!this.order_info.inventory) {
                this.swalToast("Bạn chưa chọn kho hàng", 'warning')
                return false
            }
            if (!this.order_info.product_type) {
                this.swalToast("Bạn chưa chọn phân loại sản phẩm", 'warning')
                return false
            }
            if (!this.order_info.order_payment) {
                this.swalToast("Bạn chưa chọn hình thức thanh toán đơn hàng", 'warning')
                return false
            }
            if (!this.order_info.order_service) {
                this.swalToast("Bạn chưa chọn dịch vụ giao vận", 'warning')
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
            return true
        },
        async createOrder(order_id) {
            try {
                console.log('prop res order info', this.prop_res_order_info);

                if (this.handle_api) return
                this.handle_api = true
                let path = `${APICMS}/v1/selling-page/delivery/delivery_create`
                let headers = { Authorization: this.store_token }
                let body = {
                    'order_id': order_id,
                    'group_address_id': this.order_info.inventory.groupaddressId,
                    'sender_name': this.order_info.inventory.name,
                    'sender_address': this.order_info.inventory.address,
                    'sender_phone': this.order_info.inventory.phone,
                    'sender_email': this.order_info.sender_email,
                    'sender_ward': this.order_info.inventory.wardsId,
                    'sender_district': this.order_info.inventory.districtId,
                    'sender_province': this.order_info.inventory.provinceId,
                    'receiver_name': this.order_info.receiver_name,
                    'receiver_phone': this.order_info.receiver_phone,
                    'receiver_address': this.order_info.receiver_address,
                    'receiver_email': this.order_info.receiver_email,
                    'receiver_province': this.order_info.receiver_city.PROVINCE_ID,
                    'receiver_district': this.order_info.receiver_district.DISTRICT_ID,
                    'receiver_ward': this.order_info.receiver_ward.WARDS_ID,
                    'product_name': this.product_info.list_product,
                    'product_quantity': this.product_info.total_item,
                    'product_price': parseInt(this.total_price),

                    'product_type': this.order_info.product_type,
                    'order_payment': this.order_info.order_payment,
                    'order_service': this.order_info.order_service.MA_DV_CHINH,
                    'weight': parseInt(this.order_info.weight),
                    'length': parseInt(this.order_info.length),
                    'width': parseInt(this.order_info.width),
                    'height': parseInt(this.order_info.height),
                    'required_note': this.order_info.required_note,
                };
                if (this.payload.delivery_platform_type == 'GHN') {
                    // body.
                }
                console.log("body create delivery", body)

                let create_order = await Restful.post(path, body, {}, headers)
                console.log('res create order delivery', create_order);
                this.handle_api = false
                if (
                    create_order.data &&
                    create_order.data.data &&
                    create_order.data.data.snap_order &&
                    create_order.data.data.snap_order.data &&
                    create_order.data.data.snap_order.message == 'success'
                ) {
                    if (this.order_option == 1) {
                        this.propSendMessage(order_id)
                    }
                    else {
                        this.propSendMessage(order_id)
                    }
                    console.log("33333333333333333", create_order)
                    // this.resetAddress()
                    // this.handleShowForm('order')
                    this.swalToast("Tạo đơn giao vận thành công", "success")
                    return
                }
                this.swalToast("Lỗi tạo đơn giao vận", "error")
            } catch (e) {
                console.log("e", e)
                this.handle_api = false
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
        // async sendMessage(order_id) {
        //     try {
        //         let path = 'https://api.botbanhang.vn/v1.3/public/json'
        //         let params = {
        //             access_token: this.payload.token_bbh,
        //             psid: this.payload.mid,
        //         }
        //         let body = {
        //             messages: [
        //                 {
        //                     text: `Đơn hàng ${order_id} của bạn đang được giao vận.`
        //                 }
        //             ]
        //         }
        //         console.log('body message', body);

        //         let message = await Restful.post(path, body, params)
        //         setTimeout(() => {
        //             this.swalToast('Gửi link thanh toán về Message thành công', 'success')
        //             // this.handleShowForm('order')
        //         }, 1000)
        //     } catch (e) {
        //         console.log(e);
        //     }

        // },

        // checkValidatePricingServices() {
        //     if (!this.order_info.sender_city) {
        //         this.swalToast("Bạn chưa chọn Tỉnh/TP bên gửi", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.sender_district) {
        //         this.swalToast("Bạn chưa chọn Quận/Huyện bên gửi", "warning")
        //         return false
        //     }
        //     if (!this.order_info.receiver_city) {
        //         this.swalToast("Bạn chưa chọn Tỉnh/TP bên nhận", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.receiver_district) {
        //         this.swalToast("Bạn chưa chọn Quận/Huyện bên nhận", "warning")
        //         return false
        //     }
        //     if (!this.order_info.weight) {
        //         this.swalToast("Bạn chưa nhập khối lượng", "warning")
        //         return false
        //     }
        //     if (!this.order_info.product_type) {
        //         this.swalToast("Bạn chưa chọn phân loại sản phẩm", "warning")
        //         return false
        //     }
        //     if (!this.order_info.product_price_num) {
        //         this.swalToast("Bạn chưa nhập giá sản phẩm", "warning")
        //         return false
        //     }
        //     return true
        // },

        // checkValidateAll() {
        //     if (!this.checkValidatePricingServices()) return false
        //     if (!this.order_info.inventory) {
        //         this.swalToast("Bạn chưa chọn kho hàng", "warning")
        //         return false
        //     }
        //     if (!this.order_info.sender_name) {
        //         this.swalToast("Bạn chưa nhập Tên bên gửi", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.sender_phone) {
        //         this.swalToast("Bạn chưa nhập số ĐT bên gửi", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.sender_email) {
        //         this.swalToast("Bạn chưa nhập số email bên gửi", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.sender_street) {
        //         this.swalToast("Bạn chưa nhập địa chỉ bên gửi", 'warning')
        //         return false
        //     }
        //     console.log('this.order_info.sender_ward', this.order_info.sender_ward);
        //     if (!this.order_info.sender_ward) {
        //         this.swalToast("Bạn chưa chọn Xã/Phường bên gửi", "warning")
        //         return false
        //     }
        //     if (!this.order_info.receiver_name) {
        //         this.swalToast("Bạn chưa nhập Tên bên nhận", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.receiver_phone) {
        //         this.swalToast("Bạn chưa nhập số ĐT bên nhận", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.receiver_email) {
        //         this.swalToast("Bạn chưa nhập số email bên nhận", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.receiver_address) {
        //         this.swalToast("Bạn chưa nhập địa chỉ bên nhận", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.receiver_ward) {
        //         this.swalToast("Bạn chưa chọn Xã/Phường bên nhận", "warning")
        //         return false
        //     }
        //     if (!this.order_info.product_name) {
        //         this.swalToast("Bạn chưa sản phẩm", "warning")
        //         return false
        //     } if (!this.order_info.product_quantity) {
        //         this.swalToast("Bạn chưa số lượng sản phẩm", "warning")
        //         return false
        //     }
        //     if (!this.order_info.length) {
        //         this.swalToast("Bạn chưa nhập chiều dài", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.width) {
        //         this.swalToast("Bạn chưa nhập chiều rộng", 'warning')
        //         return false
        //     }
        //     if (!this.order_info.height) {
        //         this.swalToast("Bạn chưa nhập chiều cao", "warning")
        //         return false
        //     }
        //     if (!this.order_info.order_payment) {
        //         this.swalToast("Bạn chưa chọn hình thức thanh toán đơn hàng", "warning")
        //         return false
        //     }
        //     if (!this.order_info.order_service) {
        //         this.swalToast("Bạn chưa chọn dịch vụ giao vận", "warning")
        //         return false
        //     }
        //     return true
        // },
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
    // beforeDestroy() {
    //     this.order_info.shipping_fee = 0
    // },
    watch: {
        prop_receiver_address: function (value) {
            console.log('watch run 0', value);
            this.order_info.receiver_address = this.prop_receiver_address
        },
        prop_receiver_city: function (value) {
            console.log('watch run 1', value);
            this.order_info.receiver_city = this.prop_receiver_city
            this.getPricingServices()
        },
        prop_receiver_district: function (value) {
            console.log('watch run 2', value, value.length);
            this.order_info.receiver_district = this.prop_receiver_district
            this.getPricingServices()
        },
        prop_receiver_ward: function (value) {
            console.log('watch run 3', value)
            this.order_info.receiver_ward = this.prop_receiver_ward

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
        prop_receiver_address: function () {
            this.order_info.receiver_address = this.prop_receiver_address
        },

        prop_product_info: function () {
            console.log('watch 1111111111111111111111111111111111111111111', this.prop_product_info);
            this.product_info = this.prop_product_info
        },
        prop_res_order_info: function (value) {
            this.res_order_info = this.prop_res_order_info
        },
        total_price: function () {
            this.getPricingServices()
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
    },
};