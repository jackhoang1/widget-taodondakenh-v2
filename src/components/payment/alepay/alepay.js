import Restful from '@/services/resful.js'
import EventBus from "@/EventBus.js"

// const APICMS = "https://ext.botup.io"  //product
const APICMS = "http://localhost:1337" //dev

export default {
    props: ['store_token', 'payload', 'prop_receiver_name', 'prop_receiver_phone', 'prop_receiver_email', 'prop_receiver_address', 'prop_receiver_city', 'prop_receiver_district', 'prop_receiver_ward', 'prop_product_info', 'total_price', 'prop_res_order_info', 'prop_total_payment', 'order_option'],
    data() {
        return {
            list_type: [
                { name: 'Cho phép thanh toán ngay với thẻ quốc tế và trả góp', value: 0 },
                { name: 'Chỉ thanh toán ngay với thẻ quốc tế', value: 1 },
                // { name: 'Chỉ thanh toán trả góp', value: 2 },
                // { name: 'Thanh toán ngay với thẻ ATM, IB, QRCODE, thẻ quốc tế và thanh toán trả góp', value: 3 },
                // { name: 'Thanh toán ngay với thẻ ATM, IB, QRCODE, thẻ quốc tế', value: 4 },
            ],
            checkout_type: "",
            country: 'Việt Nam',
            order_description: '',
            checkout_url: "",
            message_bbh: "",
            handle_api: false,
            product_info: this.prop_product_info,
            res_order_info: this.prop_res_order_info,
            info_delivery: "",
        }
    },
    created() {
        EventBus.$on('create-payment', (order_id) => {
            this.createPayment(order_id)
        })


    },
    mounted() {
        console.log('res_order_info', this.res_order_info);
        console.log('payload', this.payload);
        console.log('product_info', this.product_info);
    },
    methods: {
        getDataEventBus(e) {
            this.info_delivery = e
        },
        handleBodyCreatePayment(order_id) {
            let body = {}
            // body['payment_token'] = this.payload.payment_token
            body['order_id'] = order_id
            body['order_amount'] = this.prop_total_payment
            body['currency'] = 'VND'
            body.other_info = {}
            body.other_info.checkoutType = this.checkout_type.value
            body['order_description'] = this.order_description
            body['total_item'] = this.product_info.total_item
            body['return_url'] = 'https://xbusiness.vn/'
            body['cancel_url'] = 'https://xbusiness.vn/'
            body['customer_name'] = this.prop_receiver_name
            body['customer_email'] = this.prop_receiver_email
            body['customer_phone'] = this.prop_receiver_phone
            body['customer_address'] = this.prop_receiver_address
            body['customer_city'] = this.prop_receiver_city.name
            body['customer_country'] = this.country
            return body
        },
        async createPayment(order_id) {
            try {
                if (!this.handleValidate()) return
                if (this.handle_api) return
                this.handle_api = true
                let path = `${APICMS}/v1/selling-page/payment/payment_create`
                let body = this.handleBodyCreatePayment(order_id)
                let params = {}
                let headers = { Authorization: this.store_token }
                console.log('body create payment', body);

                let create_payment = await Restful.post(path, body, params, headers)
                console.log('create payment', create_payment);
                if (create_payment.data &&
                    create_payment.data.data &&
                    create_payment.data.data.snap_payment
                ) {
                    let checkout_url = create_payment.data.data.snap_payment.checkoutUrl
                    // let message_bbh = []
                    if (checkout_url) {
                        this.sendMessage(checkout_url)
                    }
                }
                this.handle_api = false
                console.log('this.checkout_url', this.checkout_url);
                this.swalToast('Tạo Thanh toán thành công', 'success')
            } catch (e) {
                console.log(e);
                this.handle_api = false
                if (
                    e.data &&
                    e.data.error_message &&
                    e.data.error_message.errorDescription
                ) {
                    this.swalToast(e.data.error_message.errorDescription, 'error')
                    return
                }
                this.swalToast('Đã xảy ra lỗi', 'error')
            }

        },
        async sendMessage(checkout_url) {
            try {
                let path = 'https://api.botbanhang.vn/v1.3/public/json'
                let params = {
                    access_token: this.payload.token_bbh,
                    psid: this.payload.mid,
                }
                let body = {
                    messages: [
                        {
                            text: 'Bạn hãy Click vào link sau để thanh toán với Alepay:'
                        },
                        {
                            text: checkout_url
                        }
                    ]
                }
                console.log('body message', body);

                let message = await Restful.post(path, body, params)
                setTimeout(() => {
                    this.swalToast('Gửi link thanh toán về Message thành công', 'success')
                    this.handleShowForm('order')
                }, 1000)
            } catch (e) {
                console.log(e);
            }

        },
        handleValidate() {
            if (!this.checkout_type) {
                this.swalToast('Bạn chưa chọn Phương thức thanh toán', 'warning')
                return false
            }
            if (!this.order_description.trim()) {
                this.swalToast('Bạn chưa điền Mô tả đơn hàng', 'warning')
                return false
            }
            return true
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
        // prop_receiver_address: function (value) {
        //     console.log('watch run 0', value);
        //     this.order_info.receiver_address = this.prop_receiver_address
        // },
        // prop_receiver_city: function (value) {
        //     console.log('watch run 1', value);
        //     this.order_info.receiver_city = this.prop_receiver_city
        // },
        // prop_receiver_district: function (value) {
        //     console.log('watch run 2', value, value.length);
        //     this.order_info.receiver_district = this.prop_receiver_district
        // },
        // prop_receiver_ward: function (value) {
        //     console.log('watch run 3', value)
        //     this.order_info.receiver_ward = this.prop_receiver_ward

        // },
        prop_product_info: function () {
            this.product_info = this.prop_product_info
        },
        prop_res_order_info: function (value) {
            this.res_order_info = this.prop_res_order_info
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
}