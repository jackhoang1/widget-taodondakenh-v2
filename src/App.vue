<template>
  <div class>
    <!-- Xác thực App -->
    <div v-if="!isOAuth" class="auth">
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

    <div v-if="isOAuth" class="widget">
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
    <div v-if="isOAuth&&is_warning" class="container">
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

const ApiBase = "https://app.devchatbox.tk"; //dev
// const ApiBase = "https://chatbox-app.botbanhang.vn";	//product

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
  data() {
    return {
      isOAuth: false,
      is_warning: false,
      // secretKey: '2dd3816056a04c70ad154d3943bb16bd', //product
      // secretKey: '2218ef13a45c4fd9ade2d049db2ef6f1', //demo-product
      secretKey: "6e6d71d51a234aec9cde5f7748dd9e78", //dev
      access_token: access_token,
      is_select: "list",

      cms_account: "",
      cms_password: "",

      overlaySign: true,
      show_list_store: false,
      list_store: [],

      store_token: "",
      payload: {
        mid: "",
        token_bbh: "",
        delivery_token: "",
        payment_token: "",
        access_token_shipping: "",
        delivery_platform_type: "",
        name: "",
        phone: "",
        email: "",
      },
    };
  },
  computed: {
    isSelectList() {
      return this.is_select === "list";
    },
  },
  components: {
    ListOrder,
    CreateOrder,
  },
  methods: {
    async runSignIn() {
      try {
        // Call Api Đăng nhập CMS
        let path = "https://api.botup.io/v1/auth/sign-in";
        let body = {
          email: this.cms_account,
          password: this.cms_password,
        };
        let signIn = await Restful.post(path, body);
        let user = {};
        if (signIn.data && signIn.data.data && signIn.data.data.user) {
          user = signIn.data.data.user;
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
    handleChooseStore(item) {
      console.log("999999999999999", item);
      localStorage.removeItem("order_delivery_token");
      localStorage.removeItem("order_payment_token");
      this.store_token = item.access_token;
      if (item.delivery_token) {
        this.payload.delivery_token = item.delivery_token;
        localStorage.setItem("order_delivery_token", item.delivery_token);
      }
      if (item.payment_token) {
        this.payload.payment_token = item.payment_token;
        localStorage.setItem("order_payment_token", item.payment_token);
      }

      this.runOAuth();
    },
    async runOAuth() {
      try {
        // Call Api xác thực khi chọn Store và lưu lại Token
        let token_partner = this.store_token;
        console.log(token_partner);
        let body = {
          _type: "oauth-access-token",
          access_token: this.access_token,
          token_partner,
        };

        // Xác thực Widget
        let Oauth = await Restful.post(
          `${ApiBase}/v1/app/app-installed/update`,
          body
        );
        console.log("Oauth", Oauth);
        if (Oauth) {
          this.isCompleteAuth = true;
          Toast2.fire({
            icon: "success",
            title: "Xác thực thành công",
          });
          window.close();
        }
      } catch (e) {
        console.log(e);
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
    handlePaymentToken() {
      let payment_token = localStorage.getItem("order_payment_token");
      if (!payment_token) return;
      this.payload.payment_token = payment_token;
    },
    async handleDeliveryToken() {
      try {
        let path = `${APICMS}/v1/selling-page/delivery/delivery_response_info`;
        let headers = { Authorization: this.store_token };

        let get_delivery_token = await Restful.post(path, {}, {}, headers);
        if (
          get_delivery_token &&
          get_delivery_token.data &&
          get_delivery_token.data.data &&
          get_delivery_token.data.code == 200
        ) {
          this.payload.delivery_platform_type =
            get_delivery_token.data.data
          console.log(
            "this.payload.delivery_platform_type",
            this.payload.delivery_platform_type
          );
        }
        console.log("payload", this.payload);
      } catch (e) {
        console.log(e);
        this.swalToast("Đã xảy ra lỗi, vui lòng kích hoạt lại", "error");
      }
    },
  },

  async created() {
    try {
      console.log("creeeee apppp");
      let body = {
        access_token: this.access_token,
        secret_key: this.secretKey,
      };

      // Check trạng thái Xác thực của Widget
      let get_customer_info = await Restful.post(
        `${ApiBase}/v1/service/partner-authenticate`,
        body
      );
      if (
        get_customer_info &&
        get_customer_info.data &&
        get_customer_info.data.succes &&
        get_customer_info.data.code == 200 &&
        get_customer_info.data.data
      ) {
        this.isOAuth = true;
        let cus = get_customer_info.data.data;
        if (cus.public_profile) {
          this.store_token = cus.public_profile.token_partner;
          this.payload.name = cus.public_profile.client_name;
          this.payload.mid = cus.public_profile.fb_client_id;
        }
        if (cus.conversation_chatbot) {
          this.payload.token_bbh = cus.conversation_chatbot.bbh_public_token;
        }
        if (cus.conversation_contact && cus.conversation_contact.client_email) {
          this.payload.email = cus.conversation_contact.client_email;
        }
        if (cus.conversation_contact && cus.conversation_contact.client_phone) {
          this.payload.phone = cus.conversation_contact.client_phone;
          this.payload.phone = this.payload.phone
            .split(".")
            .join("")
            .split(" ")
            .join("");
        }
        this.handleDeliveryToken();
        this.handlePaymentToken();
        console.log("info cus", get_customer_info);
      }
    } catch (error) {
      // Chạy vào SignIn
      this.overlaySign = false;
      this.isOAuth = false;
      console.log("info err", error);
    }
  },
};
</script>

<style lang="scss">
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

html {
  font-size: 13px;
}
body::-webkit-scrollbar {
  display: none;
}
.disable-scroll {
  overflow: hidden;
  height: 100vh;
}
body > div {
  margin: 0;
  padding: 0;
}
p {
  margin-top: 0;
  margin-bottom: 1rem;
}
button {
  border-radius: 0;
}
hr {
  opacity: 0.5;
}
// button:focus {
//   outline: 1px dotted;
//   outline: 5px auto -webkit-focus-ring-color;
// }
input,
button,
select,
textarea {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  padding: 0 10px 0 10px;
  border-radius: 1rem;
}
button,
input {
  overflow: visible;
}
button,
select {
  text-transform: none;
}
select {
  word-wrap: normal;
}
button {
  -webkit-appearance: button;
}
button:not(:disabled) {
  cursor: pointer;
}
textarea {
  resize: vertical;
}
img {
  vertical-align: middle;
}

/* Auth ---- */
.auth {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
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
    }
    button {
      font-weight: bold;
      box-shadow: 0 5px 15px 0 #007bff30;
      transition: all 0.5s;
      border-radius: 25px;
      padding: 10px 40px;
      margin-top: 20px;
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
      padding: 15px 10px;
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
.auth__activate {
  position: relative;
  background: #f6f6f6;
  border: 2px solid rgba(0, 0, 0, 0.125);
  border-radius: 10px;
  margin-top: 20%;
  padding: 10% 10% 5% 10%;
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
</style>