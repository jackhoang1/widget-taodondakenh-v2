<template>
  <div class>
    <!-- Xác thực App -->
    <div v-if="!is_oauth" class="auth">
      <div v-if="!show_list_store" class="sign d-flex flex-column align-items-center">
        <p class="text-dark mb-5">Đăng Nhập CMS</p>
        <input v-model="cms_account" type="text" class="form-control mb-3" placeholder="Email" />
        <input
          v-model="cms_password"
          type="password"
          class="form-control mb-3"
          placeholder="Password"
        />
        <button class="btn btn-primary text-light" v-on:click="runSignIn()">Sign In</button>
      </div>
      <div :class="['select-store', 'mb-5', {'show-store': show_list_store}]">
        <div v-if="show_list_store">
          <p class="text-center mb-5">Danh sách Store</p>
          <div
            v-for="(item, ind) in list_store"
            class="store"
            @click="handleChooseStore(item)"
            :key="ind"
          >{{ item.store_name }}</div>
        </div>
      </div>
      <div v-if="overlaySign" class="overlay"></div>
    </div>
    <!--End Xác thực App -->

    <div v-if="is_oauth&&!is_warning" class="widget">
      <div class="d-flex header border-bottom">
        <div
          class="list-order flex-grow-1 text-center py-2"
          :class="{'select': isSelectList}"
          @click="handleClickHeader('list')"
        >Thông tin</div>
        <div
          class="create-order flex-grow-1 text-center py-2"
          :class="[isSelectList ? '' : 'select']"
          @click="handleClickHeader('create')"
        >Tạo đơn</div>
      </div>
      <list-order
        v-show="is_select === 'list'"
        :store_token="store_token"
        :phoneProp="payload.phone"
        @click-edit="handleClickHeader('create')"
      />
      <create-order
        v-show="is_select === 'create'"
        :store_token="store_token"
        :payload="payload"
        @switch-header="handleClickHeader('list')"
      />
    </div>
    <!-- warning -->
    <div v-if="is_oauth&&is_warning" class="auth__warning">
      <div class="auth__activate">
        <div class="text-center">
          <img src="@/assets/error.png" alt />
        </div>
        <p class="mb-0">Xin vui lòng kích hoạt lại ứng dụng</p>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from "./EventBus.js";
import Restful from "@/services/resful.js";
import CreateOrder from "@/components/order/Order.vue";
import ListOrder from "@/components/order/ListOrder.vue";

let urlString = location.href;
let url = new URL(urlString);
let access_token = url.searchParams.get("access_token");

// const APICMS = "http://localhost:1337"; //dev
const APICMS = "https://devbbh.tk"; //dev
// const APICMS = "https://ext.botup.io"; //product

// const ApiBase = "https://app.devchatbox.tk"; //dev
const ApiBase = "https://chatbox-app.botbanhang.vn"; //product

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
  },
  data() {
    return {
      is_oauth: false,
      is_warning: false,
      // secretKey: '2dd3816056a04c70ad154d3943bb16bd', //product
        secretKey: "2218ef13a45c4fd9ade2d049db2ef6f1", //demo-product
      // secretKey: "f5ca4cd874a6427e83ed0441e61355ab", //demo-product-local
    //   secretKey: "6e6d71d51a234aec9cde5f7748dd9e78", //dev-local
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
    };
  },
  async created() {
    await this.partnerAuth();
  },
  computed: {
    isSelectList() {
      return this.is_select === "list";
    },
  },
  methods: {
    async partnerAuth() {
      try {
        console.log("creeeee apppp");
        let body = {
          access_token: this.access_token,
          secret_key: this.secretKey,
        };

        let get_customer_info = await Restful.post(
          `${ApiBase}/v1/service/partner-authenticate`,
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
          console.log("info cus", get_customer_info);
        }
      } catch (error) {
        // Chạy vào SignIn
        this.overlaySign = false;
        this.is_oauth = false;
        console.log("info err", error);
      }
    },
    async runSignIn() {
      try {
        // Call Api Đăng nhập CMS
        let path = "https://api.botup.io/v1/auth/sign-in";
        let body = {
          email: this.cms_account,
          password: this.cms_password,
        };

        let sign_in = await Restful.post(path, body);

        let user = {};
        if (sign_in.data && sign_in.data.data && sign_in.data.data.user) {
          user = sign_in.data.data.user;
        } else {
          throw "Đăng nhập thất bại";
        }
        let { email, first_name, last_name, id, role } = user;
        path = `${APICMS}/v1/users/users/singinbotup`;
        body = {
          username: id,
          email,
          first_name,
          last_name,
          role,
        };

        // Call Api Đăng nhập Botup
        let cms_signin = await Restful.post(path, body);
        console.log("singin botup", cms_signin.data);

        // Lấy danh sách Store
        path = `${APICMS}/v1/selling-page/store/store_read`;
        let params = {};
        if (
          cms_signin.data &&
          cms_signin.data.data &&
          cms_signin.data.data.user &&
          cms_signin.data.data.user.id
        ) {
          params = {
            owner_id: cms_signin.data.data.user.id,
          };
        } else {
          throw "Đăng nhập thất bại";
        }

        let read_store = await Restful.get(path, params);

        console.log("store", read_store.data);
        if (read_store.data && read_store.data.data) {
          this.list_store = read_store.data.data;
          this.show_list_store = true;
        } else {
          throw "Lỗi khi lấy danh sách Store";
        }
      } catch (e) {
        console.log("error", e);
        if (e.data.message) {
          Toast2.fire({
            icon: "error",
            title: e.data.message,
          });
          return;
        }
        Toast2.fire({
          icon: "error",
          title: e,
        });
      }
    },
    handleLocalStorage() {
      let order_3d_platform = JSON.parse(
        localStorage.getItem("order_3d_platform")
      );
      if (!order_3d_platform) return (this.is_warning = true);
      if (
        order_3d_platform.delivery_platform == "VIETTELPOST" ||
        order_3d_platform.delivery_platform == "GHN" ||
        order_3d_platform.delivery_platform == "GHTK"
      ) {
        this.payload.delivery_platform = order_3d_platform.delivery_platform;
      }
      if (order_3d_platform.payment_platform == "ALEPAY") {
        this.payload.payment_platform = order_3d_platform.payment_platform;
      }
      if (
        order_3d_platform.platform_type == "HARAVAN" ||
        order_3d_platform.platform_type == "MISA" ||
        order_3d_platform.platform_type == "NHANH.VN" ||
        order_3d_platform.platform_type == "KIOTVIET" ||
        order_3d_platform.platform_type == "SAPO" ||
        order_3d_platform.platform_type == "CUSTOM"
      ) {
        this.payload.platform_type = order_3d_platform.platform_type;
      }
      if (order_3d_platform.store_email) {
        this.payload.store_email = order_3d_platform.store_email;
      }
    },
    handleChooseStore(item) {
      this.store_token = item.access_token;
      localStorage.removeItem("order_3d_platform");
      let order_3d_platform = {};
      if (item.delivery_platform) {
        this.payload.delivery_platform = item.delivery_platform;
        order_3d_platform["delivery_platform"] = item.delivery_platform;
      }
      if (item.payment_platform) {
        this.payload.payment_platform = item.payment_platform;
        order_3d_platform["payment_platform"] = item.payment_platform;
      }
      if (item.platform_type) {
        this.payload.platform_type = item.platform_type;
        order_3d_platform["platform_type"] = item.platform_type;
      }
      if (item.store_email) {
        this.payload.store_email = item.store_email;
        order_3d_platform["store_email"] = item.store_email;
      }
      localStorage.setItem(
        "order_3d_platform",
        JSON.stringify(order_3d_platform)
      );
      this.runOAuth();
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
          create_customer.data &&
          create_customer.data.data &&
          create_customer.data.data.id
        ) {
          this.payload.customer_id = create_customer.data.data.id;
          console.log("this.payload.customer_id", this.payload.customer_id);
        }
      } catch (e) {
        console.log(e);
        Toast2.fire({
          icon: "error",
          title: "error api customer_find_or_create",
        });
      }
    },
    async runOAuth() {
      try {
        // Call Api xác thực khi chọn Store và lưu lại Token
        let body = {
          _type: "oauth-access-token",
          access_token: this.access_token,
          token_partner: this.store_token,
        };
        // Xác thực Widget
        let oauth = await Restful.post(
          `${ApiBase}/v1/app/app-installed/update`,
          body
        );
        Toast2.fire({
          icon: "success",
          title: "Xác thực thành công",
        });
        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (e) {
        console.log(e);
        if (
          e.data &&
          e.data.message &&
          e.data.message.message == "jwt expired"
        ) {
          return Toast2.fire({
            icon: "error",
            title: "Vui lòng tải lại trang và kích hoạt lại!",
          });
        }
        Toast2.fire({
          icon: "error",
          title: "Xác thực không thành công",
        });
      }
    },
    handleClickHeader(ele) {
      this.is_select = ele;
      if (ele === "list") {
        EventBus.$emit("disable-update-order");
      }
    },
  },
};
</script>

<style lang="scss">
@mixin tooltip-position {
  visibility: hidden;
  width: 12rem;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 0.5rem 0.3rem;
  position: absolute;
  z-index: 1;
  margin-left: -6rem;
  opacity: 0;
  transition: opacity 0.3s;
}
@mixin tooltip-position-after {
  content: "";
  position: absolute;
  border-width: 5px;
  border-style: solid;
}
* {
  font-size: 13px;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  input,
  textarea,
  select {
    border: none !important;
    border-radius: 1rem !important;
    padding: 0.25rem 1rem !important;
  }
  hr {
    opacity: 0.5;
    margin: 1rem 0 1rem 0;
  }
  //   input,
  //   textarea {
  //     border-radius: 1rem;
  //     padding: 0 1rem;
  //   }
  &::-webkit-scrollbar {
    display: none;
  }
}
body {
  margin: 0;
  font-family: var(--bs-font-sans-serif);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

// .disable-scroll {
//   overflow: hidden;
//   height: 100vh;
// }
// p {
//   margin-top: 0;
//   margin-bottom: 1rem;
// }
// button {
//   border-radius: 0;
// }
// hr {
//   opacity: 0.5;
// }
// button:focus {
//   outline: 1px dotted;
//   outline: 5px auto -webkit-focus-ring-color;
// }

/* Auth ---- */
.auth {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem;
  top: 12%;
  width: 100%;
  z-index: 999;
  p {
    font-size: 1.6rem;
    font-weight: bold;
  }
  .sign {
    width: 100%;
    input {
      width: 100%;
      height: 35px;
      background: #eeeeee;
    }
    button {
      font-weight: bold;
      box-shadow: 0 5px 15px 0 #007bff30;
      transition: all 0.5s;
      border-radius: 25px;
      padding: 0.5rem 3.5rem;
      margin-top: 1.5rem;
      &:hover {
        background: #007bff;
        box-shadow: 0 5px 20px 0 #007bff30;
      }
      &:focus {
        box-shadow: 0 5px 20px 0 #007bff30 !important;
        background: #007bff !important;
      }
    }
  }
  .select-store {
    width: 100%;
    opacity: 0;
    height: 0;
    transition: all 0.4s ease-out 0.2s;
    .store {
      cursor: pointer;
      text-align: center;
      padding: 1rem 1rem;
      border: 2px solid #0001;
      border-radius: 5px;
      font-weight: bold;
      border-bottom: none;
      background: #fff;
      transition: transform 0.2s ease-out, border-bottom 0s,
        background 0.7s ease-out;
      &:hover {
        transform: translateY(-5px) scale(1.03);
        border-bottom: 2px solid #0001;
        background: #ddd;
      }
      &:active {
        transform: translateY(-3px);
      }
    }
    .store:last-child {
      border-bottom: 2px solid #0001;
    }
  }
  .show-store {
    height: initial;
    opacity: 1;
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;
  }
}

@media screen and (min-width: 400px) {
  .auth {
    width: 70%;
  }
  .auth p {
    font-size: 1.9rem;
  }
}

/* --------------- */

.widget .header {
  cursor: pointer;
  user-select: none;
}
.widget .header > div {
  font-weight: bold;
  font-size: 1rem;
}
.widget .header .select {
  border-bottom: 2px solid #0d6efd;
}

.auth__warning {
  padding: 0 1.5rem 0 1.5rem;
  .auth__activate {
    position: relative;
    background: #f6f6f6;
    border: 2px solid rgba(0, 0, 0, 0.125);
    border-radius: 10px;
    margin-top: 20%;
    padding: 10% 10% 5% 10%;
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
  font-size: 1rem;
  color: #777777;
}
.btn-pill {
  font-size: 0.9rem;
  background: #0d6efd;
  color: #ffffff;
  height: 2rem;
  outline: none;
  border: none;
  border-radius: 1rem;
  -webkit-box-shadow: 0px 1px 3px rgba(126, 142, 177, 0.2);
  box-shadow: 0 1px 3px rgba(126, 142, 177, 0.2);
  &:hover {
    background: #0167ff;
    transition: transform 0.15s, background 0.15s;
    -webkit-transform: scale(1.03);
    transform: scale(1.03);
    -webkit-box-shadow: 0px 1px 3px rgba(126, 142, 177, 0.2);
    box-shadow: 0px 1px 3px rgba(126, 142, 177, 0.2);
  }
}
.form-control-sm {
  height: calc(1.5em + 0.5rem + 2px);
  //   padding: 0.25rem 0.5rem;
  /* color: #495057; */
  font-size: 0.875rem;
  line-height: 1.5;
  // border-radius: 0.2rem;
  /* border: 1px solid #ced4da; */
  // border: none;
  border-radius: 1rem;
  padding: 0.25rem 1rem;
  appearance: none;
  background-color: #fff;
  background-clip: padding-box;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.tooltip {
  position: relative;
  display: inline-block;
  // border-bottom: 1px dotted black;
  .tooltip-top {
    @include tooltip-position;
    bottom: 125%;
    left: 50%;
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
    top: 135%;
    left: 50%;
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
    top: -5px;
    left: 125%;
    &::after {
      top: 50%;
      right: 100%;
      margin-top: -0.5rem;
      border-color: transparent #555 transparent transparent;
    }
  }
  .tooltip-left {
    @include tooltip-position;
    top: -5px;
    bottom: auto;
    right: 128%;
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
</style>