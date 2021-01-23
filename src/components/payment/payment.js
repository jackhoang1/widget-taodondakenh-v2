import Restful from '@/services/resful.js'
import orderTypeVnpay from "@/services/orderTypeVnpay.json"
import SearchBankVnpay from "@/components/SearchAddress.vue"
import { APICMS } from "@/services/constant.js"

export default {
    components: {
        SearchBankVnpay
    },
    props: ['msg_content', 'store_token', 'payload', 'statusEditOrder', 'prop_receiver_name', 'prop_receiver_phone', 'prop_receiver_address', 'prop_receiver_city', 'prop_receiver_district', 'prop_receiver_ward', 'prop_product_info', 'total_price', 'prop_total_payment', 'order_option', 'propSendMessage'],
    data() {
        return {
            list_type: [
                { name: 'Cho phép thanh toán ngay với thẻ quốc tế và trả góp', value: 0 },
                { name: 'Chỉ thanh toán ngay với thẻ quốc tế', value: 1 },
                // { name: 'Chỉ thanh toán trả góp', value: 2 },
                // { name: 'Thanh toán ngay với thẻ ATM, IB, QRCODE, thẻ quốc tế và thanh toán trả góp', value: 3 },
                // { name: 'Thanh toán ngay với thẻ ATM, IB, QRCODE, thẻ quốc tế', value: 4 },
            ],
            list_order_type_vnpay: orderTypeVnpay,
            order_type_vnpay: '',
            bank_vnpay: '',
            checkout_type: '',
            country: 'Việt Nam',
            order_description: 'Thanh toán đơn hàng {{order_id}}',
            url_payment: '',
            message_bbh: '',
            handle_api: false,
            product_info: this.prop_product_info,
            validate_failed: {
                checkout_type: false,
                order_description: false,
                order_type_vnpay: false,
            }
        }
    },
    created() {
    },
    mounted() {
        this.initialization
    },
    computed: {
        initialization() {       // default hình  thức thanh toán
            if (this.payload.payment_platform == 'ALEPAY')
                this.checkout_type = this.list_type[1]
            if (this.payload.payment_platform == 'VNPAY')
                this.order_type_vnpay = this.list_order_type_vnpay[0]
        }
    },
    methods: {
        handleBodyCreatePayment(order_id) {
            let body = {
                'order_id': order_id,
                'order_amount': this.prop_total_payment,
                'currency': 'VND',
                'other_info': {
                    'checkoutType': this.checkout_type.value
                },
                'order_description': this.order_description,
                'total_item': this.product_info.total_item,
                'return_url': `${APICMS}/dev-cms/#/payment/?access_token=${this.store_token}&order_id=${order_id}`,
                'cancel_url': `${APICMS}/dev-cms/#/payment/?access_token=${this.store_token}&order_id=${order_id}`,
                'customer_name': this.prop_receiver_name,
                'customer_email': 'botbanhang@gmail.com',
                'customer_phone': this.prop_receiver_phone,
                'customer_address': this.prop_receiver_address,
                'customer_city': this.prop_receiver_city.name,
                'customer_country': this.country,
            }

            if (this.payload.payment_platform == 'VNPAY') {
                body['order_type'] = this.order_type_vnpay.code
                body['request_url'] = 'http://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
            }
            return body
        },
        async createPayment(order_id) {
            try {
                let path = `${APICMS}/v1/selling-page/payment/payment_create`
                let body = this.handleBodyCreatePayment(order_id)
                body['order_description'] = body['order_description'].replace(/{{order_id}}/gi, order_id)
                let headers = { Authorization: this.store_token }

                let create_payment = await Restful.post(path, body, null, headers)

                if (
                    create_payment &&
                    create_payment.data &&
                    create_payment.data.data &&
                    create_payment.data.data.snap_payment
                ) {
                    let snap_payment = create_payment.data.data.snap_payment
                    let url_payment = snap_payment.checkoutUrl || snap_payment.data
                    // let message_bbh = []
                    if (url_payment) {
                        let time = create_payment.data.data.updatedAt
                        if (
                            this.msg_content &&
                            this.msg_content.activated &&
                            this.msg_content.activated.payment
                        ) {   // * check  activated  payment is true => send messager
                            this.propSendMessage(order_id, url_payment, null, time)
                        }
                    }
                }
                this.swalToast('Tạo Thanh toán thành công', 'success')
            } catch (e) {
                console.log(e);
                if (
                    e &&
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
            this.validate_failed.checkout_type = !this.checkout_type ? true : false
            this.validate_failed.order_description = !this.order_description ? true : false
            this.validate_failed.order_type_vnpay = !this.order_type_vnpay ? true : false
            if (!this.order_description.trim()) return false
            if (this.payload.payment_platform == 'ALEPAY' && !this.checkout_type) {
                return false
            }
            if (this.payload.payment_platform == 'VNPAY' && !this.order_type_vnpay) {
                return false
            }
            return true
        },
        swalToast(title, icon) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'center',
                showConfirmButton: false,
                width: '80vw',
                timer: 2000,
                timerProgressBar: false,
                onOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                },
            });
            Toast.fire({
                icon: icon,
                title: title,
                padding: '5px',
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
            if (typeof value !== 'number') {
                return value
            }
            let formatter = new Intl.NumberFormat('de-DE', {
                style: 'currency',
                minimumFractionDigits: 0,
                currency: 'VND',
            });
            return formatter.format(value)
        },
    }
}