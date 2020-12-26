<template>
  <div class>
    <!-- Authentication -->
    <Login
      v-if="isLogin || (!is_oauth && !overlaySign)"
      :isLogin="isLogin"
      :showLogin="showLogin"
      :hideLogin="hideLogin"
      :readSetting="readSetting"
      :updateSetting="updateSetting"
      :access_token="access_token"
      :forceRerender="forceRerender"
      @store-token="store_token = $event"
      @fb-page-id="payload.fb_page_id = $event"
    >
    </Login>
    <!--End Authentication -->
    <!-- header widget -->
    <div v-if="is_oauth" class="widget">
      <section class="header">
        <div class="d-flex justify-content-between">
          <p class="header__title text__second--large">Đơn hàng</p>
          <div class="cursor__pointer" @click="handleListShort">
            <svg
              class="header__title--icon-arrow"
              :class="{ 'arrow-rorate': is_short }"
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 7L7 1L1 7"
                stroke="#140F2D"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div
          class="margin__bottom--8 d-flex justify-content-between align-items-center"
        >
          <div class="d-flex align-items-center">
            <div
              class="margin__right--12 icon__add--cursor d-flex align-items-center"
              @click="handleShowCreateOrder"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19"
                  stroke="#FF5F0B"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M5 12H19"
                  stroke="#FF5F0B"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <p
              class="text__accent--medium cursor__pointer"
              @click="handleShowCreateOrder"
            >
              Tạo đơn hàng mới
            </p>
          </div>

          <div tag="_blank">
            <a
              class="text__accent--medium text__decoration--none"
              href="https://cms.botup.io/"
              target="_blank"
              >[Mở CMS]</a
            >
          </div>
        </div>
      </section>
      <!-- End header widget -->
      <!-- Comp Create order -->
      <div class="modal" v-if="show_order">
        <div class="modal__content">
          <div class="close" @click="handleHideCreateOrder">
            <img src="@/assets/close1.png" alt="" />
          </div>
          <div>
            <CreateOrder
              ref="createOrder"
              :store_token="store_token"
              :dataInit="dataInit"
              :payload="payload"
              :handleShowCreateOrder="handleShowCreateOrder"
              :showLogin="showLogin"
              :hideLogin="hideLogin"
              :readSetting="readSetting"
              :updateSetting="updateSetting"
              :key="componentKey"
              @platform_type="payload.platform_type = $event"
              @msg-info="getMsgInfoDraft"
              @customer-id="getCustomerId"
              @init-Data-When-Destroy-Comp-Order="getInitData"
            />
          </div>
        </div>
      </div>
      <!-- End Comp Create order -->
      <!-- Comp list Order -->
      <ListOrder
        ref="listOrder"
        :store_token="store_token"
        :payload="payload"
        :handleShowCreateOrder="handleShowCreateOrder"
        :readSetting="readSetting"
        :updateSetting="updateSetting"
        :key="componentKey"
        @platform="getPlatform"
      />
      <!-- end list order -->
      <!-- comp edit order -->
      <!-- <div class="modal" v-show="showEditOrder">
        <div class="modal__content">
          <div class="close" @click="handleHideEditOrder">
            <img src="@/assets/close1.png" alt="" />
          </div>
          <div>
            <EditOrder />
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import EventBus from "./EventBus.js";
import Restful from "@/services/resful.js";
import CreateOrder from "@/components/order/Order.vue";
import ListOrder from "@/components/order/ListOrder.vue";
// import EditOrder from "@/components/editOrder/EditOrder.vue";
import Login from "@/components/login/Login.vue";
import { APICMS, APIBASE, APISETTING, secretKey } from "@/services/constant.js";

let urlString = location.href;
let url = new URL(urlString);
let access_token = url.searchParams.get("access_token");

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
  components: {
    ListOrder,
    CreateOrder,
    Login,
    // EditOrder,
  },
  data() {
    return {
      componentKey: 0,
      componentCreateOrderKey: 0,
      isLogin: false,
      is_oauth: false,
      secretKey: secretKey,
      access_token: access_token,

      cms_account: "",
      cms_password: "",

      overlaySign: true,
      show_list_store: false,
      list_store: [],

      store_token: "",
      dataInit: {
        customer_id: "",
        psid: "",
        token_bbh: "",
      },
      payload: {
        psid: "",
        asid: "",
        fb_staff_name: "",
        fb_page_id: "",
        token_bbh: "",
        delivery_platform: "",
        payment_platform: "",
        platform_type: "",
        name: "",
        phone: "",
        email: "",
        customer_id: "",
        store_email: "",
        setting: "",
      },
      show_order: false,
      is_short: false,
    };
  },
  async created() {
    try {
      await this.partnerAuth();
      this.readSetting();
      this.testAndroid(this.access_token);
    } catch (e) {
      console.log(e);
    }
  },
  mounted() {},
  computed: {},
  methods: {
    forceRerender() {
      this.componentKey += 1;
      this.isLogin = false;
    },
    testAndroid(toast) {
      var ua = navigator.userAgent.toLowerCase();
      var isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
      if (isAndroid) {
        Android.showToast(toast);
      }
    },
    async partnerAuth() {
      try {
        let body = {
          access_token: this.access_token,
          secret_key: this.secretKey,
        };

        let get_customer_info = await Restful.post(
          `${APIBASE}/v1/service/partner-authenticate`,
          body
        );
        if (
          get_customer_info &&
          get_customer_info.data &&
          get_customer_info.data.data
        ) {
          this.is_oauth = true;
          let customer = get_customer_info.data.data;
          if (customer.public_profile) {
            if (customer.public_profile.token_partner) {
              this.store_token = customer.public_profile.token_partner;
            }
            if (customer.public_profile.client_name) {
              this.payload.name = customer.public_profile.client_name;
            }
            if (customer.public_profile.fb_client_id) {
              let psid = customer.public_profile.fb_client_id;

              this.payload.psid = psid;
              this.dataInit.psid = psid;
            }
            if (customer.public_profile.fb_page_id) {
              this.payload.fb_page_id = customer.public_profile.fb_page_id;
            }
            if (customer.public_profile.current_staff_id) {
              this.payload.asid = customer.public_profile.current_staff_id;
            }
            if (customer.public_profile.current_staff_name) {
              this.payload.fb_staff_name =
                customer.public_profile.current_staff_name;
            }
          }
          if (customer.conversation_chatbot) {
            let token_bbh = customer.conversation_chatbot.bbh_public_token;

            this.payload.token_bbh = token_bbh;
            this.dataInit.token_bbh = token_bbh;
          }
          if (
            customer.conversation_contact &&
            customer.conversation_contact.client_email
          ) {
            this.payload.email = customer.conversation_contact.client_email;
          }
          if (
            customer.conversation_contact &&
            customer.conversation_contact.client_phone
          ) {
            this.payload.phone = customer.conversation_contact.client_phone
              .split(".")
              .join("")
              .split(" ")
              .join("")
              .split("+84")
              .join("0");
          }
          this.createCustomer();
        }
      } catch (e) {
        this.overlaySign = false;
        this.is_oauth = false;
        console.log("info err", e);
      }
    },
    getPlatform(delivery_platform, payment_platform) {
      // * lấy thông tin platform từ emit comp order
      this.payload.delivery_platform = delivery_platform;
      this.payload.payment_platform = payment_platform;
    },
    getMsgInfoDraft(msg_info) {
      // * lấy thông tin sendmes từ emit comp order
      if (msg_info) {
        this.payload.psid = msg_info.psid;
        this.payload.token_bbh = msg_info.token_bbh;
        return;
      }
      Toast2.fire({
        icon: "error",
        title: "Không có thông tin msg_info",
      });
    },
    getCustomerId(customerId) {
      // * lấy thông tin customer_id từ emit comp order
      if (customerId) {
        this.payload.customer_id = customerId;
        return;
      }
      Toast2.fire({
        icon: "error",
        title: "Không có thông tin customer_id",
      });
    },
    getInitData(data) {
      if (data) {
        this.payload.customer_id = data.customer_id;
        this.payload.psid = data.psid;
        this.payload.token_bbh = data.token_bbh;
      }
    },
    async createCustomer() {
      // * tìm kiếm và tạo thông tin khách hàng
      try {
        let path = `${APICMS}/v1/selling-page/customer/customer_find_or_create`;
        let headers = { Authorization: this.store_token };
        let body = {
          fb_page_id: this.payload.fb_page_id,
          fb_client_id: this.payload.psid,
          full_name: this.payload.name,
          phone: this.payload.phone,
          email: this.payload.email,
        };

        let create_customer = await Restful.post(path, body, null, headers);

        if (
          create_customer &&
          create_customer.data &&
          create_customer.data.data &&
          create_customer.data.data.id
        ) {
          let id = create_customer.data.data.id;
          this.payload.customer_id = id;
          this.dataInit.customer_id = id;
        }
      } catch (e) {
        console.log(e);
        Toast2.fire({
          icon: "error",
          title: "error api customer_find_or_create",
        });
      }
    },
    async createSetting() {
      try {
        let fb_page_id = this.payload.fb_page_id;
        let asid = this.payload.asid;
        if (!fb_page_id || !asid) return;

        let path = `${APISETTING}/v1/setting/WidgetSetting/create_setting`;
        let body = {
          fb_page_id,
          asid,
          secret_key: secretKey,
          setting_data: "",
        };

        let create_setting = await Restful.post(path, body, null, null);
      } catch (e) {
        console.log("Error ::: create setting failed", e);
      }
    },
    async readSetting() {
      try {
        let fb_page_id = this.payload.fb_page_id;

        if (!fb_page_id) return;

        let path = `${APISETTING}/v1/setting/WidgetSetting/read_setting`;
        let body = {
          fb_page_id,
          secret_key: secretKey,
        };

        let read_setting = await Restful.post(path, body, null, null);

        if (read_setting && read_setting.data && read_setting.data.data) {
          let setting = read_setting.data.data;
          if (setting.length === 0) {
            await this.createSetting();
            return;
          }
          this.payload.setting = setting[0];
        }
      } catch (e) {
        console.log("Error ::: read setting failed", e);
      }
    },
    async updateSetting(name, data) {
      try {
        if (
          !this.payload.setting.id ||
          !data ||
          (name !== "store_email" &&
            name !== "client_id" &&
            name !== "msg_content" &&
            name !== "filter_order")
        )
          return;

        let setting_data = { ...this.payload.setting.setting_data };

        switch (name) {
          case "store_email":
            setting_data.store_email = data.email;
            break;
          case "client_id":
            setting_data.client_id = data.client_id;
            break;
          case "msg_content":
            setting_data.msg_content = data.msg_content;
            break;
          case "filter_order":
            setting_data.filter_order = data.filter_order;
            break;
          default:
            console.log("Error ::: name is update not found");
            break;
        }
        let path = `${APISETTING}/v1/setting/WidgetSetting/update_setting`;
        let body = {
          id: this.payload.setting.id,
          setting_data: setting_data,
        };

        let update_setting = await Restful.post(path, body, null, null);
      } catch (e) {
        console.log(e);
      }
    },
    async delete_setting() {
      try {
        let path = `${APISETTING}/v1/setting/WidgetSetting/delete_setting`;
        let body = {
          fb_page_id: this.payload.fb_page_id,
        };

        let delete_setting = await Restful.post(path, body, null, null);
      } catch (e) {
        console.log(e);
      }
    },
    showLogin() {
      console.log("isLogin");
      this.isLogin = true;
    },
    hideLogin() {
      this.isLogin = false;
    },
    async handleShowCreateOrder() {
      this.show_order = !this.show_order;
    },
    handleHideCreateOrder() {
      this.show_order = false;
    },
    handleListShort() {
      if (this.$refs.listOrder && this.$refs.listOrder.handleListShort)
        this.$refs.listOrder.handleListShort();
      this.is_short = !this.is_short;
    },
  },
};
</script>

<style lang="scss">
@mixin tooltip-position {
  visibility: hidden;
  min-width: 6rem;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 0.3rem 0.3rem;
  position: absolute;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s;
}
@mixin tooltip-position-after {
  content: "";
  position: absolute;
  border-width: 5px;
  border-style: solid;
}
@mixin imageSelect {
  background: url(./assets/arrow.svg) no-repeat right #fff !important;
  background-position-x: 98% !important;
  background-size: 20px;
}

* {
  font-size: 14px;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
    Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji,
    Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  hr {
    opacity: 0.3;
    margin: 1rem 0 1rem 0;
  }
  &::-webkit-scrollbar {
    display: none;
  }
}
/* --------------- */
.widget {
  padding: 18px 0;
  position: relative;
  .header {
    padding: 0 25px 0 20px;
    user-select: none;
    .header__title {
      margin-bottom: 8px;
    }
    .header__title--icon-arrow {
      transition: transform 0.25s ease-out;
      transform: rotate(0);
    }
    .arrow-rorate {
      transition: transform 0.25s ease-out !important;
      transform: rotate(180deg) !important;
    }
  }
  .create__order {
    position: absolute;
    z-index: 2;
    background: #fff;
    top: 0;
    border: 1px solid #f6f7f8;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    margin: 0 10px;
  }
}
.all__text--decoration {
  text-align: center;
  width: 100px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -70%);
  background: #fff;
  color: #777777;
}
.btn-pill {
  font-size: 12px;
  line-height: 20px;
  background: $colorAccent;
  color: #ffffff;
  height: 2rem;
  outline: none;
  border: none;
  border-radius: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
  box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
  &:hover {
    background: $colorAccent;
    transition: transform 0.15s, background 0.15s;
    -webkit-transform: scale(1.03);
    transform: scale(1.03);
    -webkit-box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
    box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
  }
  &:focus {
    background: $colorAccent;
    transition: transform 0.15s, background 0.15s;
    -webkit-transform: scale(1.03);
    transform: scale(1.03);
    -webkit-box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
    box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
  }
}
.form-control-sm {
  height: 32px;
  width: 100%;
  padding: 4px 12px;
  color: #000000;
  font-size: 14px;
  line-height: 22px;
  border: 1px solid #dfe1e4;
  border-radius: 4px;
  appearance: none;
  background: #fff;
  background-clip: padding-box;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  option {
    background: #ffffff;
  }
  &:focus {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
    background: #fff;
    outline: none;
    // border: none;
  }
}
.tooltip {
  position: relative;
  display: inline-block;
  // border-bottom: 1px dotted black;
  .tooltip-nowrap {
    white-space: nowrap;
  }
  .tooltip-medium {
    min-width: 10rem !important;
  }
  .tooltip-top {
    @include tooltip-position;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    &::after {
      @include tooltip-position-after;
      top: 100%;
      left: 50%;
      margin-left: -0.5rem;
      border-color: #555 transparent transparent transparent;
    }
  }
  .tooltip-bottom {
    @include tooltip-position;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    &::after {
      @include tooltip-position-after;
      bottom: 100%;
      left: 50%;
      margin-left: -0.5rem;
      border-color: transparent transparent #555 transparent;
    }
  }
  .tooltip-right {
    @include tooltip-position;
    top: 0;
    left: 125%;
    font-size: 12px;
    &::after {
      top: 50%;
      right: 100%;
      margin-top: -0.5rem;
      border-color: transparent #555 transparent transparent;
    }
  }
  .tooltip-left {
    @include tooltip-position;
    top: 0;
    bottom: auto;
    right: 128%;
    font-size: 12px;
    &::after {
      @include tooltip-position-after;
      top: 50%;
      left: 100%;
      margin-top: -0.5rem;
      border-color: transparent transparent transparent #555;
    }
  }
  &:hover {
    .tooltip-left,
    .tooltip-right,
    .tooltip-top,
    .tooltip-bottom {
      visibility: visible;
      opacity: 1;
    }
  }
}
.validate-failed {
  border: 1px solid red !important;
}
.validate-failed-address {
  // margin-bottom: 1rem !important;
  padding: 0 !important;
  margin-left: 5px !important;
  margin-right: 5px !important;
  border-radius: 4px !important;
  border: 1px solid red !important;
}
select {
  @include imageSelect;
}
.text__accent--medium {
  font-size: 14px;
  line-height: 22px;
  color: $colorAccent;
}
.text__second--large {
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  color: $colorSecond;
}
.text__second--medium {
  color: $colorSecond;
  font-size: 14px;
  line-height: 22px;
}
.text__neutral--medium {
  color: $colorNeutral;
  font-size: 14px;
  line-height: 22px;
}
.text__neutral70--medium {
  color: $colorNeutral70;
  font-size: 14px;
  line-height: 22px;
}
.text__neutral38--medium {
  color: $colorNeutral38;
  font-size: 14px;
  line-height: 22px;
}
.text__neutral {
  color: $colorNeutral70;
  font-size: 12px;
  line-height: 20px;
}
.icon__add--cursor {
  cursor: pointer;
  &:hover {
    // transform: scale(1.1);
    border-radius: 50%;
    background: $colorNeutral18;
  }
}
.cursor__pointer {
  cursor: pointer;
}
.padding__left--8 {
  padding-left: 8px;
}
.padding__right--18 {
  padding-right: 18px;
}
.padding__right--12 {
  padding-right: 12px;
}
.padding__bottom--12 {
  padding-bottom: 12px;
}
.margin__left--8 {
  margin-left: 8px;
}
.margin__left--12 {
  margin-left: 12px;
}
.margin__right--5 {
  margin-right: 5px;
}
.margin__right--8 {
  margin-right: 8px;
}
.margin__right--12 {
  margin-right: 12px;
}
.margin__right--18 {
  margin-right: 18px;
}
.margin__bottom--8 {
  margin-bottom: 8px;
}
.margin__bottom--12 {
  margin-bottom: 12px;
}
.margin__bottom--13 {
  margin-bottom: 13px;
}
.font__weight--600 {
  font-weight: 600;
}
.margin__top--17 {
  margin-top: 17px;
}
.margin__top--15 {
  margin-top: 15px;
}
.margin__top--11 {
  margin-top: 11px;
}
.margin__top--9 {
  margin-top: 9px;
}
.margin__y--8 {
  margin: 8px 0;
}
.margin__y--15 {
  margin: 15px 0;
}
.text__decoration--none {
  text-decoration: none;
}
.hover-scale {
  &:hover {
    transform: scale(1.1);
  }
}
.close {
  position: absolute;
  z-index: 999;
  background: $colorNeutral38;
  top: -10px;
  right: -7px;
  opacity: 1;
  border-radius: 50%;
  padding: 7px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover {
    opacity: 1 !important;
    transform: scale(1.1);
  }
  &:focus {
    outline: none;
  }
  img {
    width: 6px;
    height: 6px;
  }
}
input[type="radio"] {
  display: none;
}

input[type="radio"] + label {
  // color:#f2f2f2;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

input[type="radio"] + label span {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin: -1px 12px 0 0;
  vertical-align: middle;
  background: url(./assets/radio.svg) no-repeat;
  cursor: pointer;
}

input[type="radio"]:checked + label span {
  background: url(./assets/radio_checked.svg) no-repeat;
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"] + label {
  // color:#f2f2f2;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

input[type="checkbox"] + label span {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin: 1px 8px 0 0;
  vertical-align: middle;
  background: url(./assets/checkbox.svg) no-repeat;
  cursor: pointer;
}

input[type="checkbox"]:checked + label span {
  background: url(./assets/checkbox_checked.svg) no-repeat;
}
// #create-order {
//   position: absolute;
//   top: 0;
//   background: black;
//   z-index: 9;
// }

.modal {
  position: absolute;
  top: 0;
  padding: 40px 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.7);
  min-height: 100%;
  width: 100%;
  .modal__btn--close {
    text-align: right;
    img {
      height: 20px;
      width: 20px;
      &:hover {
        cursor: pointer;
      }
    }
  }
  .modal__content {
    background: #ffffff;
    position: relative;
    border-radius: 8px;
    margin: 0 9px;
  }
  .modal__msg {
    position: relative;
    background: #ffffff;
    color: #000000;
    width: 100%;
    margin: 9px;
    padding: 0 12px 20px;
    border-radius: 4px;
  }
}
</style>