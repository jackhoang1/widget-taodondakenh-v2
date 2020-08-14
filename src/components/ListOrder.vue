<template lang="html">
  <div class="list">
     <div class="note pb-4">
         <textarea type="text" v-model="noteProp" class="form-control rounded" placeholder="Nhập nội dung ghi chú" />
     </div>
     <div class="order">
         <div v-for="(item, ind) in listOrder" class="order-detail mt-1" :key="ind">
             <div class="order-title d-flex align-items-center border rounded" :class="{ confirmed: isActiveConfirm(item) }" @click="handleClickOrder(ind)">
                 <img src="https://img.icons8.com/ios-filled/50/000000/expand-arrow.png"/>
                 <p class="text-dark m-0" >000{{ind + 1}}</p>
                 <img class="edit ml-auto"
                    src="https://img.icons8.com/material/48/000000/edit--v1.png"
                    @click.stop="handleClickEdit(item)"/>
             </div>
             <div class="order-expand" >
                 <div class="status d-flex align-items-center">
                     <img v-if="isUnconfirm(item)" src="https://img.icons8.com/windows/26/000000/star.png"/>
                     <img v-if="isActiveConfirm(item)" src="https://img.icons8.com/windows/32/000000/checked.png"/>
                     <img v-if="item.status === 'cancelled'" src="https://img.icons8.com/windows/32/000000/cancel.png"/>
                     <p v-if="isUnconfirm(item)" class="m-0">Mới</p>
                     <p v-if="isActiveConfirm(item)" class="m-0 text-primary">Đã xác nhận</p>
                     <p v-if="item.status === 'cancelled'" class="m-0">Huỷ</p>
                 </div>
                 <div class="phone d-flex align-items-center">
                     <img src="https://img.icons8.com/windows/32/000000/phone.png"/>
                     <p class="text-primary m-0">{{item.customer_phone}}</p>
                 </div>
                 <div class="create d-flex align-items-center">
                     <img src="https://img.icons8.com/android/24/000000/clock.png"/>
                     <p class="m-0">Tạo lúc: {{computeTime(item.createdAt)}}</p>
                 </div>
                 <div class="update d-flex align-items-center">
                     <img src="https://img.icons8.com/android/24/000000/clock.png"/>
                     <p class="m-0">Cập nhật TT: {{computeTime(item.updatedAt)}}</p>
                 </div>
                 <div class="process d-flex align-items-center">
                     <img :class="{ active: isActiveNew(item) }"
                        src="https://img.icons8.com/windows/26/000000/star.png"
                        @click="handleUpdateOrder('unconfirmed', item, ind)"/>
                     <p class="m-0" :class="{ 'text-primary': isActiveNew(item) }"
                        @click="handleUpdateOrder('unconfirmed', item, ind)">Mới</p>
                     <img src="https://img.icons8.com/ios-filled/24/000000/more-than.png"/>
                     <img :class="{ active: isActiveConfirm(item) }"
                        src="https://img.icons8.com/windows/32/000000/checked.png"
                        @click="handleUpdateOrder('confirmed', item, ind)"/>
                     <p :class="{ 'text-primary': isActiveConfirm(item) }" class="m-0"
                        @click="handleUpdateOrder('confirmed', item, ind)">Xác nhận</p>
                     <img src="https://img.icons8.com/ios-filled/24/000000/more-than.png"/>
                     <img :class="[ isActiveNew(item) ? '' : 'active' ]"
                        src="https://img.icons8.com/windows/32/000000/cancel.png"
                        @click="handleUpdateOrder('cancelled', item, ind)"/>
                     <p :class="[ isActiveNew(item) ? '' : 'text-danger' ]" class="m-0"
                        @click="handleUpdateOrder('cancelled', item, ind)">Huỷ</p>
                 </div>
             </div>
         </div>
     </div>
  </div>
</template>

<script>

import EventBus from '../EventBus.js';
import Restful from "@/services/resful.js";

const Toast = Swal.mixin({
  	toast: true,
  	position: 'top',
  	showConfirmButton: false,
 	timer: 1500,
  	timerProgressBar: false,
 	onOpen: (toast) => {
    	toast.addEventListener('mouseenter', Swal.stopTimer)
    	toast.addEventListener('mouseleave', Swal.resumeTimer)
  	},
  	width: '80vw'
})
const Toast2 = Swal.mixin({
  	toast: true,
  	position: 'top',
  	showConfirmButton: false,
 	timer: 3000,
  	timerProgressBar: false,
 	onOpen: (toast) => {
    	toast.addEventListener('mouseenter', Swal.stopTimer)
    	toast.addEventListener('mouseleave', Swal.resumeTimer)
  	},
  	width: '80vw'
})

export default {
    props: ['appToken'],
    data() {
        return {
            noteProp: '',
            basePath: 'https://ext.botup.io/v1/selling-page/',
            listOrder: []
        }
    },
    methods: {
        computeTime(timeStamp) {
            let date = new Date(timeStamp);
            return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}`;
        },
        handleClickOrder(ind, expand) {
            let el = this.$el.getElementsByClassName('order-title');
            let classList = this.$el.getElementsByClassName('order-title')[ind].classList;
            if (expand) {
                classList.add('expand');
                return;
            }
            for (let i = 0; i < el.length; ++i) {
                if (i !== ind) {
                    el[i].classList.remove('expand');
                }
            }
            for (let i = 0; i < classList.length; ++i) {
                if (classList[i] === 'expand') {
                    classList.remove('expand');
                    return;
                }
            }
            classList.add('expand');
        },
        handleClickEdit(item) {
            this.$emit('click-edit');
            EventBus.$emit('call-order', item.id);
        },
        async readOrder() {
            try {
                let path = `${this.basePath}order/order_read`;
                let params = {
                    access_token: this.appToken,
                    sort: 'createdAt'
                }
                let listOrder = await Restful.get(path, params);
                console.log('listorder', listOrder.data)
                this.listOrder = listOrder.data.data;
            } catch(e) {
                Toast2.fire({
                    icon: 'error',
                    title: 'Đã xảy ra lỗi'
                })
            }
        },
        handleUpdateOrder(status, item, ind) {
            this.updateOrder(status, item, ind)
        },
        async updateOrder(status, item, ind) {
            let path = `${this.basePath}order/order_update`;
            let body = {
                "id": item.id,
                "access_token": this.appToken,
                "status": status
            }
            let updated = await Restful.post( path, body);
            await this.readOrder();
            this.handleClickOrder(ind, true);
        },
        isActiveNew(item) {
            if (item.status !== 'cancelled') {
                return true
            }
            return false
        },
        isActiveConfirm(item) {
            if (item.status === 'confirmed') {
                return true
            }
            return false
        },
        isUnconfirm(item) {
            return (item.status !== 'confirmed' && item.status !== 'cancelled')
        }
    },
    async created() {
        try {
            if (this.appToken) {
                this.readOrder();
            }
        } catch (e) {
            console.log(e)
        }
    },
    watch: {
        appToken() {
            this.readOrder();
        }
    }
}
</script>

<style lang="scss" scoped>
    .list {
        padding: 10px;
    }
    .note {
        min-height: 100px;
        textarea {
            width: 100%;
            border: none;
            background: #eee;
            &:focus {
                box-shadow: none;
            }
        }
    }
    .order {
        border-top: 2px solid #eee;
        position: relative;
        padding-top: 20px;
        &::before {
            content: 'Đơn hàng';
            text-align: center;
            width: 100px;
            position: absolute;
            top: 0;
            left: 50%;
            transform: translate(-50%, -70%);
            background: #fff;
            font-size: 1.2rem;
            color: #999999;
        }
    }
    .order-title {
        user-select: none;
        background: #fff;
        padding: 7px;
        cursor: pointer;
        border: 2px solid #dee2e6 !important;
        transition: all 0.3s ease-out, background 0.1s;
        img {
            width: 17px;
            height: 17px;
            transform: rotate(-90deg);
            margin: 0 7px 0 15px;
            transition: transform 0.4s ease-out;
        }
        p {
            font-size: 1.2rem;
            font-weight: bold;
        }
        .edit {
            width: 17px;
            height: 17px;
            transform: rotate(360deg);
            opacity: 0;
            transition: all 0.2s;
        }
        &:hover {
            background: #eeec;
        }
        &:hover .edit {
            opacity: 1;
        }
    }
    .order-detail {
        .order-expand {
            height: 0;
            transition: height 0.25s ease-out;
            background: #fff;
            > div {
                display: none !important;
            }
            overflow: hidden;
        }
    }
    .order-title.expand,
    .order-title.confirmed {
        background: #0d6efd;
        border: 2px solid #0d6efd !important;
    }
    .order-title.expand p,
    .order-title.confirmed p {
         color: #f8f9fa !important;
     }
     .order-title.expand img:not(.edit) {
         transform: rotate(0);
     }
     .order-title.expand img,
     .order-title.confirmed img {
         filter: invert(92%) sepia(40%) saturate(6%) hue-rotate(148deg) brightness(100%) contrast(98%);
     }
    .order-title.expand + .order-expand {
        height: 150px;
        font-size: 1.1rem;
        border: 2px solid #dee2e6;
        border-top: none;
        border-radius: 0 0 .35rem .35rem;
        padding: 10px 10px 10px 22px;
        > div {
            margin-bottom: 5px;
            display: flex !important;
        }
    }
    .order-title.expand .edit {
        opacity: 1;
    }
    .order-expand {
        img {
            width: 20px;
            height: 20px;
            filter: invert(53%) sepia(0%) saturate(1296%) hue-rotate(230deg) brightness(88%) contrast(94%);
            margin-right: 7px;
        }
        .status img:first-child,
        .process img:first-child {
            position: relative;
            left: -2.5px;
        }
        .phone img {
            width: 18px;
            height: 18px;
        }
        .create img,
        .update img {
            width: 15px;
            height: 15px;
        }
        .process {
            img,
            p {
                cursor: pointer;
            }
        }
        .process img.active {
            filter: invert(31%) sepia(33%) saturate(4996%) hue-rotate(207deg) brightness(98%) contrast(103%);
        }
        .process img.active:last-of-type {
            filter: invert(33%) sepia(98%) saturate(3453%) hue-rotate(336deg) brightness(90%) contrast(92%);
        }
    }
</style>
