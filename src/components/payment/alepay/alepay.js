import Restful from '@/services/resful.js'
import EventBus from "@/EventBus.js"

// const APICMS = "https://ext.botup.io"  //product
// const APICMS = "http://localhost:1337" //dev
const APICMS = "https://devbbh.tk" //dev

export default {
    props: ['store_token', 'payload', 'prop_receiver_name', 'prop_receiver_phone', 'prop_receiver_email', 'prop_receiver_address', 'prop_receiver_city', 'prop_receiver_district', 'prop_receiver_ward', 'prop_product_info', 'total_price', 'prop_total_payment', 'order_option', 'propSendMessage'],
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
            url_payment: "",
            message_bbh: "",
            handle_api: false,
            product_info: this.prop_product_info,
        }
    },
    created() {
    },
    mounted() {
    },
    methods: {
        handleBodyCreatePayment(order_id) {
            let body = {
                "order_id": order_id,
                "order_amount": this.prop_total_payment,
                "currency": 'VND',
                "other_info": {
                    "checkoutType": this.checkout_type.value
                },
                "order_description": this.order_description,
                "total_item": this.product_info.total_item,
                "return_url": `https://devbbh.tk/v1/selling-page/payment/check_payment_and_order/?access_token=${this.store_token}&order_id=${order_id}`,
                "cancel_url": `https://devbbh.tk/v1/selling-page/payment/check_payment_and_order/?access_token=${this.store_token}&order_id=${order_id}`,
                "customer_name": this.prop_receiver_name,
                "customer_email": this.prop_receiver_email,
                "customer_phone": this.prop_receiver_phone,
                "customer_address": this.prop_receiver_address,
                "customer_city": this.prop_receiver_city.name,
                "customer_country": this.country,
            }
            return body
        },
        async createPayment(order_id) {
            try {
                if (this.handle_api) return
                this.handle_api = true
                let path = `${APICMS}/v1/selling-page/payment/payment_create`
                let body = this.handleBodyCreatePayment(order_id)
                let params = {}
                let headers = { Authorization: this.store_token }
                console.log('body create payment', body);

                let create_payment = await Restful.post(path, body, params, headers)

                this.handle_api = false
                console.log('create payment', create_payment);
                if (create_payment.data &&
                    create_payment.data.data &&
                    create_payment.data.data.snap_payment
                ) {
                    let url_payment = create_payment.data.data.snap_payment.checkoutUrl
                    // let message_bbh = []
                    if (url_payment) {
                        this.propSendMessage(order_id, url_payment)
                    }
                }
                console.log('this.url_payment', this.url_payment);
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
                this.swalToast('Đã xảy ra lỗi khi tạo link thanh toán', 'error')
            }

        },
        validateCreatePayment() {
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
        prop_product_info: function () {
            this.product_info = this.prop_product_info
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
}