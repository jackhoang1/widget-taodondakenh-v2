import EventBus from "@/EventBus.js";
import Restful from "@/services/resful.js";
import { APICMS } from "@/services/constant.js"

const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: false,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    width: '80vw',
});
const Toast2 = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    width: '80vw',
});

export default {
    props: ['store_token', 'payload', 'handleShowCreateOrder', 'readSetting', 'updateSetting'],
    data() {
        return {
            filterOrder: 'customer',
            list_order: [],
            skip: 0,
            order_filter: '',
            handle_api: false,
            handle_draft_order: false,
            delivery_platform: '',
            payment_platform: '',
            is_short: false
        };
    },
    async created() {
        try {
            if (!this.store_token) {
                throw 'Error store_token';
            }

            EventBus.$on('call-order', () => {
                this.readOrder()
            });
        } catch (e) {
            console.log(e);
        }
    },
    mounted() {
    },
    methods: {
        computeTime(timeStamp) {
            let date = new Date(timeStamp);
            let time = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
                }:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
                }`;
            let day = `${date.getDate()}/${date.getMonth() + 1}`
            return time + ' ' + day
        },
        handlefilterOrder() {
            this.updateSetting('filter_order', { filter_order: this.filterOrder })
            this.readOrder()
        },
        handleClickOrder(index, expand, order_status) {
            // Thay đổi class của order-title
            let arr_tag_expand = this.$el.getElementsByClassName('order__expand')
            let arr_tag_title = this.$el.getElementsByClassName('order__title')
            let class_tag_expand =
                this.$el.getElementsByClassName('order__expand')[index].classList
            let class_tag_title =
                this.$el.getElementsByClassName('order__title')[index].classList
            if (expand) {
                class_tag_expand.remove('expand__hide')
                class_tag_title.add('expand__border')
                if (order_status === 'draft_order' || order_status === 'new_order')
                    class_tag_expand.add('expand__show--large')
                else
                    class_tag_expand.add('expand__show--medium')
                return
            }
            for (let i = 0; i < arr_tag_expand.length; ++i) {
                if (i !== index) {
                    arr_tag_title[i].classList.remove('expand__border')
                    arr_tag_expand[i].classList.remove('expand__show--large')
                    arr_tag_expand[i].classList.remove('expand__show--medium')
                    arr_tag_expand[i].classList.add('expand__hide')
                }
            }
            for (let i = 0; i < class_tag_expand.length; ++i) {
                if (class_tag_expand[i] === 'expand__show--large' || class_tag_expand[i] === 'expand__show--medium') {
                    class_tag_expand.remove('expand__show--large')
                    class_tag_expand.remove('expand__show--medium')
                    class_tag_expand.add('expand__hide')
                    class_tag_title.remove('expand__border')
                    return
                }
            }
            if (order_status === 'draft_order' || order_status === 'new_order')
                class_tag_expand.add('expand__show--large')
            else
                class_tag_expand.add('expand__show--medium')
            class_tag_title.add('expand__border')
        },
        async handleClickEdit(item) {
            if (item) {
                if (item.status === 'draft_order' || item.status === 'new_order') {
                    await this.handleShowCreateOrder()
                    EventBus.$emit('get-order', item)
                }
            }
        },
        async readOrder() {
            try {
                let path = `${APICMS}/v1/selling-page/order/order_read`
                let headers = { Authorization: this.store_token }
                let params = { sort: 'createdAt DESC', customer_id: this.payload.customer_id }

                if (this.filterOrder === 'all') delete params.customer_id

                let get_list_order = await Restful.get(path, params, headers)
                if (get_list_order.data && get_list_order.data.data) {
                    if (get_list_order.data.data.orders) {
                        this.list_order = get_list_order.data.data.orders
                    }
                    if (get_list_order.data.data.delivery_platform) {
                        this.delivery_platform = get_list_order.data.data.delivery_platform
                    }
                    if (get_list_order.data.data.payment_platform) {
                        this.payment_platform = get_list_order.data.data.payment_platform
                    }
                    this.$emit('platform', this.delivery_platform, this.payment_platform)
                } else {
                    throw 'Lỗi lấy danh sách Đơn hàng'
                }
            } catch (e) {
                console.log(e);
                if (e.data && e.data.error_message) {
                    Toast2.fire({
                        icon: 'error',
                        title: e.data.error_message,
                    });
                    return;
                }
                Toast2.fire({
                    icon: 'error',
                    title: e,
                });
            }
        },
        async handleGetMoreOrder() {
            try {
                this.skip = this.skip + 20;
                let path = `${APICMS}/v1/selling-page/order/order_read`
                let headers = { Authorization: this.store_token }
                let params = {
                    sort: 'createdAt DESC',
                    skip: this.skip,
                    customer_id: this.payload.customer_id
                };

                if (this.filterOrder === 'all') delete params.customer_id

                let get_list_order = await Restful.get(path, params, headers)

                if (
                    get_list_order &&
                    get_list_order.data &&
                    get_list_order.data.data &&
                    get_list_order.data.data.orders
                ) {
                    if (get_list_order.data.data.orders.length === 0) {
                        Toast2.fire({
                            icon: 'success',
                            title: 'Đã hiển thị tất cả đơn hàng',
                        })
                        return
                    }
                    this.list_order = this.list_order.concat(get_list_order.data.data.orders)
                } else {
                    throw 'Lỗi lấy danh sách Đơn hàng'
                }
            } catch (e) {
                if (e && e.data && e.data.error_message) {
                    Toast2.fire({
                        icon: 'error',
                        title: e.data.error_message,
                    });
                    return
                }
                Toast2.fire({
                    icon: 'error',
                    title: e,
                })
            }
        },
        async updateStatusOrder(status, item, index) {
            if ((item.status == 'draft_order' && status == 'cancel_order') || (item.status == 'new_order' && status == 'confirmed_order')) {
                let path = `${APICMS}/v1/selling-page/order/order_update`
                let headers = { Authorization: this.store_token }
                let body = {
                    id: item.id,
                    status: status,
                }
                let updated = await Restful.post(path, body, {}, headers)
                await this.readOrder()
                this.handleClickOrder(index, true)
            }
        },
        handleClassLabel(item) {
            if (item.status == 'draft_order')
                return 'label-draft-order'
            if (item.status == 'new_order')
                return 'label-new-order'
            if (item.status == 'out_stock')
                return 'label-out_stock'
            if (item.status == 'confirmed_order')
                return 'label-confirm-order'
            if (item.status == 'deliver_order')
                return 'label-deliver-order'
            if (item.status == 'return_order')
                return 'label-return-order'
            if (item.status == 'success_order')
                return 'label-success-order'
            if (item.status == 'returned_order')
                return 'label-returned-order'
            if (item.status == 'cancel_order')
                return 'label-cancel-order'
        },
        isActiveConfirm(item) {
            if (item.status !== 'draft_order')
                return item.status === 'new_order'
        },
        isUnconfirm(item) {
            return item.status === 'unconfirmed'
        },
        isCancelled(item) {
            if (item.status === 'draft_order')
                return item.status === 'cancel_order'
        },
        checkPhone() {
            if (
                !this.payload.phone ||
                this.payload.phone == localStorage.getItem('order_3rd_cus_phone')
            ) return
            let length = this.list_order.length
            let phone_created = false
            let first_run = false
            if (length > 0) {
                for (const order of this.list_order) {
                    if (
                        order.status == 'draft_order' &&
                        order.customer_phone == this.payload.phone
                    ) {
                        phone_created = true
                        break
                    }
                    if (order.status != 'draft_order' && !first_run) {
                        first_run = true
                        if (order.customer_phone == this.payload.phone) {
                            phone_created = true
                        }
                    }
                }
                if (phone_created) {
                    return
                }

            }
            localStorage.setItem('order_3rd_cus_phone', this.payload.phone);
            this.createDraftOrder()
        },
        async createDraftOrder() {
            try {
                if (this.handle_draft_order) return
                this.handle_draft_order = true
                let path = `${APICMS}/v1/selling-page/order/order_draft`
                let body = {
                    customer_phone: this.payload.phone,
                    customer_name: this.payload.name,
                    customer_id: this.payload.customer_id,
                    status: 'draft_order',
                    other_info: {
                        psid: this.payload.psid,
                        token_bbh: this.payload.token_bbh
                    }
                }
                if (this.payload.email) {
                    body['customer_email'] = this.payload.email
                }
                let headers = { Authorization: this.store_token }

                let create_draft = await Restful.post(path, body, null, headers)

                this.readOrder()
            } catch (e) {
                console.log(e);
            }
        },
        handleListShort() {
            this.is_short = !this.is_short
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
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                },
            });
            Toast.fire({
                icon: icon,
                title: title,
                padding: '5px',
            })
        },
    },
    beforeDestroy() {
        EventBus.$off('call-order')
    },
    watch: {
        store_token: function () {
            this.readOrder()
        },
        'payload.customer_id': async function (newVal) {
            if (newVal) {
                await this.readOrder()
                this.checkPhone()
            }
        },
        // 'payload.setting': function (newVal) {
        //     console.log('setting', this.payload.setting);
        // }
    },
};