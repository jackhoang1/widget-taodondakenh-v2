<template>
  <div class>
    <!-- Authentication -->
    <Login
      v-if="isLogin || (!is_oauth && !overlaySign)"
      :isLogin="isLogin"
      :showLogin="showLogin"
      :hideLogin="hideLogin"
      :access_token="access_token"
      :forceRerender="forceRerender"
      @store-token="store_token = $event"
      @store-email="payload.store_email = $event"
    >
    </Login>
    <!--End Authentication -->
    <!-- header widget -->
    <div v-if="is_oauth" class="widget">
      <section class="header">
        <div class="d-flex justify-content-between">
          <p class="header__title text__second--large">Đơn hàng</p>
          <div class="cursor__pointer" @click="handleHideCreateOrder">
            <svg
              class="header__title--icon-arrow"
              :class="{ 'arrow-rorate': show_order }"
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
      <section>
        <div style="position: relative">
          <div class="create__order" v-show="show_order">
            <create-order
              :store_token="store_token"
              :payload="payload"
              :handleShowCreateOrder="handleShowCreateOrder"
              :showLogin="showLogin"
              :hideLogin="hideLogin"
              :key="componentKey"
              @platform_type="payload.platform_type = $event"
              @msg-info="getMsgInfoDraft"
            />
          </div>
        </div>
      </section>
      <!-- End Comp Create order -->
      <list-order
        :store_token="store_token"
        :payload="payload"
        :handleShowCreateOrder="handleShowCreateOrder"
        @platform="getPlatform"
      />
    </div>
  </div>
</template>

<script>
import EventBus from "./EventBus.js";
import Restful from "@/services/resful.js";
import CreateOrder from "@/components/order/Order.vue";
import ListOrder from "@/components/order/ListOrder.vue";
import Login from "@/components/login/Login.vue";
import { APICMS, APIBASE, secretKey } from "@/services/domain.js";

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
  },
  data() {
    return {
      componentKey: 0,
      isLogin: false,
      is_oauth: false,
      secretKey: secretKey,
      access_token: access_token,
      is_select: "list",

      cms_account: "",
      cms_password: "",

      overlaySign: true,
      show_list_store: false,
      list_store: [],

      store_token: "",
      payload: {
        psid: "",
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
      },
      show_order: false,
    };
  },
  async created() {
    await this.partnerAuth();
    this.testAndroid(this.access_token);
  },
  mounted() {},
  computed: {
    isSelectList() {
      return this.is_select === "list";
    },
  },
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
              this.payload.psid = customer.public_profile.fb_client_id;
            }
            if (customer.public_profile.fb_page_id) {
              this.payload.fb_page_id = customer.public_profile.fb_page_id;
            }
          }
          if (customer.conversation_chatbot) {
            this.payload.token_bbh =
              customer.conversation_chatbot.bbh_public_token;
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
              .join("");
          }
          await this.createCustomer();
          this.handleLocalStorage();
        }
      } catch (e) {
        this.overlaySign = false;
        this.is_oauth = false;
        console.log("info err", e);
      }
    },
    //get platform from comp list_order
    getPlatform(delivery_platform, payment_platform) {
      this.payload.delivery_platform = delivery_platform;
      this.payload.payment_platform = payment_platform;
    },
    getMsgInfoDraft(msg_info) {
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
    handleLocalStorage() {
      let data = JSON.parse(localStorage.getItem("order_3d_platform"));
      if (data && data.store_email) {
        this.payload.store_email = data.store_email;
      }
    },

    async createCustomer() {
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
          this.payload.customer_id = create_customer.data.data.id;
        }
      } catch (e) {
        console.log(e);
        Toast2.fire({
          icon: "error",
          title: "error api customer_find_or_create",
        });
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
  },
};
</script>

<style lang="scss">
$colorSecond: #140f2d;
$colorAccent110: #f55600;
$colorAccent: #ff5f0b;
$colorAccent70: #ff8f54;
$colorAccent30: #ffcfb6;
$colorAccent10: #fff7f3;
$colorNeutral: #4f596a;
$colorNeutral70: #848b97;
$colorNeutral38: #bcc0c6;
$colorNeutral18: #dfe1e4;
$colorNeutral5: #f6f7f8;
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
  background: #ff5f0b;
  color: #ffffff;
  height: 2rem;
  outline: none;
  border: none;
  border-radius: 16px;
  -webkit-box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
  box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
  &:hover {
    background: #ff5f0b;
    transition: transform 0.15s, background 0.15s;
    -webkit-transform: scale(1.03);
    transform: scale(1.03);
    -webkit-box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
    box-shadow: 0px 2px 10px rgba(255, 95, 11, 0.3);
  }
  &:focus {
    background: #ff5f0b;
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
.margin__left--8 {
  margin-left: 8px;
}
.margin__left--12 {
  margin-left: 12px;
}
.margin__right--5 {
  margin-right: 5px;
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
  background: $colorNeutral38;
  top: -10px;
  right: -7px;
  opacity: 1;
  border-radius: 50%;
  padding: 7px;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: pointer;
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
</style>