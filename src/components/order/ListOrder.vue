<template lang="html">
  <div class="list">
     <!-- <div class="note pb-4">
         <textarea type="text" v-model="noteProp" class="form-control rounded" placeholder="Nhập nội dung ghi chú" />
     </div> -->
     <div class="order mt-3 mb-5">
         <div class="order__text">Đơn hàng</div>
         <!-- Danh sách đơn hàng -->
         <div v-if="list_order.length == 0" style="text-align:center;padding-top:10%;">Bạn chưa có đơn hàng!</div>
         <div v-for="(item, ind) in list_order" class="order-detail" :key="ind">

             <!-- Tiêu đề đơn hàng-->
             <div class="order-title d-flex align-items-center border rounded"
                :class="{ confirmed: isActiveConfirm(item), cancelled: isCancelled(item) }"
                @click="handleClickOrder(ind)">
                 <img src="https://img.icons8.com/ios-filled/50/000000/expand-arrow.png"/>
                 <p class="text-dark m-0" >000{{ind + 1}}</p>
                 <img v-if="ableEdit(item)" class="edit ml-auto"
                    src="https://img.icons8.com/material/48/000000/edit--v1.png"
                    @click.stop="handleClickEdit(item)"/>
             </div>
             <!-- End Tiêu đề đơn hàng-->

             <!-- Đơn hàng mở rộng -->
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
                 <!-- trạng thái order > giao vận -->
                 <div>

                 </div>
                 <!-- trạng thái order > thanh toán > giao vận -->
                <div class="d-flex align-items-center" v-if="item.is_gateway">
                    <img src="@/assets/order.png"/>
                    <div>
                        <div v-if="item.payment_status=='Đã tạo đơn. Đang chờ thanh toán'">Chờ thanh toán</div>
                        <div v-if="item.payment_status=='Thanh toán thành công.'" >Đã thanh toán</div>
                    </div>
                   <div v-if="item.payment_status=='Thanh toán thành công.'&&item.delivery_status=='Có thể lên đơn giao vận'">
                        <img src="https://img.icons8.com/ios-filled/24/000000/more-than.png"/> 
                        <div  @click="createDelivery(item)">Chờ giao vận</div>
                   </div>
                    <!-- <div v-if="item.payment_status=='Đã tạo đơn. Đang chờ thanh toán'" @click="createDelivery(item)">Giao vận</div> -->
                </div>
                 <!-- Tiến trình đơn hàng -->
                 <div class="process d-flex align-items-center"
                    :class="{ 'pro-confirmed': isActiveConfirm(item), 'pro-cancelled': isCancelled(item)} ">
                     <img class="active"
                        src="https://img.icons8.com/windows/26/000000/star.png"/>
                     <p class="m-0 text-primary">Mới</p>
                     <img src="https://img.icons8.com/ios-filled/24/000000/more-than.png"/>
                     <img :class="{ active: isActiveConfirm(item) }"
                        src="https://img.icons8.com/windows/32/000000/checked.png"
                        @click="handleUpdateOrder('confirmed', item, ind)"/>
                     <p :class="{ 'text-primary': isActiveConfirm(item) }" class="m-0"
                        @click="handleUpdateOrder('confirmed', item, ind)">Xác nhận</p>
                     <img src="https://img.icons8.com/ios-filled/24/000000/more-than.png"/>
                     <img :class="{ cancelled: isCancelled(item)}"
                        src="https://img.icons8.com/windows/32/000000/cancel.png"
                        @click="handleUpdateOrder('cancelled', item, ind)"/>
                     <p class="m-0" :class="{ 'text-danger': isCancelled(item)}"
                        @click="handleUpdateOrder('cancelled', item, ind)">Huỷ</p>
                 </div>
                 <!-- End Tiến trình đơn hàng -->

             </div>
             <!-- End Đơn hàng mở rộng -->

         </div>
         <!-- End Danh sách đơn hàng -->

     </div>
     <div class="more d-flex justify-content-center" @click="handleGetMoreOrder()">
         <img src="https://img.icons8.com/ios-filled/50/000000/expand-arrow.png"/>
     </div>
  </div>
</template>

<script>
import EventBus from "@/EventBus.js";
import Restful from "@/services/resful.js";

// const APICMS = "https://ext.botup.io"; //productc
const APICMS = "http://localhost:1337"; //dev local
// const APICMS = "http://188.166.250.86:1337"; //dev

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
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
  width: "80vw",
});

export default {
  props: ["store_token", "phoneProp"],
  data() {
    return {
      //   basePath: "https://ext.botup.io/v1/selling-page/",
      list_order: [],
      list_payment: [],
      skip: 0,
      handle_api: false,
    };
  },
  async created() {
    try {
      if (!this.store_token) {
        throw "Error";
      }
      await this.readOrder();
      this.checkPhone();
      EventBus.$on("call-order", () => {
        this.readOrder();
      });
    } catch (e) {
      console.log(e);
    }
  },
  mounted() {},
  methods: {
    ableEdit(item) {
      if (
        item.platform_type === "CUSTOM" &&
        (item.status === "unconfirmed" || item.status === "")
      )
        return true;
    },
    computeTime(timeStamp) {
      let date = new Date(timeStamp);
      let time = `${
        date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
      }:${
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
      }`;
      let day = `${date.getDate()}/${date.getMonth() + 1}`;
      return time + " " + day;
    },
    handleClickOrder(ind, expand) {
      // Thay đổi class của order-title
      let el = this.$el.getElementsByClassName("order-title");
      let classList = this.$el.getElementsByClassName("order-title")[ind]
        .classList;
      if (expand) {
        classList.add("expand");
        return;
      }
      for (let i = 0; i < el.length; ++i) {
        if (i !== ind) {
          el[i].classList.remove("expand");
        }
      }
      for (let i = 0; i < classList.length; ++i) {
        if (classList[i] === "expand") {
          classList.remove("expand");
          return;
        }
      }
      classList.add("expand");
    },
    handleClickEdit(item) {
      this.$emit("click-edit");
      // Emit event để CreateOrder.vue call order detail
      EventBus.$emit("get-order", item.id);
    },
    async readOrder() {
      try {
        let path = `${APICMS}/v1/selling-page/order/order_read`;
        let params = { sort: "createdAt DESC" };
        let headers = { Authorization: this.store_token };
        console.log("111111111111111111111111111111");

        let get_list_order = await Restful.get(path, params, headers);

        console.log("get_list_order", get_list_order);
        if (get_list_order.data && get_list_order.data.data) {
          this.list_order = get_list_order.data.data;
          //   this.readPayment();
        } else {
          throw "Lỗi lấy danh sách Đơn hàng";
        }
      } catch (e) {
        console.log(e);
        if (e.data && e.data.error_message) {
          Toast2.fire({
            icon: "error",
            title: e.data.error_message,
          });
          return;
        }
        Toast2.fire({
          icon: "error",
          title: e,
        });
      }
    },
    // async readPayment() {
    //   try {
    //     let path = `${APICMS}/v1/selling-page/payment/payment_read`;
    //     let params = {};
    //     let headers = { Authorization: this.store_token };

    //     let read_payment = await Restful.get(path, params, headers);

    //     if (read_payment.data && read_payment.data.data) {
    //       this.list_payment = read_payment.data.data;
    //       this.list_payment.forEach((payment) => {
    //         this.list_order = this.list_order.map((order) => {
    //           if (order.order_id == payment.order_id) {
    //             return { ...order, payment: true, payment_info: payment };
    //           }
    //         });
    //       });
    //       console.log("list order", this.list_order);
    //     } else throw "Lỗi khi lấy thông tin thanh toán";
    //     console.log("read payment", read_payment);
    //   } catch (e) {
    //     console.log(e);
    //   }
    // },
    async createDelivery(item) {
      try {
        console.log("111111111111", item);
        if (this.handle_api) return;
        this.handle_api = true;
        if (
          item &&
          item.order_id &&
          item.other_info &&
          item.other_info.info_delivery
        ) {
          let path = `${APICMS}/v1/selling-page/delivery/delivery_create`;
          let headers = { Authorization: this.store_token };
          let body = {
            ...item.other_info.info_delivery,
            order_id: item.order_id,
          };
          console.log("body 1111111", body);
          let create_delivery = await Restful.post(path, body, {}, headers);
        }
        this.handle_api = false;
      } catch (e) {
        this.handle_api = false;
        console.log(e);
      }
    },
    handleUpdateOrder(status, item, ind) {
      this.updateOrder(status, item, ind);
    },
    async updateOrder(status, item, ind) {
      let path = `${APICMS}/v1/selling-page/order/order_update`;
      let headers = {
        Authorization: this.store_token,
      };
      let body = {
        id: item.id,
        // access_token: this.store_token,
        status: status,
      };
      let updated = await Restful.post(path, body, {}, headers);
      await this.readOrder();
      this.handleClickOrder(ind, true);
    },
    isActiveConfirm(item) {
      if (item.status === "confirmed") {
        return true;
      }
      return false;
    },
    isUnconfirm(item) {
      return item.status !== "confirmed" && item.status !== "cancelled";
    },
    isCancelled(item) {
      return item.status === "cancelled";
    },
    async handleGetMoreOrder() {
      try {
        this.skip = this.skip + 20;
        let path = `${APICMS}/v1/selling-page/order/order_read`;
        let params = {
          sort: "createdAt DESC",
          skip: this.skip,
        };
        let headers = { Authorization: this.store_token };

        let get_list_order = await Restful.get(path, params, headers);

        console.log("get_list_order", get_list_order.data);
        if (get_list_order.data && get_list_order.data.data) {
          if (!get_list_order.data.data.length) {
            Toast2.fire({
              icon: "success",
              title: "Đã hiển thị tất cả đơn hàng",
            });
            return;
          }
          this.list_order = this.list_order.concat(get_list_order.data.data);
        } else {
          throw "Lỗi lấy danh sách Đơn hàng";
        }
      } catch (e) {
        if (e.data && e.data.error_message) {
          Toast2.fire({
            icon: "error",
            title: e.data.error_message,
          });
          return;
        }
        Toast2.fire({
          icon: "error",
          title: e,
        });
      }
    },
    checkPhone() {
      let order = this.list_order.slice(0, 19);
      if (!this.phoneProp) return;
      let check = order.find((item) => {
        return item.customer_phone === this.phoneProp;
      });
      if (!check) {
        if (localStorage.getItem("cus_phone") === this.phoneProp) {
          check = true;
        }
      }
      if (!check) {
        localStorage.setItem("cus_phone", this.phoneProp);
        EventBus.$emit("create-empty-order");
      }
    },
  },
  beforeDestroy() {
    EventBus.$off("call-order");
  },
  watch: {
    store_token() {
      this.readOrder();
    },
    phoneProp() {
      console.log("run watch");
      this.checkPhone();
    },
  },
};
</script>

<style lang="scss" scoped>
$colorConfirm: #348458;
$colorCancel: #ed5a29;

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
  padding-top: 1rem;
  .order__text {
    // content: 'Đơn hàng';
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
.order-title-payment {
  background: #fff;
}
.order-title {
  user-select: none;
  background: #fff;
  padding: 2px;
  cursor: pointer;
  border: 2px solid #dee2e6 !important;
  transition: all 0.3s ease-out, background 0.1s;
  img {
    width: 10px;
    height: 10px;
    transform: rotate(-90deg);
    margin: 0 7px 0 15px;
    transition: transform 0.4s ease-out;
  }
  p {
    font-size: 0.9rem;
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
    transition: transform 0.15s, background 0.15s;
    -webkit-transform: scale(1.03);
    transform: scale(1.03);
    -webkit-box-shadow: 0px 1px 3px rgba(126, 142, 177, 0.2);
    box-shadow: 0px 1px 3px rgba(126, 142, 177, 0.2);
  }
  &:hover .edit {
    opacity: 1;
  }
}
.order-detail {
  margin-top: 0.5rem;
  font-size: 0.9rem;
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
.order-title.gateway_success {
  background: #3a3d42;
  border: 2px solid #3a3d42 !important;
}
.order-title.gateway_pendding {
  background: hsl(49, 35%, 43%);
  border: 2px solid hsl(49, 35%, 43%) !important;
}
.order-title.cod_success {
  background: hsl(49, 35%, 43%);
  border: 2px solid hsl(49, 35%, 43%) !important;
}
.order-title.cod_pendding {
  background: hsl(49, 35%, 43%);
  border: 2px solid hsl(49, 35%, 43%) !important;
}
.order-title.expand {
  background: #a3a3a3;
  border: 2px solid #a3a3a3 !important;
}
.order-title.confirmed {
  background: #025fe8;
  border: 2px solid #025fe8 !important;
}
.order-title.cancelled {
  background: #dc3545;
  border: 2px solid #dc3545 !important;
}
.order-title.expand p,
.order-title.confirmed p,
.order-title.cancelled p {
  color: #f8f9fa !important;
}
.order-title.expand img:not(.edit) {
  transform: rotate(0);
}
.order-title.expand img,
.order-title.confirmed img,
.order-title.cancelled img {
  filter: invert(92%) sepia(40%) saturate(6%) hue-rotate(148deg)
    brightness(100%) contrast(98%);
}
.order-title.expand + .order-expand {
  height: 150px;
  font-size: 0.9rem;
  border: 2px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 0.35rem 0.35rem;
  padding: 5px 10px 5px 30px;
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
    filter: invert(53%) sepia(0%) saturate(1296%) hue-rotate(230deg)
      brightness(88%) contrast(94%);
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
    user-select: none;
    img,
    p {
      cursor: pointer;
    }
    img.active {
      filter: invert(31%) sepia(33%) saturate(4996%) hue-rotate(207deg)
        brightness(98%) contrast(103%);
    }
    img.cancelled {
      filter: invert(28%) sepia(66%) saturate(2417%) hue-rotate(334deg)
        brightness(90%) contrast(91%);
    }
    &.pro-confirmed *,
    &.pro-cancelled * {
      pointer-events: none;
    }
    &.pro-confirmed p:first-of-type,
    &.pro-cancelled p:first-of-type {
      color: #212529 !important;
    }
    &.pro-confirmed img:first-of-type,
    &.pro-cancelled img:first-of-type {
      filter: none;
    }
  }
}
.more {
  position: fixed;
  bottom: 0;
  padding-bottom: 10px;
  background: #fff;
  left: 0;
  right: 0;
  cursor: pointer;
  img {
    width: 30px;
    height: 20px;
    opacity: 0.6;
  }
}
</style>
